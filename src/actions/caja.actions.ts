'use server';

import { getAppointmentsForDay } from './appointments.actions';
import { requireRole } from '@/lib/auth-guards';
import type { PaymentSplit } from '@/lib/schema';

export interface TopService {
  name: string;
  count: number;
  revenue: number;
}

export interface StaffCierreCaja {
  staffId: string;
  staffName: string;
  ticketCount: number;
  grossSales: number;
  commissionAmount: number;
}

export interface CierreCajaData {
  dateLabel: string;
  totalRevenue: number;
  cobradoCount: number;
  byMethod: { efectivo: number; mercadopago: number; tarjeta: number; transferencia: number };
  byStaff: StaffCierreCaja[];
  topServices: TopService[];
}

export async function getCierreCaja(
  tenantId: string,
  branchId: string,
  date: Date = new Date(),
): Promise<CierreCajaData> {
  await requireRole(tenantId, ['admin']);
  const appts = await getAppointmentsForDay(tenantId, branchId || null, date);
  const cobrados = appts.filter(a => a.status === 'cobrado' || a.status === 'completed');

  const totalRevenue = cobrados.reduce((sum, a) => sum + (a.amountPaid ?? a.priceFinal ?? 0), 0);

  const byMethod = { efectivo: 0, mercadopago: 0, tarjeta: 0, transferencia: 0 };
  for (const a of cobrados) {
    const split = a.paymentMethods as PaymentSplit | undefined;
    if (split) {
      byMethod.efectivo      += split.efectivo      ?? 0;
      byMethod.mercadopago   += split.mercadopago   ?? 0;
      byMethod.tarjeta       += split.tarjeta       ?? 0;
      byMethod.transferencia += split.transferencia ?? 0;
    } else if (a.paymentMethod && a.paymentMethod in byMethod) {
      byMethod[a.paymentMethod as keyof typeof byMethod] += a.amountPaid ?? 0;
    }
  }

  const staffMap = new Map<string, StaffCierreCaja>();
  for (const a of cobrados) {
    if (!a.staffId) continue;
    const gross = a.priceFinal ?? a.amountPaid ?? a.priceEstimated ?? 0;
    const comm  = a.staffCommissionAmount ?? 0;
    const entry = staffMap.get(a.staffId);
    if (entry) {
      entry.ticketCount++;
      entry.grossSales      += gross;
      entry.commissionAmount += comm;
    } else {
      staffMap.set(a.staffId, {
        staffId: a.staffId,
        staffName: a.staffName ?? '',
        ticketCount: 1,
        grossSales: gross,
        commissionAmount: comm,
      });
    }
  }
  const byStaff = Array.from(staffMap.values()).sort((a, b) => b.grossSales - a.grossSales);

  const svcMap = new Map<string, TopService>();
  for (const a of cobrados) {
    const names = (a.serviceNames ?? '').split('+').map((s: string) => s.trim()).filter(Boolean);
    const revenue = a.amountPaid ?? a.priceFinal ?? 0;
    const perSvc  = names.length ? Math.round(revenue / names.length) : 0;
    for (const name of names) {
      const entry = svcMap.get(name);
      if (entry) {
        entry.count++;
        entry.revenue += perSvc;
      } else {
        svcMap.set(name, { name, count: 1, revenue: perSvc });
      }
    }
  }
  const topServices = Array.from(svcMap.values()).sort((a, b) => b.count - a.count).slice(0, 5);

  const dateLabel = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

  return { dateLabel, totalRevenue, cobradoCount: cobrados.length, byMethod, byStaff, topServices };
}
