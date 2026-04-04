'use server';

import { collection, query, where, getDocs, doc, setDoc, serverTimestamp, Timestamp, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// ─────────────────────────────────────────────
// ACTION 1: getAvailableSlots
// Consulta appointments existentes y devuelve
// ÚNICAMENTE los slots ocupados como string[].
// Ningún dato personal se expone al cliente.
// ─────────────────────────────────────────────
export async function getAvailableSlots(
  tenantId: string,
  staffId: string,
  date: string // ISO date string 'YYYY-MM-DD'
): Promise<{ occupiedSlots: string[]; error?: string }> {
  try {
    // Construir rango del día seleccionado
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointmentsRef = collection(db, 'tenants', tenantId, 'appointments');
    const q = query(
      appointmentsRef,
      where('staffId', '==', staffId),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay)),
      where('status', 'in', ['pending', 'confirmed', 'pending_payment'])
    );

    const snap = await getDocs(q);

    // Extraer SOLO el horario — ningún dato personal sale del servidor
    const occupiedSlots = snap.docs.map(doc => {
      const data = doc.data();
      const date: Date = data.date.toDate();
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    });

    return { occupiedSlots };
  } catch (error) {
    console.error('[getAvailableSlots] Error:', error);
    return { occupiedSlots: [], error: 'No se pudo verificar disponibilidad.' };
  }
}

// ─────────────────────────────────────────────
// ACTION 2: createBooking
// Doble escritura: appointment + customer.
// Solo ejecuta si hay sesión NextAuth válida.
// ─────────────────────────────────────────────
export interface BookingPayload {
  tenantId: string;
  staffId: string;
  staffName: string;
  serviceIds: string[];
  serviceNames: string;
  selectedServices: Array<{
    id: string;
    nombre: string;
    largo?: string;
    duracion: number;
    precio?: number;
    precios?: Record<string, number>;
    preciosHasta?: Record<string, number>;
    requiereLargo: boolean;
    variable: boolean;
  }>;
  date: string;        // ISO string
  time: string;        // 'HH:MM'
  totalFrom: number;
  totalTo: number;
  depositAmount: number;
  durationMinutes: number;
}

async function getDefaultBranchId(tenantId: string): Promise<string> {
  const branchesRef = collection(db, 'tenants', tenantId, 'branches');
  const q = query(branchesRef, where('active', '==', true), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;
  // Fallback: any branch
  const allSnap = await getDocs(query(branchesRef, limit(1)));
  return allSnap.empty ? 'default' : allSnap.docs[0].id;
}

export async function createBooking(
  payload: BookingPayload
): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
  // 1. Verificar sesión — solo usuarios autenticados pueden reservar
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'No autenticado. Por favor iniciá sesión.' };
  }

  const uid = (session.user as { uid?: string }).uid || '';
  const userEmail = session.user.email ?? '';
  const userName = session.user.name ?? 'Cliente';

  try {
    const [hour, minute] = payload.time.split(':').map(Number);
    const appointmentDateTime = new Date(payload.date);
    appointmentDateTime.setHours(hour, minute, 0, 0);

    // 2. ESCRITURA 1: Crear appointment
    const appointmentRef = doc(collection(db, 'tenants', payload.tenantId, 'appointments'));
    const appointmentData = {
      id: appointmentRef.id,
      tenantId: payload.tenantId,
      branchId: await getDefaultBranchId(payload.tenantId),
      clientId: uid,
      clientName: userName,
      staffId: payload.staffId,
      staffName: payload.staffName,
      serviceIds: payload.serviceIds,
      serviceNames: payload.serviceNames,
      date: Timestamp.fromDate(appointmentDateTime),
      durationMinutes: payload.durationMinutes,
      status: 'pending_payment',
      priceEstimated: payload.totalFrom,
      depositAmount: payload.depositAmount,
      depositPaid: false,
      createdAt: serverTimestamp(),
      createdBy: uid,
      source: 'marketplace', // distinguir origen B2C vs B2B
      notes: '',
    };
    await setDoc(appointmentRef, appointmentData);

    // 3. ESCRITURA 2: Crear o actualizar customer en el CRM privado del tenant
    // Usamos el uid como ID del documento para garantizar unicidad por usuario global
    const customerRef = doc(db, 'tenants', payload.tenantId, 'customers', uid);
    const customerData = {
      userId: uid,
      fullName: userName,
      email: userEmail,
      createdAt: serverTimestamp(),
      // metrics se actualiza separadamente — no calcular acá
    };
    // setDoc con merge: true → crea si no existe, actualiza si ya existe sin borrar campos previos
    await setDoc(customerRef, customerData, { merge: true });

    return { success: true, appointmentId: appointmentRef.id };
  } catch (error) {
    console.error('[createBooking] Error:', error);
    return { success: false, error: 'No se pudo crear el turno. Intentá de nuevo.' };
  }
}
