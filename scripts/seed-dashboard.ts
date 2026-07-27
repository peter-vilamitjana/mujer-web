// scripts/seed-dashboard.ts
// Ejecutar: npx tsx scripts/seed-dashboard.ts
// Idempotente: usa IDs determinísticos para no duplicar en múltiples ejecuciones

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY    = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!PROJECT_ID || !API_KEY) {
  console.error('\n  Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID y NEXT_PUBLIC_FIREBASE_API_KEY deben estar en .env.local\n');
  process.exit(1);
}

const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ─── Helpers REST ──────────────────────────────────────────────────────────────

async function firestoreSet(collectionPath: string, docId: string, data: Record<string, unknown>) {
  const fields = toFirestoreFields(data);
  const url = `${BASE_URL}/${collectionPath}/${docId}?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[${collectionPath}/${docId}] ${res.status}: ${err}`);
  }
  console.log(`  ✓ ${collectionPath}/${docId}`);
}

function toFirestoreFields(obj: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    fields[k] = toFirestoreValue(v);
  }
  return fields;
}

function toFirestoreValue(v: unknown): unknown {
  if (typeof v === 'string')  return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number')  return { integerValue: String(Math.round(v)) };
  if (v instanceof Date)      return { timestampValue: v.toISOString() };
  if (Array.isArray(v))       return { arrayValue: { values: v.map(toFirestoreValue) } };
  if (typeof v === 'object')  return { mapValue: { fields: toFirestoreFields(v as Record<string, unknown>) } };
  return { nullValue: null };
}

// ─── IDs determinísticos ───────────────────────────────────────────────────────

const TENANT_ID = 'maison-de-beaute-tenant';
const BRANCH_ID = 'branch-palermo-001';

const STAFF = {
  valentina: 'staff-valentina-greco',
  ana:       'staff-ana-lopez',
  marcos:    'staff-marcos-ruiz',
};

const SVC = {
  corte:    'svc-corte-autor',
  balayage: 'svc-balayage-premium',
  manicure: 'svc-manicure-gel',
  keratina: 'svc-keratina',
  mechas:   'svc-mechas-californianas',
};

