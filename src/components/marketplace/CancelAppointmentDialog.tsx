'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Turno {
  serviceName: string;
  date: string;
}

interface CancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turno: Turno | null;
  onConfirm: () => void;
}

export function CancelAppointmentDialog({
  open,
  onOpenChange,
  turno,
  onConfirm,
}: CancelDialogProps) {
  if (!turno) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border border-white/10 text-white font-inter">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl">¿Cancelar el turno?</DialogTitle>
          <DialogDescription className="text-zinc-400 mt-2">
            Estás por cancelar la reserva de <span className="text-white font-medium">{turno.serviceName}</span> para el <span className="text-white font-medium">{turno.date}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 p-3 bg-amber-400/10 border border-amber-400/20 rounded-lg text-amber-400 text-sm">
          Podés cancelar de forma gratuita hasta 2 horas antes de tu horario.
        </div>

        <div className="space-y-2 mb-4">
          <label className="text-sm text-zinc-400">Motivo (opcional)</label>
          <Textarea 
            placeholder="Dejale un mensaje al salón..." 
            className="bg-zinc-900 border-white/10 focus-visible:ring-emerald-400 focus-visible:ring-offset-0 focus-visible:ring-1 resize-none h-24"
          />
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-white hover:bg-white/5"
          >
            Volver
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="text-red-400 border-red-400/30 hover:bg-red-400/10 hover:text-red-300 transition-colors"
          >
            Sí, cancelar cita
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
