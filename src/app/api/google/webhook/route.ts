
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { google } from 'googleapis';
import type { Turno } from '@/lib/types';
import { getSession } from 'next-auth/react';
import { getToken } from 'next-auth/jwt';

// This is a simplified token store. In a real app, you'd want this to be more robust.
// For this example, we assume there's only one admin user whose tokens we manage.
const getAdminTokens = async () => {
    // In a real app, you might query for the admin user's doc.
    // For this example, let's assume we know the admin's UID or have a single doc.
    const q = query(collection(db, 'calendarTokens'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const adminDoc = snapshot.docs[0];
    return { id: adminDoc.id, ...adminDoc.data() };
};

const refreshAccessToken = async (tokenId: string, refreshToken: string) => {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
    });

    const newTokens = await res.json();
    if (!response.ok) {
        console.error("Failed to refresh access token", newTokens);
        throw new Error('Failed to refresh token');
    }
    
    const expiryDate = Date.now() + newTokens.expires_in * 1000;
    
    await setDoc(doc(db, 'calendarTokens', tokenId), {
        accessToken: newTokens.access_token,
        expiryDate: expiryDate,
    }, { merge: true });

    return { accessToken: newTokens.access_token, expiryDate };
};


async function getValidTokenForAdmin() {
    const tokenData = await getAdminTokens();
    if (!tokenData) throw new Error('Admin token not found');

    if (Date.now() >= (tokenData.expiryDate || 0)) {
        console.log("Refreshing expired token...");
        const refreshed = await refreshAccessToken(tokenData.id, tokenData.refreshToken);
        return refreshed.accessToken;
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
        
        const channelDoc = channelSnap.docs[0];
        const channelData = channelDoc.data();

        if (channelData.channelId !== channelId || channelData.resourceId !== resourceId) {
             console.warn('Webhook notification for an unknown channel received.');
             return NextResponse.json({ message: 'Unknown channel' }, { status: 400 });
        }
        
        const settingsRef = doc(db, `settings/calendar/${channelDoc.id}`);
        const settingsSnap = await getDocs(query(collection(db, `settings/calendar`), where('__name__', '==', channelDoc.id)));
        
        const syncToken = settingsSnap.empty ? null : settingsSnap.docs[0].data().nextSyncToken;
        const accessToken = await getValidTokenForAdmin();
        
        const calendar = google.calendar({ version: 'v3' });
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