const CUST = [
  'cust-maria-garcia',
  'cust-ana-martinez',
  'cust-laura-rodriguez',
  'cust-sofia-lopez',
  'cust-carolina-silva',
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seedTenant() {
  await firestoreSet('tenants', TENANT_ID, {
    id: TENANT_ID,
    name: 'Maison de Beauté',
    slug: 'maison-de-beaute',
    description: 'Salón premium en Palermo, Buenos Aires. Especialistas en coloración y tratamientos capilares.',
    address: 'Av. Santa Fe 2850, Palermo, Buenos Aires',
    phone: '+54 11 4832-1234',
    isActivePublicly: true,
    plan: 'premium',
    slotDurationMinutes: 30,
    cancellationPolicy: { hoursInAdvance: 120 },
    createdAt: new Date('2024-01-15'),
    businessHours: {
      monday:    { open: '09:00', close: '19:00', isOpen: true },
      tuesday:   { open: '09:00', close: '19:00', isOpen: true },
      wednesday: { open: '09:00', close: '19:00', isOpen: true },
      thursday:  { open: '09:00', close: '19:00', isOpen: true },
      friday:    { open: '09:00', close: '19:00', isOpen: true },
      saturday:  { open: '09:00', close: '17:00', isOpen: true },
      sunday:    { open: '00:00', close: '00:00', isOpen: false },
    },
    settings: { primaryColor: '#a78bfa', currency: 'ARS', timezone: 'America/Argentina/Buenos_Aires' },
    socialLinks: {
      instagram: 'https://instagram.com/maisondbeaute_ba',
      whatsapp:  'https://wa.me/5491148321234',
    },
  });
}

async function seedBranch() {
  await firestoreSet(`tenants/${TENANT_ID}/branches`, BRANCH_ID, {
    id: BRANCH_ID,
    name: 'Palermo Principal',
    address: 'Av. Santa Fe 2850, Palermo, Buenos Aires',
    phone: '+54 11 4832-1234',
    active: true,
    schedule: {
      monday:    { open: '09:00', close: '19:00', isOpen: true },
      tuesday:   { open: '09:00', close: '19:00', isOpen: true },
      wednesday: { open: '09:00', close: '19:00', isOpen: true },
      thursday:  { open: '09:00', close: '19:00', isOpen: true },
      friday:    { open: '09:00', close: '19:00', isOpen: true },
      saturday:  { open: '09:00', close: '17:00', isOpen: true },
      sunday:    { open: '00:00', close: '00:00', isOpen: false },
    },
  });
}

async function seedStaff() {
  const members = [
    {
      id: STAFF.valentina, name: 'Valentina Greco', role: 'Colorista Senior',
      assignedBranchIds: [BRANCH_ID], active: true,
      email: 'valentina.greco@maisondbeaute.com', phone: '+54 11 4832-1235',
      services: [SVC.balayage, SVC.mechas, SVC.corte, SVC.keratina],
      schedule: {
        monday:    { start: '09:00', end: '19:00', available: true },
        tuesday:   { start: '09:00', end: '19:00', available: true },
        wednesday: { start: '09:00', end: '19:00', available: true },
        thursday:  { start: '09:00', end: '19:00', available: true },
        friday:    { start: '09:00', end: '19:00', available: true },
        saturday:  { start: '09:00', end: '17:00', available: true },
        sunday:    { start: '00:00', end: '00:00', available: false },
      },
      commissions: { default: 40 },
    },
    {
      id: STAFF.ana, name: 'Ana López', role: 'Estilista',
      assignedBranchIds: [BRANCH_ID], active: true,
      email: 'ana.lopez@maisondbeaute.com', phone: '+54 11 4832-1236',
      services: [SVC.corte, SVC.manicure, SVC.keratina],
      schedule: {
        monday:    { start: '09:00', end: '18:00', available: true },
        tuesday:   { start: '09:00', end: '18:00', available: true },
        wednesday: { start: '09:00', end: '18:00', available: true },
        thursday:  { start: '09:00', end: '18:00', available: true },
        friday:    { start: '09:00', end: '18:00', available: true },
        saturday:  { start: '10:00', end: '16:00', available: true },
        sunday:    { start: '00:00', end: '00:00', available: false },
      },
      commissions: { default: 35 },
    },
    {
      id: STAFF.marcos, name: 'Marcos Ruiz', role: 'Barbero',
      assignedBranchIds: [BRANCH_ID], active: true,
      email: 'marcos.ruiz@maisondbeaute.com', phone: '+54 11 4832-1237',
      services: [SVC.corte],
      schedule: {
        monday:    { start: '10:00', end: '19:00', available: true },
        tuesday:   { start: '10:00', end: '19:00', available: true },
        wednesday: { start: '10:00', end: '19:00', available: true },
        thursday:  { start: '10:00', end: '19:00', available: true },
        friday:    { start: '10:00', end: '19:00', available: true },
        saturday:  { start: '09:00', end: '17:00', available: true },
        sunday:    { start: '00:00', end: '00:00', available: false },
      },
      commissions: { default: 30 },
    },
  ];
  for (const m of members) await firestoreSet(`tenants/${TENANT_ID}/staff`, m.id, m);
}

async function seedServices() {
  const services = [
    {
      id: SVC.corte, name: 'Corte de Autor', categoryId: 'corte-y-estilo',
      description: 'Corte personalizado según morfología facial. Incluye lavado y secado premium.',
      durationMinutes: 60, price: 4500, requiresLengthSelection: false, variablePrice: false, active: true,
    },
    {
      id: SVC.balayage, name: 'Balayage Premium', categoryId: 'color-y-mechas',
      description: 'Técnica de degradado natural con iluminación personalizada. Tonalización incluida.',
      durationMinutes: 180, price: 12000, requiresLengthSelection: false, variablePrice: false, active: true,
    },
    {
      id: SVC.manicure, name: 'Manicure Gel', categoryId: 'manos',
      description: 'Manicura completa con esmalte semipermanente de larga duración.',
      durationMinutes: 60, price: 3200, requiresLengthSelection: false, variablePrice: false, active: true,
    },
    {
      id: SVC.keratina, name: 'Keratina', categoryId: 'tratamientos',
      description: 'Alisado y sellado capilar con keratina brasileña libre de formol.',
      durationMinutes: 120, price: 9500, requiresLengthSelection: false, variablePrice: false, active: true,
    },
    {
      id: SVC.mechas, name: 'Mechas Californianas', categoryId: 'color-y-mechas',
      description: 'Mechas degradadas de efecto natural con técnica californiana. Tonalización incluida.',
      durationMinutes: 180, price: 14000, requiresLengthSelection: false, variablePrice: false, active: true,
    },
  ];
  for (const s of services) await firestoreSet(`tenants/${TENANT_ID}/services`, s.id, s);
}

async function seedCustomers() {
  const customers = [
    {
      id: CUST[0], fullName: 'María García', email: 'maria.garcia@gmail.com',
      phone: '+54 9 11 2345-6789', createdAt: new Date('2023-03-10'),
      notes: 'Sensibilidad alta en cuero cabelludo. Prefiere tonos fríos sin amoniaco. Fórmula: 9.1 + 8.2 (1:1.5) 20vol.',
      hairProfile: { type: 'liso', thickness: 'fino', condition: 'procesado', allergies: ['parafenilendiamina'], goal: 'mantener rubio ceniza, sin brillo amarillo' },
      metrics: { totalVisits: 12, totalSpent: 245000, firstVisit: new Date('2023-03-10'), lastVisit: new Date('2026-05-08') },
    },
    {
      id: CUST[1], fullName: 'Ana Martínez', email: 'ana.martinez@yahoo.com.ar',
      phone: '+54 9 11 5555-1234', createdAt: new Date('2023-01-20'),
      notes: 'Cliente de hace 3 años. Siempre toma café solo. Keratina: dejar actuar 15 mins extra por cabello grueso.',
      hairProfile: { type: 'ondulado', thickness: 'grueso', condition: 'sano', allergies: [], goal: 'volumen controlado, brillo máximo' },
      metrics: { totalVisits: 23, totalSpent: 530000, firstVisit: new Date('2023-01-20'), lastVisit: new Date('2026-05-10') },
    },
    {
      id: CUST[2], fullName: 'Laura Rodríguez', email: 'laura.rod@hotmail.com',
      phone: '+54 9 11 8765-4321', createdAt: new Date('2024-02-05'),
      metrics: { totalVisits: 8, totalSpent: 120000, firstVisit: new Date('2024-02-05'), lastVisit: new Date('2026-04-05') },
    },
    {
      id: CUST[3], fullName: 'Sofía López', email: 'sofilopez99@gmail.com',
      phone: '+54 9 11 9876-5432', createdAt: new Date('2025-10-01'),
      hairProfile: { type: 'rizado', thickness: 'normal', condition: 'dañado', allergies: ['amoniaco'], goal: 'recuperar hidratación y definir rizos' },
      metrics: { totalVisits: 3, totalSpent: 45000, firstVisit: new Date('2025-10-01'), lastVisit: new Date('2026-03-15') },
    },
    {
      id: CUST[4], fullName: 'Carolina Silva', email: 'caro.silva@empresa.com',
      phone: '+54 9 11 4567-8901', createdAt: new Date('2023-08-15'),
      metrics: { totalVisits: 17, totalSpent: 380000, firstVisit: new Date('2023-08-15'), lastVisit: new Date('2026-04-20') },
    },
  ];
  for (const c of customers) await firestoreSet(`tenants/${TENANT_ID}/customers`, c.id, c);
}

async function seedAppointments() {
  const now    = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
  monday.setHours(0, 0, 0, 0);

  const d = (dayOffset: number, h: number, m: number) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + dayOffset);
    dt.setHours(h, m, 0, 0);
    return dt;
  };

  const appointments = [
    // Lunes — cobrado, MercadoPago
    {
      id: 'appt-001', tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUST[0], clientName: 'María García',
      staffId: STAFF.valentina, staffName: 'Valentina Greco',
      serviceIds: [SVC.balayage], serviceNames: 'Balayage Premium',
      date: d(0, 9, 0), durationMinutes: 180,
      status: 'cobrado', priceEstimated: 12000, priceFinal: 12000,
      amountPaid: 12000, paymentMethod: 'mercadopago',
      paymentMethods: { mercadopago: 12000 },
      commissionCalculated: 40, staffCommissionAmount: 4800,
      depositAmount: 0, depositPaid: false,
      createdAt: d(0, 8, 30), createdBy: 'admin-seed',
      checkoutAt: d(0, 12, 10), checkoutBy: 'admin-seed', source: 'admin',
    },
    // Lunes — cobrado, efectivo
    {
      id: 'appt-002', tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUST[2], clientName: 'Laura Rodríguez',
      staffId: STAFF.ana, staffName: 'Ana López',
      serviceIds: [SVC.corte], serviceNames: 'Corte de Autor',
      date: d(0, 10, 0), durationMinutes: 60,
      status: 'cobrado', priceEstimated: 4500, priceFinal: 4500,
      amountPaid: 4500, paymentMethod: 'efectivo',
      paymentMethods: { efectivo: 4500 },
      commissionCalculated: 35, staffCommissionAmount: 1575,
      depositAmount: 0, depositPaid: false,
      createdAt: d(0, 9, 45), createdBy: 'admin-seed',
      checkoutAt: d(0, 11, 5), checkoutBy: 'admin-seed', source: 'admin',
    },
    // Martes — confirmed
    {
      id: 'appt-003', tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUST[1], clientName: 'Ana Martínez',
      staffId: STAFF.valentina, staffName: 'Valentina Greco',
      serviceIds: [SVC.mechas], serviceNames: 'Mechas Californianas',
      date: d(1, 9, 0), durationMinutes: 180,
      status: 'confirmed', priceEstimated: 14000,
      depositAmount: 0, depositPaid: false,
      createdAt: new Date(), createdBy: 'admin-seed', source: 'admin',
    },
    // Martes — confirmed
    {
      id: 'appt-004', tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUST[3], clientName: 'Sofía López',
      staffId: STAFF.marcos, staffName: 'Marcos Ruiz',
      serviceIds: [SVC.corte], serviceNames: 'Corte de Autor',
      date: d(1, 11, 0), durationMinutes: 60,
      status: 'confirmed', priceEstimated: 4500,
      depositAmount: 0, depositPaid: false,
      createdAt: new Date(), createdBy: 'admin-seed', source: 'admin',
    },
    // Miércoles — pending (desde marketplace)
    {
      id: 'appt-005', tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUST[4], clientName: 'Carolina Silva',
      staffId: STAFF.ana, staffName: 'Ana López',
      serviceIds: [SVC.manicure], serviceNames: 'Manicure Gel',
      date: d(2, 10, 0), durationMinutes: 60,
      status: 'pending', priceEstimated: 3200,
      depositAmount: 0, depositPaid: false,
      createdAt: new Date(), createdBy: 'admin-seed', source: 'marketplace',
    },
    // Miércoles — confirmed
    {
      id: 'appt-006', tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUST[0], clientName: 'María García',
      staffId: STAFF.valentina, staffName: 'Valentina Greco',
      serviceIds: [SVC.keratina], serviceNames: 'Keratina',
      date: d(2, 14, 0), durationMinutes: 120,
      status: 'confirmed', priceEstimated: 9500,
      depositAmount: 0, depositPaid: false,
      createdAt: new Date(), createdBy: 'admin-seed', source: 'admin',
    },
    // Jueves — cancelled
    {
      id: 'appt-007', tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUST[1], clientName: 'Ana Martínez',
      staffId: STAFF.ana, staffName: 'Ana López',
      serviceIds: [SVC.corte], serviceNames: 'Corte de Autor',
      date: d(3, 9, 30), durationMinutes: 60,
      status: 'cancelled', priceEstimated: 4500,
      depositAmount: 0, depositPaid: false,
      createdAt: new Date(), createdBy: 'admin-seed', source: 'admin',
    },
    // Jueves — confirmed
    {
      id: 'appt-008', tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUST[2], clientName: 'Laura Rodríguez',
      staffId: STAFF.marcos, staffName: 'Marcos Ruiz',
      serviceIds: [SVC.corte], serviceNames: 'Corte de Autor',
      date: d(3, 15, 0), durationMinutes: 60,
      status: 'confirmed', priceEstimated: 4500,
      depositAmount: 0, depositPaid: false,
      createdAt: new Date(), createdBy: 'admin-seed', source: 'admin',
    },
    // Viernes — cobrado, split tarjeta + efectivo
    {
      id: 'appt-009', tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUST[3], clientName: 'Sofía López',
      staffId: STAFF.valentina, staffName: 'Valentina Greco',
      serviceIds: [SVC.balayage], serviceNames: 'Balayage Premium',
      date: d(4, 9, 0), durationMinutes: 180,
      status: 'cobrado', priceEstimated: 12000, priceFinal: 12000,
      amountPaid: 12000, paymentMethod: 'tarjeta',
      paymentMethods: { tarjeta: 7000, efectivo: 5000 },
      commissionCalculated: 40, staffCommissionAmount: 4800,
      depositAmount: 0, depositPaid: false,
      createdAt: d(4, 8, 45), createdBy: 'admin-seed',
      checkoutAt: d(4, 12, 0), checkoutBy: 'admin-seed', source: 'admin',
    },
    // Viernes — confirmed
    {
      id: 'appt-010', tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUST[4], clientName: 'Carolina Silva',
      staffId: STAFF.ana, staffName: 'Ana López',
      serviceIds: [SVC.mechas], serviceNames: 'Mechas Californianas',
      date: d(4, 14, 0), durationMinutes: 180,
      status: 'confirmed', priceEstimated: 14000,
      depositAmount: 0, depositPaid: false,
      createdAt: new Date(), createdBy: 'admin-seed', source: 'admin',
    },
  ];

  for (const a of appointments) await firestoreSet(`tenants/${TENANT_ID}/appointments`, a.id, a);
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n  Seeding Firestore — Maison de Beauté\n' + '='.repeat(50));
  try {
    console.log('\n[1/6] Tenant...');        await seedTenant();
    console.log('\n[2/6] Branch...');        await seedBranch();
    console.log('\n[3/6] Staff (3)...');     await seedStaff();
    console.log('\n[4/6] Services (5)...');  await seedServices();
    console.log('\n[5/6] Customers (5)...'); await seedCustomers();
    console.log('\n[6/6] Appointments (10, semana actual)...'); await seedAppointments();

    console.log('\n' + '='.repeat(50));
    console.log('  Seed completo.');
    console.log(`   Tenant:     ${TENANT_ID}`);
    console.log(`   Branch:     ${BRANCH_ID}`);
    console.log(`   Staff:      3  (Valentina Greco, Ana López, Marcos Ruiz)`);
    console.log(`   Services:   5`);
    console.log(`   Customers:  5`);
    console.log(`   Appts:      10  (semana actual, mix de estados)\n`);
  } catch (err) {
    console.error('\n  Error en seed:', err);
    console.log('\n  Si Firestore rechaza por reglas de seguridad:');
    console.log('   Baja las reglas a `allow read, write: if true` en la consola de Firebase,');
    console.log('   ejecuta el seed, y restaura las reglas originales.\n');
    process.exit(1);
  }
}

main();
