import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { google } from 'googleapis';
import { adminDb } from '@/lib/firebase-admin';
import { authOptions } from '@/lib/auth';

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.uid as string | undefined;

  if (!session || !userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Read token to revoke active Google Calendar channel
    const newSnap = await adminDb.doc(`users/${userId}/integrations/google`).get();
    const oldSnap = await adminDb.doc(`calendarTokens/${userId}`).get();
    const tokenData = newSnap.exists ? newSnap.data() : (oldSnap.exists ? oldSnap.data() : null);

    if (tokenData) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
      );
      oauth2Client.setCredentials({
        access_token:  tokenData.accessToken,
        refresh_token: tokenData.refreshToken,
      });
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Stop all active push-notification channels for this user
      const channelsSnap = await adminDb
        .collection('calendarChannels')
        .where('userId', '==', userId)
        .get();

      await Promise.all(
        channelsSnap.docs.map(async (docSnap) => {
          const channel = docSnap.data();
          try {
            await calendar.channels.stop({
              requestBody: { id: channel.channelId, resourceId: channel.resourceId },
            });
          } catch (e) {
            console.error('[google/disconnect] Error stopping channel', channel.channelId, e);
          }
          await docSnap.ref.delete();
        }),
      );
    }

    // 2. Delete tokens from both paths
    await Promise.all([
      adminDb.doc(`users/${userId}/integrations/google`).delete(),
      adminDb.doc(`calendarTokens/${userId}`).delete(),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[google/disconnect]', error);
    return NextResponse.json({ message: error.message || 'Disconnect failed' }, { status: 500 });
  }
}
