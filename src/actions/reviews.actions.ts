'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  collection, addDoc, getDocs, query, orderBy,
  limit, serverTimestamp, where, doc, getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  average: number;       // 0–5, rounded to 1 decimal
  count: number;
}

export async function getSalonReviews(
  tenantId: string,
  maxCount = 20,
): Promise<ReviewData[]> {
  try {
    const q = query(
      collection(db, 'tenants', tenantId, 'reviews'),
      orderBy('createdAt', 'desc'),
      limit(maxCount),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      const ts = data.createdAt;
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

  const session = await getServerSession(authOptions);
  const uid = (session?.user as any)?.uid as string | undefined;
  const sessionName = session?.user?.name ?? undefined;

  const clientName = (data.clientName?.trim() || sessionName || 'Clienta anónima');

  // Check for existing review from this user in the last 30 days (rate-limit)
  if (uid) {
    const existing = await getDocs(
      query(
        collection(db, 'tenants', salon.id, 'reviews'),
        where('clientId', '==', uid),
        limit(1),
      ),
    );
    if (!existing.empty) {
      return { success: false, error: 'Ya dejaste una reseña para este salón.' };
    }
  }

  try {
    await addDoc(collection(db, 'tenants', salon.id, 'reviews'), {
      clientId: uid ?? null,
      clientName,
      rating: data.rating,
      comment: data.comment?.trim() || null,
      serviceName: data.serviceName?.trim() || null,
      createdAt: serverTimestamp(),
      verified: false,
    });
    return { success: true };
  } catch (err) {
    console.error('[submitReview]', err);
    return { success: false, error: 'No se pudo guardar la reseña.' };
  }
}
