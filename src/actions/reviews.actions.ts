'use server';

import { requireAuthSession } from '@/lib/auth-guards';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getSalonBySlug } from '@/lib/services/marketplace.service';

export interface ReviewData {
  id: string;
  clientName: string;
  rating: number;
  comment?: string;
  serviceName?: string;
  createdAtMs: number;
  verified: boolean;
}

export interface SalonRatingStats {
  average: number;
  count: number;
}

export async function getSalonReviews(
  tenantId: string,
  maxCount = 20,
): Promise<ReviewData[]> {
  try {
    const snap = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('reviews')
      .orderBy('createdAt', 'desc')
      .limit(maxCount)
      .get();
    return snap.docs.map((d) => {
      const data = d.data();
      const ts = data.createdAt as Timestamp | undefined;
      return {
        id: d.id,
        clientName: data.clientName ?? 'Clienta',
        rating: data.rating ?? 5,
        comment: data.comment ?? undefined,
        serviceName: data.serviceName ?? undefined,
        createdAtMs: ts?.toMillis?.() ?? (ts?.seconds ? ts.seconds * 1000 : Date.now()),
        verified: data.verified ?? false,
      };
    });
  } catch {
    return [];
  }
}

export async function getSalonRatingStats(tenantId: string): Promise<SalonRatingStats> {
  const reviews = await getSalonReviews(tenantId, 100);
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}

export async function submitReview(
  tenantSlug: string,
  data: {
    rating: number;
    comment?: string;
    serviceName?: string;
    clientName?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  if (data.rating < 1 || data.rating > 5) {
    return { success: false, error: 'El puntaje debe ser entre 1 y 5.' };
  }

  const salon = await getSalonBySlug(tenantSlug);
  if (!salon) return { success: false, error: 'Salón no encontrado.' };

  // auth es opcional — se permite reseña anónima
  let uid: string | undefined;
  let sessionName: string | undefined;
  try {
    const auth = await requireAuthSession();
    uid         = auth.uid;
    sessionName = auth.name ?? undefined;
  } catch { /* anónimo */ }

  const clientName = data.clientName?.trim().slice(0, 100) || sessionName || 'Clienta anónima';

  if (uid) {
    const existing = await adminDb
      .collection('tenants').doc(salon.id)
      .collection('reviews')
      .where('clientId', '==', uid)
      .limit(1)
      .get();
    if (!existing.empty) {
      return { success: false, error: 'Ya dejaste una reseña para este salón.' };
    }
  }

  try {
    await adminDb
      .collection('tenants').doc(salon.id)
      .collection('reviews')
      .add({
        clientId:    uid ?? null,
        clientName,
        rating:      data.rating,
        comment:     data.comment?.trim().slice(0, 1000) || null,
        serviceName: data.serviceName?.trim().slice(0, 200) || null,
        createdAt:   FieldValue.serverTimestamp(),
        verified:    false,
      });
    return { success: true };
  } catch (err) {
    console.error('[submitReview]', err);
    return { success: false, error: 'No se pudo guardar la reseña.' };
  }
}
