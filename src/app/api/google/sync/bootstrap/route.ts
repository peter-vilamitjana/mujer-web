import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { google } from 'googleapis';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from '@/lib/auth';

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.uid as string | undefined;

  if (!session || !userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // 1. Get Access Token via Admin SDK
  const newSnap = await adminDb.doc(`users/${userId}/integrations/google`).get();
  let tokenData = newSnap.exists ? newSnap.data() : null;
  if (!tokenData) {
    const oldSnap = await adminDb.doc(`calendarTokens/${userId}`).get();
    if (oldSnap.exists) tokenData = oldSnap.data()!;
  }

  if (!tokenData) {
    return NextResponse.json(
      { message: 'No Google Calendar token found. Please connect first.' },
      { status: 400 },
    );
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

    // 2. Create Watch Channel
    const channelId = uuidv4();
    const domain = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'https://mujer-web.vercel.app';

    const response = await calendar.events.watch({
      calendarId: 'primary',
      requestBody: {
        id:      channelId,
        type:    'web_hook',
        address: `${domain}/api/google/webhook`,
      },
    });

    // 3. Store Channel Info via Admin SDK
    await adminDb.collection('calendarChannels').add({
      channelId:  channelId,
      resourceId: response.data.resourceId,
      userId,
      expiration: response.data.expiration,
      createdAt:  FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, channelId });
  } catch (error: any) {
    console.error('[google/sync/bootstrap]', error);
    return NextResponse.json({ message: error.message || 'Sync setup failed' }, { status: 500 });
  }
}
