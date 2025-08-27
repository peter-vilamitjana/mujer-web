
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { google } from 'googleapis';
import type { Turno } from '@/lib/types';

// Function to get a valid access token, refreshing if necessary
async function getValidToken(adminUid: string) {
    const tokenRef = doc(db, 'calendarTokens', adminUid);
    const tokenSnap = await getDocs(query(collection(db, 'calendarTokens'), where('__name__', '==', adminUid)));
    
    if (tokenSnap.empty) {
        throw new Error('Admin token not found');
    }

    let tokenData = tokenSnap.docs[0].data();

    if (Date.now() >= tokenData.expiryDate) {
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

        const newTokens = await res.json();
        if (!res.ok) {
            throw new Error('Failed to refresh token');
        }
        
        tokenData = {
            ...tokenData,
            accessToken: newTokens.access_token,
            expiryDate: Date.now() + newTokens.expires_in * 1000,
        };

        await updateDoc(doc(db, 'calendarTokens', adminUid), {
            accessToken: tokenData.accessToken,
            expiryDate: tokenData.expiryDate,
        });
    }

    return tokenData.accessToken;
}

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
        const q = query(collection(db, 'calendarChannels'));
        const channelSnap = await getDocs(q);
        if (channelSnap.empty) {
            console.warn('No active channel found for webhook notification.');
            return NextResponse.json({ message: 'No active channel' }, { status: 200 });
        }
        const adminUid = channelSnap.docs[0].id;
        const channelData = channelSnap.docs[0].data();

        if (channelData.channelId !== channelId || channelData.resourceId !== resourceId) {
             console.warn('Webhook notification for an unknown channel received.');
             return NextResponse.json({ message: 'Unknown channel' }, { status: 400 });
        }
        
        const settingsRef = doc(db, `settings/calendar/${adminUid}`);
        const settingsSnap = await getDocs(query(collection(db, `settings/calendar`), where('__name__', '==', adminUid)));
        
        const syncToken = settingsSnap.empty ? null : settingsSnap.docs[0].data().nextSyncToken;
        const accessToken = await getValidToken(adminUid);
        
        const calendar = google.calendar({ version: 'v3', auth: new google.auth.OAuth2() });
         calendar.context._options.headers = { Authorization: `Bearer ${accessToken}` };
        
        const eventsRes = await calendar.events.list({
            calendarId: 'primary',
            syncToken: syncToken,
        });
        
        const events = eventsRes.data.items || [];
        for (const event of events) {
            const eventId = event.id;
            const appointmentId = event.extendedProperties?.private?.appointmentId;
            let turnoQuery;

            if (appointmentId) {
                turnoQuery = query(collection(db, 'turnos'), where('id', '==', appointmentId));
            } else {
                 turnoQuery = query(collection(db, 'turnos'), where('googleEventId', '==', eventId));
            }
            
            const turnoSnap = await getDocs(turnoQuery);

            if (event.status === 'cancelled') {
                if (!turnoSnap.empty) {
                    const turnoDoc = turnoSnap.docs[0];
                    await updateDoc(turnoDoc.ref, { estado: 'cancelado', source: 'google' });
                }
            } else {
                 const newTurnoData = {
                    clienteNombre: event.summary || 'Sin Título',
                    servicio: event.description || 'Sin Descripción',
                    fecha: event.start?.dateTime || new Date().toISOString(),
                    estado: 'pendiente',
                    empleadaNombre: 'Google Calendar', // Or parse from attendees
                    googleEventId: eventId,
                    source: 'google'
                    // other fields would need mapping or defaults
                 };

                 if (!turnoSnap.empty) {
                     const turnoDoc = turnoSnap.docs[0];
                     await updateDoc(turnoDoc.ref, newTurnoData);
                 } else {
                     // Could create a new appointment if it doesn't exist
                     // For now, we only update existing ones
                 }
            }
        }
        
        if (eventsRes.data.nextSyncToken) {
             await setDoc(settingsRef, { nextSyncToken: eventsRes.data.nextSyncToken }, { merge: true });
        }

    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
}

