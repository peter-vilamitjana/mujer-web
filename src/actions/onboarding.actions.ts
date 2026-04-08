'use server';

import {
  doc,
  writeBatch,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface OnboardingData {
  // Step 1
  salonName: string;
  address: string;
  phone: string;
  slug: string;
  category: string;
  // Step 2 - initial service
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  // Step 3 - business hours
  businessHours: {
    [day: string]: { open: string; close: string; isOpen: boolean };
  };
  // Step 4 - staff invite (optional)
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
    // Check slug uniqueness before writing
    const slugQuery = query(collection(db, 'tenants'), where('slug', '==', data.slug));
    const slugSnap = await getDocs(slugQuery);
    if (!slugSnap.empty) {
      return { success: false, error: 'El slug ya está en uso. Elegí otro nombre de URL.' };
    }

    const tenantId = data.slug;
    const batch = writeBatch(db);

    // 1. Create Tenant document
    const tenantRef = doc(db, 'tenants', tenantId);
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      settings: {
        currency: 'ARS',
        timezone: 'America/Argentina/Buenos_Aires',
      },
    });

    // 2. Create default branch (same address/hours as salon)
    const branchRef = doc(collection(db, 'tenants', tenantId, 'branches'));
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
      createdAt: serverTimestamp(),
    });

    // 3. Create initial service
    if (data.serviceName) {
      const serviceRef = doc(collection(db, 'tenants', tenantId, 'services'));
      batch.set(serviceRef, {
        name: data.serviceName,
        price: data.servicePrice,
        durationMinutes: data.serviceDuration,
        active: true,
        requiresLengthSelection: false,
        variablePrice: false,
        createdAt: serverTimestamp(),
      });
    }

    // 4. Create User profile + admin membership
    const userRef = doc(db, 'users', userId);
    batch.set(
      userRef,
      {
        displayName: userName,
        email: userEmail,
        salonId: tenantId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const membershipRef = doc(db, 'users', userId, 'memberships', tenantId);
    batch.set(membershipRef, {
      role: 'admin',
      tenantId,
      joinedAt: serverTimestamp(),
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
    const q = query(collection(db, 'tenants'), where('slug', '==', slug));
    const snap = await getDocs(q);
    return snap.empty;
  } catch {
    return false;
  }
}
