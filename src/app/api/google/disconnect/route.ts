
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { google } from 'googleapis';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        // Optional: Stop Channel if we can find active one
        // We need token to stop channel though? Or just call stop with channel id/resource id?
        // Google require auth to stop channel.

        // 1. Get Token
        let tokenData = null;
        const newRef = doc(db, 'users', userId, 'integrations', 'google');
        const newSnap = await getDoc(newRef);
        if (newSnap.exists()) tokenData = newSnap.data();
        else {
            const oldRef = doc(db, 'calendarTokens', userId);
            const oldSnap = await getDoc(oldRef);
            if (oldSnap.exists()) tokenData = oldSnap.data();
        }

        if (tokenData) {
            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET
            );
            oauth2Client.setCredentials({
                access_token: tokenData.accessToken,
                refresh_token: tokenData.refreshToken
            });
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

            // Find active channels for this user
            const q = query(collection(db, 'calendarChannels'), where('userId', '==', userId));
            const channelsSnap = await getDocs(q);

            for (const docSnap of channelsSnap.docs) {
                const channel = docSnap.data();
                try {
                    await calendar.channels.stop({
                        requestBody: {
                            id: channel.channelId,
                            resourceId: channel.resourceId
                        }
                    });
                } catch (e) {
                    console.error("Error stopping channel", channel.channelId, e);
                }
                await deleteDoc(docSnap.ref);
            }
        }

        // 2. Delete Tokens
        await deleteDoc(doc(db, 'users', userId, 'integrations', 'google')); // New
        await deleteDoc(doc(db, 'calendarTokens', userId)); // Legacy

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Disconnect Error:", error);
        return NextResponse.json({ message: error.message || 'Disconnect failed' }, { status: 500 });
    }
}
