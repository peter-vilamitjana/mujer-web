'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Banknote,
  QrCode,
  CreditCard,
  ArrowLeftRight,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { closeAppointment } from '@/actions/checkout.actions';
import type { PaymentMethod } from '@/lib/schema';

interface CheckoutDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  appointment: {
    id: string;
    serviceName: string;
    clientName: string;
    staffName: string;
    priceEstimated: number;
    date: string;
  };
  onSuccess?: () => void;
}

export function CheckoutDrawer({
  open,
  onOpenChange,
  tenantId,
  appointment,
  onSuccess
}: CheckoutDrawerProps) {
  const [monto, setMonto] = useState(appointment.priceEstimated.toString());
  const [metodo, setMetodo] = useState<PaymentMethod>('efectivo');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleConfirm = async () => {
    setStatus('loading');
    setErrorMsg('');

    const result = await closeAppointment(tenantId, appointment.id, {
      amountPaid: Number(monto),
      paymentMethod: metodo,
    });

    if (result.success) {
      setStatus('success');
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
        setTimeout(() => setStatus('idle'), 300);
      }, 1800);
    } else {
      setErrorMsg(result.error ?? 'Error al cobrar el turno.');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-zinc-950 border-l border-white/10 p-0 flex flex-col h-full">
        <SheetHeader className="p-8 pb-4">
          <SheetTitle className="font-playfair text-2xl text-white">Cobrar turno</SheetTitle>
          <SheetDescription className="text-zinc-500 font-inter">
            Finaliza el proceso de cobro para {appointment.clientName}.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-8">
          {/* Sección Resumen */}
          <section className="space-y-4">
            <h4 className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-bold">Resumen</h4>
            <div className="space-y-1">
              <p className="text-white font-medium text-lg font-inter">{appointment.serviceName}</p>
              <div className="flex flex-col text-zinc-400 text-sm font-inter">
                <span>Profesional: {appointment.staffName}</span>
                <span>{appointment.date}</span>
              </div>
              <p className="text-zinc-500 text-sm mt-2 block font-inter">
                Precio estimado: <span className="text-zinc-300 font-semibold">{formatCurrency(appointment.priceEstimated)}</span>
              </p>
            </div>
            <div className="border-b border-white/10 pt-4" />
          </section>

          {/* Sección Cobro */}
          <section className="space-y-6">
            <h4 className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-bold">Cobro</h4>

            <div className="space-y-2">
              <Label htmlFor="monto" className="text-zinc-400 text-sm">Monto cobrado</Label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl font-semibold">$</span>
                <Input
                  id="monto"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value.replace(/[^\d]/g, ''))}
                  className="bg-zinc-900 border-white/10 h-14 pl-10 text-white text-xl font-semibold rounded-xl focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-zinc-400 text-sm">Método de pago</Label>
              <RadioGroup value={metodo} onValueChange={(v) => setMetodo(v as PaymentMethod)} className="grid grid-cols-1 gap-3">
                {[
                  { id: 'efectivo' as PaymentMethod, label: 'Efectivo', icon: Banknote },
                  { id: 'mercadopago' as PaymentMethod, label: 'MercadoPago / QR', icon: QrCode },
                  { id: 'tarjeta' as PaymentMethod, label: 'Tarjeta', icon: CreditCard },
                  { id: 'transferencia' as PaymentMethod, label: 'Transferencia', icon: ArrowLeftRight },
                ].map((item) => (
                  <Label
                    key={item.id}
                    htmlFor={item.id}
                    className={cn(
                      "flex items-center justify-between p-4 bg-zinc-900 border border-white/10 rounded-xl cursor-pointer transition-all duration-300",
                      metodo === item.id ? "border-emerald-400/50 bg-emerald-400/5 ring-1 ring-emerald-400/20" : "hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        metodo === item.id ? "bg-emerald-400/10 text-emerald-400" : "bg-zinc-800 text-zinc-400"
                      )}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className={cn("font-medium", metodo === item.id ? "text-white" : "text-zinc-400")}>
                        {item.label}
                      </span>
                    </div>
                    <RadioGroupItem value={item.id} id={item.id} className="sr-only" />
                    {metodo === item.id && <Check className="h-5 w-5 text-emerald-400" />}
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </section>
        </div>

        <SheetFooter className="p-8 border-t border-white/10 bg-zinc-950">
          <div className="w-full space-y-4">
            {status === 'error' && (
              <p className="text-red-400 text-sm text-center">{errorMsg}</p>
            )}
            <Button
              onClick={handleConfirm}
              disabled={status === 'loading' || status === 'success' || !monto}
              className={cn(
                "w-full h-14 rounded-full text-lg font-semibold transition-all duration-500",
                status === 'success' ? "bg-emerald-400/20 text-emerald-400 border border-emerald-400/30" : "bg-white text-zinc-950 hover:bg-zinc-100"
              )}
            >
              {status === 'idle' && "Confirmar cobro"}
              {status === 'error' && "Reintentar"}
              {status === 'loading' && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Procesando...</span>
                </div>
              )}
              {status === 'success' && (
                <div className="flex items-center gap-2">
                  <Check className="h-6 w-6" />
                  <span>¡Cobrado!</span>
                </div>
              )}
            </Button>
            <p className="text-zinc-600 text-[10px] text-center uppercase tracking-widest font-medium">
              El cobro queda registrado en el historial del salón
            </p>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
