'use server';

import { doc, updateDoc, serverTimestamp, getDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { PaymentMethod, AppointmentStatus } from '@/lib/schema';

interface CheckoutPayload {
    amountPaid: number;
    paymentMethod: PaymentMethod;
    commissionCalculated?: number;
}

export async function closeAppointment(
    tenantId: string,
    appointmentId: string,
    payload: CheckoutPayload
): Promise<{ success: boolean; error?: string }> {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { success: false, error: 'No autorizado' };
    }

    const uid = (session.user as { uid?: string }).uid;
    if (!uid) {
        return { success: false, error: 'Sesión inválida.' };
    }

    if (!Number.isFinite(payload.amountPaid) || payload.amountPaid < 0) {
        return { success: false, error: 'Monto inválido.' };
    }

    const status: AppointmentStatus = 'cobrado';

    // TODO: verify caller belongs to tenantId (cross-codebase RBAC gap — tracked separately)
    try {
        const appointmentRef = doc(db, 'tenants', tenantId, 'appointments', appointmentId);
        const snap = await getDoc(appointmentRef);
        if (!snap.exists()) {
            return { success: false, error: 'Turno no encontrado.' };
        }
        if (snap.data()?.status === 'cobrado') {
            return { success: false, error: 'Este turno ya fue cobrado.' };
        }
        const appointmentData = snap.data();
        await updateDoc(appointmentRef, {
            status,
            amountPaid: payload.amountPaid,
            paymentMethod: payload.paymentMethod,
            commissionCalculated: payload.commissionCalculated ?? null,
            checkoutAt: serverTimestamp(),
            checkoutBy: uid,
        });

        // Increment customer metrics on checkout
        if (appointmentData.clientId) {
            const customerRef = doc(db, 'tenants', tenantId, 'customers', appointmentData.clientId);
            await updateDoc(customerRef, {
                'metrics.totalVisits': increment(1),
                'metrics.totalSpent': increment(payload.amountPaid),
                'metrics.lastVisit': serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }

        return { success: true };
    } catch (err) {
        console.error('[closeAppointment]', err);
        return { success: false, error: 'No se pudo cerrar el turno.' };
    }
}
