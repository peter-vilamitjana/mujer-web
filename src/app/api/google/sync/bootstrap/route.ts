
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { google } from 'googleapis';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id || (session.user as any).sub || '';

    // 1. Get Access Token
    // Try New Path first
    let tokenData = null;
    const newRef = doc(db, 'users', userId, 'integrations', 'google');
    const newSnap = await getDoc(newRef);

    if (newSnap.exists()) {
        tokenData = newSnap.data();
    } else {
        // Fallback Legacy
        const oldRef = doc(db, 'calendarTokens', userId);
        const oldSnap = await getDoc(oldRef);
        if (oldSnap.exists()) tokenData = oldSnap.data();
    }

    if (!tokenData) {
        return NextResponse.json({ message: 'No Google Calendar token found. Please connect first.' }, { status: 400 });
    }

    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials({
            access_token: tokenData.accessToken,
            refresh_token: tokenData.refreshToken
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // 2. Create Watch Channel
        const channelId = uuidv4();
        // Domain for webhook
        const domain = process.env.NEXT_PUBLIC_VERCEL_URL
            ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
            : 'https://mujer-web.vercel.app'; // Fallback or dev tunnel needed for local

        const response = await calendar.events.watch({
            calendarId: 'primary',
            requestBody: {
                id: channelId,
                type: 'web_hook',
                address: `${domain}/api/google/webhook`
            }
        });

        // 3. Store Channel Info (Linked to User!)
        await addDoc(collection(db, 'calendarChannels'), {
            channelId: channelId,
            resourceId: response.data.resourceId,
            userId: userId,
            createdAt: new Date(),
            expiration: response.data.expiration
        });

        return NextResponse.json({ success: true, channelId });

    } catch (error: any) {
        console.error("Bootstrap Error:", error);
        return NextResponse.json({ message: error.message || 'Sync setup failed' }, { status: 500 });
    }
}
