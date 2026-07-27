'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateTenantPlan, toggleTenantActive } from '@/actions/superadmin.actions'
import { ManualPaymentForm } from './ManualPaymentForm'

type Props = {
  tenantId: string
  tenantName: string
  currentPlan: string
  isActive: boolean
}

const PLAN_OPTIONS = [
  { value: 'free',       label: 'Free' },
  { value: 'pro',        label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
] as const

export function TenantActionButtons({ tenantId, tenantName, currentPlan, isActive }: Props) {
  const router                       = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPayment, setShowPayment] = useState(false)
  const [plan, setPlan]              = useState(currentPlan)

  function handlePlanChange(newPlan: string) {
    setPlan(newPlan)
    startTransition(async () => {
      await updateTenantPlan(tenantId, newPlan as 'free' | 'pro' | 'enterprise')
      router.refresh()
    })
  }

  function handleToggleActive() {
    startTransition(async () => {
      await toggleTenantActive(tenantId, !isActive)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {/* Cambiar plan */}
      <div>
        <p className="text-[10px] text-[#7a766e] uppercase tracking-[0.15em] font-bold mb-2">Cambiar plan</p>
        <div className="flex gap-2">
          {PLAN_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handlePlanChange(opt.value)}
              disabled={isPending || plan === opt.value}
              className={[
                'px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50',
                plan === opt.value
                  ? opt.value === 'enterprise' ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
                    : opt.value === 'pro' ? 'text-violet-400 bg-violet-400/10 border border-violet-400/20'
                    : 'text-[#7a766e] bg-white/[0.06] border border-white/[0.10]'
                  : 'text-[#7a766e] border border-white/[0.06] hover:text-[#f5f0e8] hover:border-white/[0.15]',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suspender / Activar */}
      <div>
        <p className="text-[10px] text-[#7a766e] uppercase tracking-[0.15em] font-bold mb-2">Estado del salón</p>
        <button
          onClick={handleToggleActive}
          disabled={isPending}
          className={[
            'px-4 py-2 rounded-xl text-[12px] font-bold border transition-all cursor-pointer disabled:opacity-40',
            isActive
              ? 'text-rose-400 border-rose-500/20 bg-rose-500/[0.06] hover:bg-rose-500/10'
              : 'text-[#5af0b3] border-[#5af0b3]/20 bg-[#5af0b3]/[0.06] hover:bg-[#5af0b3]/10',
          ].join(' ')}
        >
          {isPending ? 'Guardando…' : isActive ? 'Suspender Salón' : 'Activar Salón'}
        </button>
      </div>

      {/* Pago manual */}
      <div>
        <p className="text-[10px] text-[#7a766e] uppercase tracking-[0.15em] font-bold mb-2">Facturación</p>
        {showPayment ? (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <ManualPaymentForm
              tenantId={tenantId}
              tenantName={tenantName}
              onSuccess={() => { setShowPayment(false); router.refresh() }}
            />
            <button
              onClick={() => setShowPayment(false)}
              className="w-full mt-2 py-1.5 text-[11px] text-[#7a766e] hover:text-[#f5f0e8] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowPayment(true)}
            className="px-4 py-2 rounded-xl text-[12px] font-bold text-[#5af0b3] border border-[#5af0b3]/20 bg-[#5af0b3]/[0.06] hover:bg-[#5af0b3]/10 transition-all cursor-pointer"
          >
            Registrar Pago Manual
          </button>
        )}
      </div>
    </div>
  )
}
