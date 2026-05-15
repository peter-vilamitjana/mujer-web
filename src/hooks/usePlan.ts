'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { getTenantSettings } from '@/actions/tenant.actions';
import type { Tenant } from '@/lib/schema';

export type Plan = NonNullable<Tenant['plan']>;

export interface PlanFeatures {
  plan: Plan;
  loading: boolean;
  // Booking
  guestBooking: boolean;
  onlinePayments: boolean;
  // Agenda
  unlimitedStaff: boolean;
  unlimitedAppointments: boolean;
  // Analytics
  performanceReports: boolean;
  advancedAnalytics: boolean;
  // Integraciones
  googleCalendarSync: boolean;
  whatsappNotifications: boolean;
  // Admin
  multipleBranches: boolean;
  customSlug: boolean;
}

const PLAN_MATRIX: Record<Plan, Omit<PlanFeatures, 'loading'>> = {
  free: {
    plan: 'free',
    guestBooking: false,
    onlinePayments: false,
    unlimitedStaff: false,
    unlimitedAppointments: false,
    performanceReports: false,
    advancedAnalytics: false,
    googleCalendarSync: false,
    whatsappNotifications: false,
    multipleBranches: false,
    customSlug: false,
  },
  pro: {
    plan: 'pro',
    guestBooking: true,
    onlinePayments: true,
    unlimitedStaff: true,
    unlimitedAppointments: true,
    performanceReports: true,
    advancedAnalytics: false,
    googleCalendarSync: true,
    whatsappNotifications: true,
    multipleBranches: false,
    customSlug: true,
  },
  enterprise: {
    plan: 'enterprise',
    guestBooking: true,
    onlinePayments: true,
    unlimitedStaff: true,
    unlimitedAppointments: true,
    performanceReports: true,
    advancedAnalytics: true,
    googleCalendarSync: true,
    whatsappNotifications: true,
    multipleBranches: true,
    customSlug: true,
  },
};

// Default durante beta: todos los tenants sin plan explícito tienen acceso pro
const BETA_PLAN: Plan = 'pro';

export function usePlan(): PlanFeatures {
  const { tenantId } = useTenant();
  const [plan, setPlan] = useState<Plan>(BETA_PLAN);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    getTenantSettings(tenantId)
      .then(t => setPlan(t?.plan ?? BETA_PLAN))
      .catch(() => setPlan(BETA_PLAN))
      .finally(() => setLoading(false));
  }, [tenantId]);

  return { ...PLAN_MATRIX[plan], loading };
}
