'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTenant } from '@/contexts/TenantContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { PaymentMethod } from '@/lib/schema';
import { Banknote, CreditCard, QrCode, ArrowLeftRight, TrendingUp } from 'lucide-react';

interface PaymentSummary {
  method: PaymentMethod;
  total: number;
  count: number;
}

const METHOD_CONFIG: Record<PaymentMethod, { label: string; icon: React.ReactNode; color: string }> = {
  efectivo: { label: 'Efectivo', icon: <Banknote className="w-4 h-4" />, color: '#4CAF50' },
  mercadopago: { label: 'MercadoPago / QR', icon: <QrCode className="w-4 h-4" />, color: '#009EE3' },
  tarjeta: { label: 'Tarjeta', icon: <CreditCard className="w-4 h-4" />, color: '#D4AF37' },
  transferencia: { label: 'Transferencia', icon: <ArrowLeftRight className="w-4 h-4" />, color: '#9C27B0' },
};

const ARS = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

export function CierreCajaDiario() {
  const { tenantId } = useTenant();
  const [summary, setSummary] = useState<PaymentSummary[]>([]);
  const [totalHoy, setTotalHoy] = useState(0);
  const [totalTurnos, setTotalTurnos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, 'tenants', tenantId, 'appointments'),
      where('date', '>=', Timestamp.fromDate(startOfToday)),
      where('date', '<=', Timestamp.fromDate(endOfToday))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cobrados = snapshot.docs
        .map((doc) => doc.data())
        .filter((d) => d.status === 'cobrado' && d.amountPaid != null);

      const byMethod: Record<string, PaymentSummary> = {};
      let total = 0;

      for (const appt of cobrados) {
        const method = (appt.paymentMethod as PaymentMethod) ?? 'efectivo';
        const amount = Number(appt.amountPaid ?? 0);
        total += amount;
        if (!byMethod[method]) {
          byMethod[method] = { method, total: 0, count: 0 };
        }
        byMethod[method].total += amount;
        byMethod[method].count += 1;
      }

      setSummary(Object.values(byMethod).sort((a, b) => b.total - a.total));
      setTotalHoy(total);
      setTotalTurnos(cobrados.length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tenantId]);

  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Cierre de Caja
            </CardTitle>
            <CardDescription className="capitalize">{today}</CardDescription>
          </div>
          {!loading && (
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{ARS(totalHoy)}</p>
              <p className="text-xs text-muted-foreground">{totalTurnos} turno{totalTurnos !== 1 ? 's' : ''} cobrado{totalTurnos !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            Cargando...
          </div>
        ) : summary.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-center gap-2">
            <Banknote className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Sin cobros registrados hoy</p>
            <p className="text-xs text-muted-foreground/60">Los cobros aparecen al cerrar un turno desde la Agenda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {summary.map(({ method, total, count }) => {
              const config = METHOD_CONFIG[method];
              const pct = totalHoy > 0 ? (total / totalHoy) * 100 : 0;
              return (
                <div key={method}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span style={{ color: config.color }}>{config.icon}</span>
                      <span className="font-medium">{config.label}</span>
                      <span className="text-xs text-muted-foreground">· {count} turno{count !== 1 ? 's' : ''}</span>
                    </div>
                    <span className="text-sm font-semibold">{ARS(total)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: config.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
