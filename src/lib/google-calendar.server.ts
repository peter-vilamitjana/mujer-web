/**
 * google-calendar.server.ts
 * Server-side helper for Google Calendar sync.
 * Timezone: America/Argentina/Buenos_Aires siempre.
 * Si el staff no tiene GCal conectado → ignora silenciosamente.
 */

import { google } from 'googleapis';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TIMEZONE = 'America/Argentina/Buenos_Aires';

interface StaffTokenData {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
}

async function getStaffTokens(staffUserId: string): Promise<StaffTokenData | null> {
  try {
    // Try new path first
    const newSnap = await getDoc(doc(db, 'users', staffUserId, 'integrations', 'google'));
    if (newSnap.exists()) return newSnap.data() as StaffTokenData;
    // Fallback legacy path
    const oldSnap = await getDoc(doc(db, 'calendarTokens', staffUserId));
    if (oldSnap.exists()) return oldSnap.data() as StaffTokenData;
    return null;
  } catch {
    return null;
  }
}

async function refreshTokenIfNeeded(staffUserId: string, tokenData: StaffTokenData): Promise<string> {
  if (Date.now() < (tokenData.expiryDate ?? 0) - 60_000) {
    return tokenData.accessToken;
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: tokenData.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    console.error('[google-calendar] Token refresh failed');
    return tokenData.accessToken;
  }

  const json = await res.json();
  const newExpiry = Date.now() + json.expires_in * 1000;
  const updatedTokens = { accessToken: json.access_token, expiryDate: newExpiry };

  // Persist refreshed token
  await setDoc(doc(db, 'users', staffUserId, 'integrations', 'google'), updatedTokens, { merge: true });
  await setDoc(doc(db, 'calendarTokens', staffUserId), updatedTokens, { merge: true });

  return json.access_token;
}

export interface CalendarEventInput {
  appointmentId: string;
  clientName: string;
  serviceNames: string;
  startDate: Date;
  durationMinutes: number;
  staffUserId: string;
  staffName: string;
  notes?: string;
}

/**
 * Creates a Google Calendar event for the staff member.
 * Returns the created event ID, or null if staff has no GCal connected.
 */
export async function createCalendarEvent(input: CalendarEventInput): Promise<string | null> {
  const tokenData = await getStaffTokens(input.staffUserId);
  if (!tokenData) {
    // Staff doesn't have Google Calendar connected — skip silently
    return null;
  }

  try {
    const accessToken = await refreshTokenIfNeeded(input.staffUserId, tokenData);
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const endDate = new Date(input.startDate.getTime() + input.durationMinutes * 60_000);

    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `${input.clientName} — ${input.serviceNames}`,
        description: `Turno reservado en MujerApp\nCliente: ${input.clientName}\nServicios: ${input.serviceNames}${input.notes ? `\nNotas: ${input.notes}` : ''}`,
        start: { dateTime: input.startDate.toISOString(), timeZone: TIMEZONE },
        end: { dateTime: endDate.toISOString(), timeZone: TIMEZONE },
        extendedProperties: {
          private: { appointmentId: input.appointmentId, source: 'mujerapp' },
        },
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 30 }],
        },
      },
    });

    return event.data.id ?? null;
  } catch (err) {
    // Log but don't throw — calendar sync is best-effort
    console.error('[google-calendar] createCalendarEvent error:', err);
    return null;
  }
}

/**
 * Deletes or cancels a Google Calendar event.
 * Safe to call even if event doesn't exist.
 */
export async function deleteCalendarEvent(staffUserId: string, googleEventId: string): Promise<void> {
  const tokenData = await getStaffTokens(staffUserId);
  if (!tokenData) return;

  try {
    const accessToken = await refreshTokenIfNeeded(staffUserId, tokenData);
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({ calendarId: 'primary', eventId: googleEventId });
  } catch (err: unknown) {
    // 404 = event already deleted — ignore
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 404) return;
    console.error('[google-calendar] deleteCalendarEvent error:', err);
  }
}
