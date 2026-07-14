'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireRole } from '@/lib/auth-guards';
import type { PaymentMethod, PaymentSplit, AppointmentStatus } from '@/lib/schema';

export interface CheckoutPayload {
    amountPaid: number;
    paymentMethod: PaymentMethod;
    paymentMethods?: PaymentSplit;
    commissionCalculated?: number;
}

export async function closeAppointment(
    tenantId: string,
    appointmentId: string,
    payload: CheckoutPayload
): Promise<{ success: boolean; error?: string }> {
    let uid: string;
    try {
        ({ uid } = await requireRole(tenantId, ['admin', 'employee']));
    } catch {
        return { success: false, error: 'No autorizado.' };
    }

    if (!Number.isFinite(payload.amountPaid) || payload.amountPaid < 0) {
        return { success: false, error: 'Monto inválido.' };
    }

    const staffCommissionAmount = payload.commissionCalculated != null
        ? Math.round(payload.amountPaid * payload.commissionCalculated / 100)
        : null;

    const status: AppointmentStatus = 'cobrado';

    try {
        const appointmentRef = adminDb
            .collection('tenants').doc(tenantId)
            .collection('appointments').doc(appointmentId);
        const snap = await appointmentRef.get();
        if (!snap.exists) return { success: false, error: 'Turno no encontrado.' };
        if (snap.data()?.status === 'cobrado') return { success: false, error: 'Este turno ya fue cobrado.' };

        const appointmentData = snap.data()!;
        await appointmentRef.update({
            status,
            amountPaid: payload.amountPaid,
            paymentMethod: payload.paymentMethod,
            ...(payload.paymentMethods ? { paymentMethods: payload.paymentMethods } : {}),
            commissionCalculated: payload.commissionCalculated ?? null,
            ...(staffCommissionAmount != null ? { staffCommissionAmount } : {}),
            checkoutAt: FieldValue.serverTimestamp(),
            checkoutBy: uid,
        });

        if (appointmentData.clientId) {
            await adminDb
                .collection('tenants').doc(tenantId)
                .collection('customers').doc(appointmentData.clientId)
                .update({
                    'metrics.totalVisits': FieldValue.increment(1),
                    'metrics.totalSpent': FieldValue.increment(payload.amountPaid),
                    'metrics.lastVisit': FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp(),
                });
        }

        return { success: true };
    } catch (err) {
        console.error('[closeAppointment]', err);
        return { success: false, error: 'No se pudo cerrar el turno.' };
    }
}
