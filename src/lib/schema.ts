import { Timestamp } from 'firebase/firestore';

// --- Global Collections ---

export interface UserProfile {
    id: string; // Auth UID
    email: string;
    displayName: string;
    phone?: string;
    photoURL?: string;
    createdAt: Timestamp;
}

export interface UserPreferences {
    preferredZone?: string;
    preferredTimeSlot?: 'morning' | 'afternoon' | 'evening';
    notifications: {
        whatsappReminder: boolean;
        reminderHoursBefore: number;
        favoriteSalonUpdates: boolean;
    };
    updatedAt?: Timestamp;
}

export interface FavoriteSalon {
    tenantId: string;
    slug: string;
    savedAt: Timestamp;
}

export type UserRole = 'superadmin' | 'admin' | 'employee' | 'client' | 'customer';

export interface Membership {
    tenantId: string;
    role: UserRole;
    joinedAt: Timestamp;
}

// --- Tenant Sub-collections (root: tenants/{tenantId}) ---

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    description?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    isActivePublicly?: boolean;
    createdAt: Timestamp;
    socialLinks?: {
        instagram?: string;
        facebook?: string;
        whatsapp?: string;
    };
    businessHours?: {
        [day: string]: { open: string; close: string; isOpen: boolean };
    };
    settings: {
        primaryColor?: string;
        currency: string;
        timezone: string;
        showServices?: boolean;
        showStaff?: boolean;
        showPrices?: boolean;
        showReviews?: boolean;
        showGiftCards?: boolean;
    };
    plan?: 'free' | 'pro' | 'enterprise';
    slotDurationMinutes?: number;
    cancellationPolicy?: {
        hoursInAdvance: number;
    };
    isGuestBookingEnabled?: boolean;
}

export interface Branch {
    id: string;
    name: string;
    address: string;
    phone?: string;
    active: boolean;
    schedule?: {
        [key: string]: { open: string; close: string; isOpen: boolean };
    };
}

export interface ServicePrice {
    from: number;
    to?: number;
}

export interface ServicePriceByLength {
    corto: number;
    mediano: number;
    largo: number;
}

export interface Service {
    id: string;
    name: string;
    description?: string;
    categoryId?: string;
    durationMinutes: number;
    price: number | ServicePriceByLength; // Fixed price or by length
    priceHasta?: ServicePriceByLength; // Optional "up to" price
    requiresLengthSelection: boolean;
    variablePrice: boolean; // If true, "desde" logic applies
    active: boolean;
    image?: string;
}

export type PromoType = 'standard' | 'warm' | 'popular' | 'premium';

export interface Promotion {
    id: string;
    title: string; // subtitle in current UI
    services: string[]; // List of service *names* included (or IDs)
    price: number;
    badge?: string;
    type: PromoType;
    active: boolean;
    order?: number;
}

export interface StaffCommissions {
    default: number; // default commission % for all services (0-100)
    byService?: { [serviceId: string]: number }; // per-service overrides
}

export interface Staff {
    id: string; // Doc ID
    userId?: string; // Link to user auth if they have login
    name: string;
    avatarUrl?: string;
    role: string; // Display role (e.g. "Estilista Senior")
    assignedBranchIds: string[];
    active: boolean;
    email?: string;
    phone?: string;
    services?: string[]; // IDs de servicios que puede realizar
    schedule?: {
        [day: string]: { start: string; end: string; available: boolean };
    }; // day: "monday", "tuesday", etc.
    commissions?: StaffCommissions; // commission rules for this staff member
}

export type AppointmentStatus =
    | 'pending'
    | 'confirmed'
    | 'completed'
    | 'cancelled'
    | 'no_show'
    | 'pending_payment'
    | 'cobrado'; // Spanish intentional — core LATAM business term for "collected/charged"

export type PaymentMethod = 'efectivo' | 'mercadopago' | 'tarjeta' | 'transferencia';

export interface PaymentSplit {
    efectivo?: number;
    mercadopago?: number;
    tarjeta?: number;
    transferencia?: number;
}

