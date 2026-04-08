import { Timestamp } from 'firebase/firestore';

// --- Global Collections ---

export interface UserProfile {
    id: string; // Auth UID
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: Timestamp;
}

export type UserRole = 'admin' | 'employee' | 'client';

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
    };
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
    // ── Campos de Checkout Local (Pivot LATAM) ──────────────────
    amountPaid?: number;              // Monto real cobrado al cerrar caja
    paymentMethod?: PaymentMethod;    // Cómo pagó la clienta
    commissionCalculated?: number;    // Comisión calculada al staff (si aplica)
    checkoutAt?: Timestamp;           // Cuándo se cerró el cobro
    checkoutBy?: string;              // UID del admin que cobró
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
        lastVisit?: Timestamp;
        totalSpent: number;
    }
}

export interface TechnicalRecord {
    id: string;
    date: Timestamp;
    staffName: string;
    serviceSummary: string;
    formula: string; // tono/mezcla
    notes?: string;
}
