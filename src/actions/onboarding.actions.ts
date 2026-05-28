'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

export async function createTenantWithAdmin(data: OnboardingData): Promise<{ success: boolean; tenantId?: string; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'No autenticado.' };

  const userId = (session.user as { uid?: string; id?: string }).uid ||
    (session.user as { uid?: string; id?: string }).id || '';
  const userEmail = session.user.email ?? '';
  const userName = session.user.name ?? 'Admin';

  if (!userId) return { success: false, error: 'No se pudo identificar al usuario.' };

  try {
    const slugSnap = await adminDb.collection('tenants').where('slug', '==', data.slug).limit(1).get();
    if (!slugSnap.empty) {
      return { success: false, error: 'El slug ya está en uso. Elegí otro nombre de URL.' };
    }

    const tenantId = data.slug;
    const batch = adminDb.batch();

    const tenantRef = adminDb.collection('tenants').doc(tenantId);
    batch.set(tenantRef, {
      id: tenantId,
      name: data.salonName,
      slug: data.slug,
      address: data.address,
      phone: data.phone,
      description: '',
      category: data.category,
      ownerId: userId,
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
      address: data.address,
      phone: data.phone,
      active: true,
      schedule: Object.fromEntries(
        Object.entries(data.businessHours).map(([day, h]) => [
          day,
          { open: h.open, close: h.close, isOpen: h.isOpen },
        ])
      ),
      createdAt: FieldValue.serverTimestamp(),
    });

    if (data.serviceName) {
      const serviceRef = adminDb.collection('tenants').doc(tenantId).collection('services').doc();
      batch.set(serviceRef, {
        name: data.serviceName,
        price: data.servicePrice,
        durationMinutes: data.serviceDuration,
        active: true,
        requiresLengthSelection: false,
        variablePrice: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    const userRef = adminDb.collection('users').doc(userId);
    batch.set(userRef, {
      displayName: userName,
      email: userEmail,
      salonId: tenantId,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    const membershipRef = adminDb.collection('users').doc(userId).collection('memberships').doc(tenantId);
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
