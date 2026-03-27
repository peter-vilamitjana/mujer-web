
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { google } from 'googleapis';
import type { Turno } from '@/lib/types';
import { getToken } from 'next-auth/jwt';




export async function POST(req: NextRequest) {
    const headers = req.headers;
    const channelId = headers.get('x-goog-channel-id');
    const resourceId = headers.get('x-goog-resource-id');
    const resourceState = headers.get('x-goog-resource-state');

    console.log(`Received webhook notification: channelId=${channelId}, resourceId=${resourceId}, state=${resourceState}`);

    if (resourceState === 'sync') {
        return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    try {
        // 1. Identify User & Channel
        const q = query(collection(db, 'calendarChannels'), where('channelId', '==', channelId));
        const channelSnap = await getDocs(q);

        if (channelSnap.empty) {
            console.warn('No active channel found for webhook notification.');
            return NextResponse.json({ message: 'No active channel' }, { status: 200 });
        }

        const channelDoc = channelSnap.docs[0];
        const channelData = channelDoc.data();
        const userId = channelData.userId; // Critical link

        if (channelData.resourceId !== resourceId) {
            console.warn('Webhook resourceId mismatch.');
            // Continue anyway or return? Google sometimes changes resourceId? strict check usually good.
            // return NextResponse.json({ message: 'Mismatch' }, { status: 400 });
        }

        // 2. Identify Tenant (User -> Tenant)
        let targetTenant = null;

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.salonId) targetTenant = userData.salonId;
        } else {
            // Fallback Legacy check
            const legacyUserSnap = await getDoc(doc(db, 'usuarios', userId));
            if (legacyUserSnap.exists() && legacyUserSnap.data().salonId) {
                targetTenant = legacyUserSnap.data().salonId;
            }
        }

        if (!targetTenant) {
            const membershipsSnap = await getDocs(collection(db, 'users', userId, 'memberships'));
            if (!membershipsSnap.empty) {
                targetTenant = membershipsSnap.docs[0].id;
            }
        }

        if (!targetTenant) {
            console.warn('Webhook no tenant linked for user.');
            return NextResponse.json({ message: 'No tenant' }, { status: 400 });
        }
        
        const tenantId = targetTenant;

        // 3. Get Tokens (New Path -> Old Path)
        let tokenData = null;
        if (userSnap.exists()) {
            const tokenSnap = await getDoc(doc(db, 'users', userId, 'integrations', 'google'));
            if (tokenSnap.exists()) tokenData = tokenSnap.data();
        }

        if (!tokenData) {
            const oldTokenSnap = await getDoc(doc(db, 'calendarTokens', userId));
            if (oldTokenSnap.exists()) tokenData = oldTokenSnap.data();
        }

        if (!tokenData) {
            console.error('No token found for user', userId);
            return NextResponse.json({ message: 'Token missing' }, { status: 200 }); // 200 to stop retry?
        }

        // Refresh if needed
        let accessToken = tokenData.accessToken;
        if (Date.now() >= (tokenData.expiryDate || 0)) {
            // We need to refresh. Re-implement refresh here or import?
            // Importing from libs is better but for now let's use the logic inline or shared helper
            // Ideally we'd use oauth2Client.refreshAccessToken() but we need client secret etc.
            // Let's use the RefreshUrl approach
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: process.env.GOOGLE_CLIENT_ID!,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                    refresh_token: tokenData.refreshToken,
                    grant_type: 'refresh_token',
                }),
            });
            const newTokens = await response.json();
            if (response.ok) {
                accessToken = newTokens.access_token;
                const expiry = Date.now() + newTokens.expires_in * 1000;
                // Update DB
                await setDoc(doc(db, 'users', userId, 'integrations', 'google'), {
                    accessToken, expiryDate: expiry
                }, { merge: true });
                // Update Legacy too for safety
                await setDoc(doc(db, 'calendarTokens', userId), {
                    accessToken, expiryDate: expiry
                }, { merge: true });
            }
        }

        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // 4. Sync Events
        // Retrieve sync token from settings (scoped by channelId)
        const settingsQuery = query(collection(db, 'settings'), where('channelId', '==', channelId));
        const settingsSnap = await getDocs(settingsQuery);
        let syncToken = null;
        let settingsRef = null;

        if (!settingsSnap.empty) {
            settingsRef = settingsSnap.docs[0].ref;
            syncToken = settingsSnap.docs[0].data().nextSyncToken;
        } else {
            const newRef = await addDoc(collection(db, 'settings'), { channelId });
            settingsRef = newRef;
        }

        const eventsRes = await calendar.events.list({
            auth: oauth2Client,
            calendarId: 'primary',
            syncToken: syncToken,
            singleEvents: true,
        });

        const events = eventsRes.data.items || [];

        // 5. Update Appointments in Tenant Collection
        for (const event of events) {
            const eventId = event.id;
            if (!eventId) continue;

            const appointmentId = event.extendedProperties?.private?.appointmentId;
            let turnoQuery;
            const appointmentsRef = collection(db, 'tenants', tenantId, 'appointments');

            if (appointmentId) {
                turnoQuery = query(appointmentsRef, where('id', '==', appointmentId));
            } else {
                turnoQuery = query(appointmentsRef, where('googleEventId', '==', eventId));
            }

            const turnoSnap = await getDocs(turnoQuery);

            if (event.status === 'cancelled') {
                if (!turnoSnap.empty) {
                    const turnoDoc = turnoSnap.docs[0];
                    await updateDoc(turnoDoc.ref, { status: 'cancelled', source: 'google' }); // status field name in schema is 'status' (completed/cancelled)
                }
            } else {
                // Map Google Event to Appointment Schema
                const newTurnoData = {
                    clientName: event.summary || 'Sin Título', // Schema uses clientName
                    serviceNames: event.description || '', // Schema uses serviceNames
                    date: event.start?.dateTime ? Timestamp.fromDate(new Date(event.start.dateTime)) : serverTimestamp(), // Schema uses date (Timestamp)
                    status: 'pending',
                    staffName: 'Google Calendar', // Indicator
                    googleEventId: eventId,
                    source: 'google',
                    updatedAt: serverTimestamp()
                };

                if (!turnoSnap.empty) {
                    const turnoDoc = turnoSnap.docs[0];
                    await updateDoc(turnoDoc.ref, newTurnoData);
                } else {
                    // Optional: Create new appointment from Google Event?
                    // User didn't ask for this explicitly, but it's good sync practice.
                    // For now, only update existing to avoid spamming the system with personal events.
                }
            }
        }

        if (eventsRes.data.nextSyncToken && settingsRef) {
            await setDoc(settingsRef, { nextSyncToken: eventsRes.data.nextSyncToken }, { merge: true });
        }

    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
}
