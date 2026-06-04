'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuthSession } from '@/lib/auth-guards';

export interface OnboardingData {
  salonName: string;
  address: string;
  phone: string;
  slug: string;
  category: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  businessHours: {
    [day: string]: { open: string; close: string; isOpen: boolean };
  };
  staffEmail?: string;
}

// ─── Validators ───────────────────────────────────────────────────────────────

const PHONE_RE = /^\+?[\d\s\-().]{6,20}$/;
// Slug: solo letras minúsculas, dígitos y guiones. Sin "." ni "/" (Firestore los rechaza en doc IDs).
const SLUG_RE  = /^[a-z0-9][a-z0-9-]{2,62}[a-z0-9]$/;

function validateOnboardingData(data: OnboardingData): string | null {
  if (!data.salonName?.trim() || data.salonName.trim().length < 2) return 'El nombre del salón es obligatorio.';
  if (data.salonName.trim().length > 100) return 'El nombre del salón es demasiado largo.';

  if (!data.slug?.trim())        return 'El slug es obligatorio.';
  if (!SLUG_RE.test(data.slug))  return 'El slug solo puede contener letras minúsculas, números y guiones (mín 4, máx 64 chars).';

  if (!data.address?.trim() || data.address.trim().length < 5) return 'La dirección es obligatoria.';
  if (data.address.trim().length > 200) return 'La dirección es demasiado larga.';

  if (!data.phone?.trim())       return 'El teléfono es obligatorio.';
  if (!PHONE_RE.test(data.phone.trim())) return 'El teléfono no tiene un formato válido.';

  if (data.serviceName?.trim()) {
    if (!Number.isFinite(data.servicePrice) || data.servicePrice < 0 || data.servicePrice > 10_000_000) {
      return 'El precio del servicio es inválido.';
    }
    if (!Number.isInteger(data.serviceDuration) || data.serviceDuration < 5 || data.serviceDuration > 480) {
      return 'La duración del servicio es inválida.';
    }
  }

  return null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createTenantWithAdmin(data: OnboardingData): Promise<{ success: boolean; tenantId?: string; error?: string }> {
  let uid: string; let userName: string | null | undefined; let userEmail: string | null | undefined;
  try {
    const auth = await requireAuthSession();
    uid       = auth.uid;
    userName  = auth.name;
    userEmail = auth.email;
  } catch {
    return { success: false, error: 'No autenticado.' };
  }

  const validationError = validateOnboardingData(data);
  if (validationError) return { success: false, error: validationError };

  const salonName = data.salonName.trim();
  const address   = data.address.trim();
  const phone     = data.phone.trim();
  const slug      = data.slug.trim();

  try {
    const slugSnap = await adminDb.collection('tenants').where('slug', '==', slug).limit(1).get();
    if (!slugSnap.empty) {
      return { success: false, error: 'El slug ya está en uso. Elegí otro nombre de URL.' };
    }

    const tenantId = slug;
    const batch = adminDb.batch();

    const tenantRef = adminDb.collection('tenants').doc(tenantId);
    batch.set(tenantRef, {
      id: tenantId,
      name: salonName,
      slug,
      address,
      phone,
      description: '',
      category: data.category?.trim().slice(0, 50) ?? '',
      ownerId: uid,
      isActivePublicly: true,
      businessHours: data.businessHours,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      settings: {
        currency: 'ARS',
        timezone: 'America/Argentina/Buenos_Aires',
      },
    });

    const branchRef = adminDb.collection('tenants').doc(tenantId).collection('branches').doc();
    batch.set(branchRef, {
      name: 'Sede principal',
      address,
      phone,
      active: true,
      schedule: Object.fromEntries(
        Object.entries(data.businessHours).map(([day, h]) => [
          day,
          { open: h.open, close: h.close, isOpen: h.isOpen },
        ])
      ),
      createdAt: FieldValue.serverTimestamp(),
    });

    if (data.serviceName?.trim()) {
      const serviceRef = adminDb.collection('tenants').doc(tenantId).collection('services').doc();
      batch.set(serviceRef, {
        name: data.serviceName.trim().slice(0, 100),
        price: data.servicePrice,
        durationMinutes: data.serviceDuration,
        active: true,
        requiresLengthSelection: false,
        variablePrice: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    // TODO: staffEmail — implementar invitación por WhatsApp post-MVP
    // Por ahora se ignora silenciosamente para no generar expectativas falsas

    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();
    
    batch.set(userRef, {
      displayName: (userName ?? 'Admin').slice(0, 100),
      email: userEmail ?? '',
      role: 'admin',
      salonId: tenantId,
      updatedAt: FieldValue.serverTimestamp(),
      ...(!userSnap.exists && {
        createdAt: FieldValue.serverTimestamp(),
        photoURL: null
      })
    }, { merge: true });

    const membershipRef = adminDb.collection('users').doc(uid).collection('memberships').doc(tenantId);
    batch.set(membershipRef, {
      role: 'admin',
      tenantId,
      joinedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();
    return { success: true, tenantId };
  } catch (err) {
    console.error('[createTenantWithAdmin]', err);
    return { success: false, error: 'No se pudo crear el salón. Intentá de nuevo.' };
  }
}

export async function checkSlugAvailableOnboarding(slug: string): Promise<boolean> {
  if (!slug || slug.length < 3) return false;
  try {
    const snap = await adminDb.collection('tenants').where('slug', '==', slug).limit(1).get();
    return snap.empty;
  } catch {
    return false;
  }
}
