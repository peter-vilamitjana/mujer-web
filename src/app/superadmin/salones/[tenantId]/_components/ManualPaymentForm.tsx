'use client'

import { useState, useTransition } from 'react'
import { recordManualPayment } from '@/actions/superadmin.actions'

type Props = {
  tenantId: string
  tenantName: string
  onSuccess: () => void
}

export function ManualPaymentForm({ tenantId, tenantName, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [amount, setAmount]          = useState('')
  const [method, setMethod]          = useState<'mercadopago' | 'transferencia' | 'efectivo'>('transferencia')
  const [error, setError]            = useState<string | null>(null)
  const [success, setSuccess]        = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ars = parseFloat(amount)
    if (!ars || ars <= 0) { setError('Ingresá un monto válido.'); return }
    setError(null)
    startTransition(async () => {
      try {
        await recordManualPayment(tenantId, ars, method)
        setSuccess(true)
        // Dar tiempo al usuario de ver el feedback antes de cerrar
        setTimeout(() => onSuccess(), 1400)
      } catch (err: any) {
        setError(err.message ?? 'Error al registrar pago.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-[12px] text-[#bbcac0]">
        Registrar pago manual para <span className="text-[#f5f0e8] font-semibold">{tenantName}</span>.<br/>
        Esto activa la suscripción y extiende el período un mes.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] text-[#7a766e] uppercase tracking-[0.15em] font-bold mb-1.5">
            Monto ARS
          </label>
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2">
            <span className="text-[#7a766e] text-[13px] font-mono">$</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="15000"
              min="1"
              step="1"
              className="flex-1 bg-transparent text-[#f5f0e8] text-[14px] outline-none placeholder:text-[#7a766e]/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-[#7a766e] uppercase tracking-[0.15em] font-bold mb-1.5">
            Método de pago
          </label>
          <select
            value={method}
            onChange={e => setMethod(e.target.value as typeof method)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-[13px] text-[#f5f0e8] outline-none cursor-pointer"
          >
            <option value="transferencia" className="bg-[#0e1511]">Transferencia bancaria</option>
            <option value="mercadopago"   className="bg-[#0e1511]">MercadoPago</option>
            <option value="efectivo"      className="bg-[#0e1511]">Efectivo</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="text-[12px] text-[#ffb4ab] bg-[#93000a]/20 border border-[#ffb4ab]/20 px-3 py-2 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}

      {success ? (
        <div className="w-full py-2.5 bg-[#5af0b3]/10 border border-[#5af0b3]/30 text-[#5af0b3] font-bold text-[13px] rounded-xl flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          Pago registrado correctamente
        </div>
      ) : (
        <button
          type="submit"
          disabled={isPending || !amount}
          className="w-full py-2.5 bg-[#5af0b3] text-[#003825] font-bold text-[13px] rounded-xl
            hover:bg-[#45dfa4] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? 'Registrando…' : 'Confirmar Pago'}
        </button>
      )}
    </form>
  )
}
