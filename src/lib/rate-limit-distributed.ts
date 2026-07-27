import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Rate limiter distribuido usando Firestore — funciona entre instancias
 * porque el estado vive en Firestore, no en memoria de proceso.
 *
 * Cada key es un documento en rateLimits/{key} con un array de timestamps
 * de la ventana deslizante. Usa transacción para evitar race conditions
 * entre requests concurrentes de instancias distintas.
 *
 * FALLA ABIERTO: si Firestore no responde, se permite la request — nunca
 * bloquear usuarios legítimos porque el store de rate limiting tuvo un
 * problema.
 *
 * Nota: sin política TTL configurada en `rateLimits.expiresAt` (requiere
 * billing habilitado en el proyecto, hoy deshabilitado), los documentos
 * no se autolimpian. Volumen esperado bajo para el piloto — revisar si
 * se vuelve necesario un cleanup explícito más adelante.
 */
export async function rateLimitDistributed(
  key: string,
  limit: number,
  windowMs = 60_000,
): Promise<boolean> {
  const docId = key.replace(/\//g, '_').slice(0, 1500);
  const ref = adminDb.collection('rateLimits').doc(docId);
  const now = Date.now();
  const cutoff = now - windowMs;

  try {
    return await adminDb.runTransaction(async (txn) => {
      const snap = await txn.get(ref);
      const timestamps: number[] = snap.exists
        ? (snap.data()?.timestamps ?? []).filter((t: number) => t > cutoff)
        : [];

      if (timestamps.length >= limit) {
        return false;
      }

      timestamps.push(now);
      txn.set(ref, {
        timestamps,
        expiresAt: Timestamp.fromDate(new Date(now + windowMs * 2)),
      });
      return true;
    });
  } catch (err) {
    console.error('[rateLimitDistributed] Firestore error, failing open:', err);
    return true;
  }
}
