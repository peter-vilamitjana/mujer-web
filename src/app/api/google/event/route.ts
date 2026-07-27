import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { google } from 'googleapis';
import { adminDb } from '@/lib/firebase-admin';
import { authOptions } from '@/lib/auth';

export interface CreateEventBody {
  summary:       string;
  description?:  string;
  startIso:      string; // ISO 8601
  endIso:        string;
  colorId?:      string; // Google Calendar color 1-11
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.uid as string | undefined;

  if (!session || !userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body: CreateEventBody = await req.json();

  // Fetch token via Admin SDK
  const snap = await adminDb.doc(`users/${userId}/integrations/google`).get();
  let tokenData: Record<string, any> | null = snap.exists ? snap.data()! : null;
  if (!tokenData) {
    const legacySnap = await adminDb.doc(`calendarTokens/${userId}`).get();
    if (legacySnap.exists) tokenData = legacySnap.data()!;
  }

  if (!tokenData?.accessToken) {
    return NextResponse.json({ message: 'Google Calendar not connected' }, { status: 400 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
    oauth2Client.setCredentials({
      access_token:  tokenData.accessToken,
      refresh_token: tokenData.refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary:     body.summary,
        description: body.description,
        colorId:     body.colorId ?? '3',
        start: { dateTime: body.startIso, timeZone: 'America/Argentina/Buenos_Aires' },
        end:   { dateTime: body.endIso,   timeZone: 'America/Argentina/Buenos_Aires' },
      },
    });

    return NextResponse.json({ eventId: event.data.id, eventUrl: event.data.htmlLink });
  } catch (err: any) {
    console.error('[google/event]', err);
    return NextResponse.json({ message: err.message ?? 'Event creation failed' }, { status: 500 });
  }
}
