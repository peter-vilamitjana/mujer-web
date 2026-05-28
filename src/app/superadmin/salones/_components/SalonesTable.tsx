'use client'

import { useState, useTransition } from 'react'
import { updateTenantPlan, toggleTenantActive, deleteTenant } from '@/actions/superadmin.actions'
import { ExternalLink, Trash2 } from 'lucide-react'

type Tenant = {
  id: string
  name: string
  slug: string
  plan: string
  isActivePublicly: boolean
  isDeleted: boolean
  createdAt: string | null
  phone: string | null
  address: string | null
}

const PLAN_OPTIONS = ['free', 'pro', 'enterprise'] as const

function PlanBadge({ plan }: { plan: string }) {
  const color =
    plan === 'enterprise' ? 'text-yellow-400 bg-yellow-400/10' :
    plan === 'pro'        ? 'text-violet-400 bg-violet-400/10' :
                            'text-white/40 bg-white/[0.05]'
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${color}`}>
      {plan}
    </span>
  )
}

export function SalonesTable({ initialTenants }: { initialTenants: Tenant[] }) {
  const [tenants, setTenants] = useState(initialTenants.filter(t => !t.isDeleted))
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function handlePlanChange(tenantId: string, plan: string) {
    startTransition(async () => {
      await updateTenantPlan(tenantId, plan as 'free' | 'pro' | 'enterprise')
      setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, plan } : t))
    })
  }

  function handleToggleActive(tenantId: string, current: boolean) {
    startTransition(async () => {
      await toggleTenantActive(tenantId, !current)
      setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, isActivePublicly: !current } : t))
    })
  }

  function handleDelete(tenantId: string) {
    startTransition(async () => {
      await deleteTenant(tenantId)
      setTenants(prev => prev.filter(t => t.id !== tenantId))
      setConfirmDelete(null)
    })
  }

  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.02]">
            <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wide">Nombre</th>
            <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wide">Plan</th>
            <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wide">Estado</th>
            <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wide">Creado</th>
            <th className="text-right px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wide">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tenants.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-white/30 text-sm">
                Sin salones registrados
              </td>
            </tr>
          )}
          {tenants.map(tenant => (
            <tr
              key={tenant.id}
              className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
            >
              <td className="px-4 py-3">
                <div>
                  <span className="text-white font-medium">{tenant.name}</span>
                  <span className="block text-xs text-white/30">{tenant.slug}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <select
                  value={tenant.plan}
                  onChange={e => handlePlanChange(tenant.id, e.target.value)}
                  disabled={isPending}
                  className="bg-transparent border border-white/[0.08] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500/50 cursor-pointer"
                >
                  {PLAN_OPTIONS.map(p => (
                    <option key={p} value={p} className="bg-[#0d0d0d]">{p}</option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleToggleActive(tenant.id, tenant.isActivePublicly)}
                  disabled={isPending}
                  className={[
                    'text-xs px-2 py-0.5 rounded border transition-colors',
                    tenant.isActivePublicly
                      ? 'text-green-400 border-green-500/20 bg-green-500/5 hover:bg-green-500/10'
                      : 'text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10',
                  ].join(' ')}
                >
                  {tenant.isActivePublicly ? 'Activo' : 'Suspendido'}
                </button>
              </td>
              <td className="px-4 py-3 text-xs text-white/30">
                {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('es-AR') : '—'}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <a
                    href={`/${tenant.slug}/dashboard`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-colors"
                    title="Ver dashboard"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  {confirmDelete === tenant.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(tenant.id)}
                        disabled={isPending}
                        className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs px-2 py-1 rounded text-white/40 hover:text-white/70 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(tenant.id)}
                      className="p-1.5 rounded text-white/20 hover:text-red-400 hover:bg-red-500/[0.05] transition-colors"
                      title="Eliminar salón"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isPending && (
        <div className="px-4 py-2 text-xs text-white/30 border-t border-white/[0.04]">
          Guardando…
        </div>
      )}
    </div>
  )
}
