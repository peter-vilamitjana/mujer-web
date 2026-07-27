import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Rate limit: 120 requests/min per IP (Google puede enviar bursts en calendarios activos)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (!rateLimit(`gcal-webhook:${ip}`, 120)) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  const headers = req.headers;
  const channelId    = headers.get('x-goog-channel-id');
  const resourceId   = headers.get('x-goog-resource-id');
  const resourceState = headers.get('x-goog-resource-state');

  console.log(`[GCal Webhook] channelId=${channelId} resourceId=${resourceId} state=${resourceState}`);

  if (resourceState === 'sync') {
    return NextResponse.json({ status: 'ok' });
  }

  try {
    // 1. Identificar canal y usuario
    const channelSnap = await adminDb
      .collection('calendarChannels')
      .where('channelId', '==', channelId)
      .limit(1)
      .get();

    if (channelSnap.empty) {
      console.warn('[GCal Webhook] Canal no encontrado:', channelId);
      return NextResponse.json({ message: 'No active channel' });
    }

    const channelDoc  = channelSnap.docs[0];
    const channelData = channelDoc.data();
    const userId      = channelData.userId as string;

    // Verificar token de canal que Google devuelve
    const receivedToken = headers.get('x-goog-channel-token');
    if (channelData.token && receivedToken !== channelData.token) {
      console.warn('[GCal Webhook] Token mismatch — request rechazado');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (channelData.resourceId !== resourceId) {
      console.warn('[GCal Webhook] resourceId mismatch');
    }

    // 2. Identificar Tenant del usuario
    let tenantId: string | null = null;

    const userSnap = await adminDb.doc(`users/${userId}`).get();
    if (userSnap.exists) {
      const userData = userSnap.data()!;
      if (userData.salonId) tenantId = userData.salonId;
    }

    if (!tenantId) {
      const membershipsSnap = await adminDb
        .collection(`users/${userId}/memberships`)
        .limit(1)
        .get();
      if (!membershipsSnap.empty) tenantId = membershipsSnap.docs[0].id;
    }

    if (!tenantId) {
      console.warn('[GCal Webhook] Sin tenant para userId:', userId);
      return NextResponse.json({ message: 'No tenant' }, { status: 400 });
    }

    // 3. Obtener tokens OAuth (ruta nueva → fallback legacy)
    const tokenSnap = await adminDb.doc(`users/${userId}/integrations/google`).get();
    let tokenData = tokenSnap.exists ? tokenSnap.data()! : null;
    if (!tokenData) {
      const legacySnap = await adminDb.doc(`calendarTokens/${userId}`).get();
      if (legacySnap.exists) tokenData = legacySnap.data()!;
    }

    if (!tokenData) {
      console.error('[GCal Webhook] Token no encontrado para userId:', userId);
      return NextResponse.json({ message: 'Token missing' });
    }

    // 4. Refrescar token si expiró
    let accessToken = tokenData.accessToken as string;
    if (Date.now() >= (tokenData.expiryDate ?? 0)) {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id:     process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: tokenData.refreshToken,
          grant_type:    'refresh_token',
        }),
      });
      if (response.ok) {
        const newTokens = await response.json();
        accessToken = newTokens.access_token;
        const expiry = Date.now() + newTokens.expires_in * 1000;
        const refreshed = { accessToken, expiryDate: expiry };
        await Promise.all([
          adminDb.doc(`users/${userId}/integrations/google`).set(refreshed, { merge: true }),
          adminDb.doc(`calendarTokens/${userId}`).set(refreshed, { merge: true }),
        ]);
      }
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 5. Recuperar syncToken guardado para este canal
    const settingsSnap = await adminDb
      .collection('settings')
      .where('channelId', '==', channelId)
      .limit(1)
      .get();

    let syncToken: string | null = null;
    let settingsRef = settingsSnap.empty
      ? adminDb.collection('settings').doc()
      : settingsSnap.docs[0].ref;

    if (!settingsSnap.empty) {
      syncToken = settingsSnap.docs[0].data().nextSyncToken ?? null;
    } else {
      await settingsRef.set({ channelId });
    }

    const eventsRes = await calendar.events.list({
      calendarId:   'primary',
      syncToken:    syncToken ?? undefined,
      singleEvents: true,
    });

    const events = eventsRes.data.items ?? [];

    // 6. Sincronizar eventos con la colección de turnos del tenant
    const appointmentsCol = adminDb
      .collection('tenants').doc(tenantId)
      .collection('appointments');

    for (const event of events) {
      const eventId = event.id;
      if (!eventId) continue;

      const appointmentId = event.extendedProperties?.private?.appointmentId;

      const matchSnap = await (
        appointmentId
          ? appointmentsCol.where('id', '==', appointmentId).limit(1)
          : appointmentsCol.where('googleEventId', '==', eventId).limit(1)
      ).get();

      if (event.status === 'cancelled') {
        if (!matchSnap.empty) {
          await matchSnap.docs[0].ref.update({ status: 'cancelled', source: 'google' });
        }
      } else if (!matchSnap.empty) {
        const updateData: Record<string, any> = {
          clientName:   event.summary ?? 'Sin Título',
          serviceNames: event.description ?? '',
          status:       'pending',
          staffName:    'Google Calendar',
          googleEventId: eventId,
          source:       'google',
          updatedAt:    FieldValue.serverTimestamp(),
        };
        if (event.start?.dateTime) {
          updateData.date = Timestamp.fromDate(new Date(event.start.dateTime));
        }
        await matchSnap.docs[0].ref.update(updateData);
      }
    }

    if (eventsRes.data.nextSyncToken) {
      await settingsRef.set(
        { nextSyncToken: eventsRes.data.nextSyncToken },
        { merge: true },
      );
    }

  } catch (error) {
    console.error('[GCal Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json({ status: 'ok' });
}
