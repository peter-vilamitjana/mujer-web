'use server';

import {
  collection, doc, setDoc, getDoc, serverTimestamp, Timestamp, query, where, limit, getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { buildConfirmationMessage } from '@/lib/whatsapp-templates';

export interface GuestBookingPayload {
  tenantId: string;
  tenantSlug: string;
  staffId: string;
  staffName: string;
  serviceIds: string[];
  serviceNames: string;
  date: string;        // ISO string
  time: string;        // 'HH:MM'
  totalFrom: number;
  durationMinutes: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

async function getDefaultBranchId(tenantId: string): Promise<string> {
  const branchesRef = collection(db, 'tenants', tenantId, 'branches');
  const q = query(branchesRef, where('active', '==', true), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;
  const allSnap = await getDocs(query(branchesRef, limit(1)));
  return allSnap.empty ? 'default' : allSnap.docs[0].id;
}

export async function createGuestBooking(
  payload: GuestBookingPayload
): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
  try {
    const tenantSnap = await getDoc(doc(db, 'tenants', payload.tenantId));
    if (!tenantSnap.exists() || tenantSnap.data().isActivePublicly !== true) {
      return { success: false, error: 'Este salón no está disponible para reservas.' };
    }
    const tenantName: string = tenantSnap.data().name ?? 'tu salón';

    const [hour, minute] = payload.time.split(':').map(Number);
    const appointmentDateTime = new Date(payload.date);
    appointmentDateTime.setHours(hour, minute, 0, 0);

    const appointmentRef = doc(collection(db, 'tenants', payload.tenantId, 'appointments'));
    await setDoc(appointmentRef, {
      id: appointmentRef.id,
      tenantId: payload.tenantId,
      branchId: await getDefaultBranchId(payload.tenantId),
      clientId: null,
      clientName: payload.guestName,
      staffId: payload.staffId,
      staffName: payload.staffName,
      serviceIds: payload.serviceIds,
      serviceNames: payload.serviceNames,
      date: Timestamp.fromDate(appointmentDateTime),
      durationMinutes: payload.durationMinutes,
      status: 'pending',
      priceEstimated: payload.totalFrom,
      depositAmount: 0,
      depositPaid: false,
      createdAt: serverTimestamp(),
      createdBy: 'guest',
      source: 'marketplace',
      isGuestBooking: true,
      guestEmail: payload.guestEmail,
      guestPhone: payload.guestPhone,
      notes: '',
    });

    // WhatsApp confirmation — non-blocking
    sendWhatsAppMessage(
      buildConfirmationMessage({
        clientName: payload.guestName,
        salonName: tenantName,
        date: appointmentDateTime.toLocaleDateString('es-AR', {
          weekday: 'long', day: 'numeric', month: 'long',
        }),
        time: payload.time,
        serviceName: payload.serviceNames,
        staffName: payload.staffName,
        clientPhone: payload.guestPhone,
      })
    ).catch((err) => console.error('[createGuestBooking] WhatsApp failed:', err));

    return { success: true, appointmentId: appointmentRef.id };
  } catch (error) {
    console.error('[createGuestBooking] Error:', error);
    return { success: false, error: 'No se pudo crear el turno. Intentá de nuevo.' };
  }
}