export interface Appointment {
    id: string;
    tenantId: string;
    branchId: string;
    clientId: string;
    clientName: string; // Denormalized for lists
    staffId: string;
    staffName: string; // Denormalized
    serviceIds: string[];
    serviceNames: string; // Denormalized "Corte, Color..."
    date: Timestamp; // Start time
    durationMinutes: number;
    status: AppointmentStatus;
    priceEstimated: number;
    priceFinal?: number;
    depositAmount?: number;
    depositPaid: boolean;
    notes?: string;
    createdAt: Timestamp;
    createdBy: string; // User ID
    googleEventId?: string;
    source?: string;                   // 'marketplace' | 'admin'
    // ── Campos de Checkout Local (Pivot LATAM) ──────────────────
    amountPaid?: number;              // Monto real cobrado al cerrar caja
    paymentMethod?: PaymentMethod;    // Método dominante (retrocompatibilidad)
    paymentMethods?: PaymentSplit;    // Split por método (efectivo+mp+tarjeta === priceFinal)
    commissionCalculated?: number;    // Porcentaje de comisión del staff (0-100)
    staffCommissionAmount?: number;   // Comisión en $ calculada al cobrar
    checkoutAt?: Timestamp;           // Cuándo se cerró el cobro
    checkoutBy?: string;              // UID del admin que cobró
    // ── Guest booking (reservas sin cuenta) ─────────────────────
    isGuestBooking?: boolean;         // true cuando reserva sin sesión NextAuth
    guestEmail?: string;              // email del invitado para confirmación
    guestPhone?: string;              // WhatsApp del invitado
    // ── Recordatorios ────────────────────────────────────────────
    reminderSentAt?: Timestamp;       // cuándo se procesó el recordatorio
    reminderSkipped?: boolean;        // true si se skipeó por falta de config WhatsApp
}

export interface Customer {
    id: string;
    userId?: string; // If they have a user account
    fullName: string;
    email?: string;
    phone?: string;
    createdAt: Timestamp;
    metrics?: {
        totalVisits: number;
        totalSpent: number;
        firstVisit?: Timestamp;
        lastVisit?: Timestamp;
    };
    notes?: string;          // Notas del profesional (fórmulas, preferencias)
    hairProfile?: {
        type?: string;           // liso | ondulado | rizado | afro
        thickness?: string;      // fino | normal | grueso
        condition?: string;      // sano | dañado | procesado | muy-dañado
        allergies?: string[];
        goal?: string;
        healthScore?: number;    // 0–100
        lastTreatment?: string;  // nombre del último tratamiento realizado
        stylistName?: string;    // estilista asignada
        evolution?: Array<{
            date: Timestamp;
            note: string;
            score?: number;
        }>;
        updatedAt?: Timestamp;
    };
}

export interface TechnicalRecord {
    id: string;
    date: Timestamp;
    staffName: string;
    serviceSummary: string;
    formula: string; // tono/mezcla
    notes?: string;
}

export interface Review {
    id: string;
    clientId?: string;        // undefined for anonymous/guest reviews
    clientName: string;
    rating: number;            // 1–5
    comment?: string;
    serviceName?: string;
    createdAt: Timestamp;
    verified: boolean;         // true when tied to a real confirmed appointment
    appointmentId?: string;
}

// ── Serializable UI types (safe to cross RSC/Client boundary) ─────────────────

export interface ProfileData {
    displayName: string;
    email: string;
    phone: string;
    photoURL: string | null;
    createdAt: string | null;
}

export interface HistorialEntry {
    id: string;
    tenantId: string;
    salonName: string;
    salonSlug: string;
    service: string;
    staffName: string;
    dateMs: number;
    status: AppointmentStatus;
    price: number;
}

export interface HistorialGroup {
    monthLabel: string;
    entries: HistorialEntry[];
}

export type HairProfile = NonNullable<Customer['hairProfile']>;

export type SerializedPreferences = Omit<UserPreferences, 'updatedAt'> & { updatedAtMs: number | null };

export interface FavoriteSalonData {
    tenantId: string;
    slug: string;
    name: string;
    address: string | null;
    savedAtMs: number;
}

export interface DashboardAppointment {
    id: string;
    serviceName: string;
    staffName: string;
    salonName: string;
    date: string;          // pre-formateado: "viernes 14 feb, 15:00"
    dateRaw: Date;
    status: AppointmentStatus;
    price: number;
}

// ── SuperAdmin: Suscripciones SaaS ────────────────────────────────────────
// Colección top-level: subscriptions/{subscriptionId}

export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing'
export type BillingCycle       = 'monthly' | 'annual'
export type SubPaymentMethod   = 'mercadopago' | 'transferencia' | 'efectivo'

export interface Subscription {
    id: string
    tenantId: string
    plan: 'free' | 'pro' | 'enterprise'
    status: SubscriptionStatus
    billingCycle: BillingCycle
    amountARS: number
    currentPeriodStart: Timestamp
    currentPeriodEnd: Timestamp
    paymentMethod: SubPaymentMethod
    lastPaymentAt: Timestamp | null
    cancelledAt: Timestamp | null
    createdAt: Timestamp
}

// ── SuperAdmin: Audit Log ─────────────────────────────────────────────────
// Colección top-level: auditLogs/{logId}

export type AuditAction =
    | 'tenant.plan_changed'
    | 'tenant.suspended'
    | 'tenant.activated'
    | 'tenant.deleted'
    | 'user.role_changed'
    | 'subscription.payment_recorded'
    | 'subscription.status_changed'

export interface AuditLog {
    id: string
    actorUid: string
    actorEmail: string
    action: AuditAction
    targetId: string
    targetName: string
    before: Record<string, unknown>
    after: Record<string, unknown>
    createdAt: Timestamp
}
