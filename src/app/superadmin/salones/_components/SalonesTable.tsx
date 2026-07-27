'use client'

import { useState, useTransition, useMemo } from 'react'
import { updateTenantPlan, toggleTenantActive, deleteTenant } from '@/actions/superadmin.actions'
import { ExternalLink, Trash2, Search } from 'lucide-react'
import Link from 'next/link'

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

export function SalonesTable({ initialTenants }: { initialTenants: Tenant[] }) {
  const [tenants, setTenants]         = useState(initialTenants.filter(t => !t.isDeleted))
  const [isPending, startTransition]  = useTransition()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Filtros
  const [query,       setQuery]       = useState('')
  const [planFilter,  setPlanFilter]  = useState<string>('all')
  const [statusFilter,setStatusFilter]= useState<string>('all')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return tenants.filter(t => {
      if (q && !t.name.toLowerCase().includes(q) && !t.slug.toLowerCase().includes(q)) return false
      if (planFilter !== 'all' && t.plan !== planFilter) return false
      if (statusFilter === 'active'    && !t.isActivePublicly) return false
      if (statusFilter === 'suspended' &&  t.isActivePublicly) return false
      return true
    })
  }, [tenants, query, planFilter, statusFilter])

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
    <div className="relative isolate rounded-[1.5rem] border border-white/[0.06] bg-[#0d0d0d]/60 overflow-hidden">
      <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />

      {/* Barra de filtros */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#7a766e] shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre o slug…"
            className="bg-transparent text-[12px] text-[#f5f0e8] outline-none placeholder:text-[#7a766e]/60 w-full"
          />
        </div>

        {/* Filtros + contador */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-[11px] text-[#f5f0e8] outline-none cursor-pointer hover:border-white/[0.15] transition-colors"
          >
            <option value="all"        className="bg-[#0e1511]">Todos los planes</option>
            <option value="free"       className="bg-[#0e1511]">Free</option>
            <option value="pro"        className="bg-[#0e1511]">Pro</option>
            <option value="enterprise" className="bg-[#0e1511]">Enterprise</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-[11px] text-[#f5f0e8] outline-none cursor-pointer hover:border-white/[0.15] transition-colors"
          >
            <option value="all"       className="bg-[#0e1511]">Todos los estados</option>
            <option value="active"    className="bg-[#0e1511]">Activos</option>
            <option value="suspended" className="bg-[#0e1511]">Suspendidos</option>
          </select>

          <span className="text-[11px] text-[#7a766e] bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5 rounded-lg font-mono whitespace-nowrap">
            {filtered.length} / {tenants.length}
          </span>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="text-left px-5 py-3.5 text-[10px] text-[#7a766e] font-bold uppercase tracking-[0.15em]">Nombre</th>
            <th className="text-left px-5 py-3.5 text-[10px] text-[#7a766e] font-bold uppercase tracking-[0.15em]">Plan</th>
            <th className="text-left px-5 py-3.5 text-[10px] text-[#7a766e] font-bold uppercase tracking-[0.15em]">Estado</th>
            <th className="text-left px-5 py-3.5 text-[10px] text-[#7a766e] font-bold uppercase tracking-[0.15em] hidden sm:table-cell">Creado</th>
            <th className="text-right px-5 py-3.5 text-[10px] text-[#7a766e] font-bold uppercase tracking-[0.15em]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-14 text-center">
                <span className="material-symbols-outlined text-[#7a766e]/30 block mb-2" style={{ fontSize: '32px' }}>search_off</span>
                <p className="text-sm text-[#7a766e]">Sin resultados para los filtros aplicados</p>
              </td>
            </tr>
          )}
          {filtered.map(tenant => (
            <tr
              key={tenant.id}
              className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.025] transition-colors"
            >
              <td className="px-5 py-3.5">
                <Link href={`/superadmin/salones/${tenant.id}`} className="flex items-center gap-3 group/name">
                  <div className="w-8 h-8 rounded-full bg-red-500/[0.08] border border-red-500/20 flex items-center justify-center text-[11px] font-bold text-red-400 shrink-0">
                    {(tenant.name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#f5f0e8] group-hover/name:text-[#5af0b3] transition-colors">{tenant.name}</p>
                    <p className="text-[11px] text-[#7a766e]">{tenant.slug}</p>
                  </div>
                </Link>
              </td>
              <td className="px-5 py-3.5">
                <select
                  value={tenant.plan}
                  onChange={e => handlePlanChange(tenant.id, e.target.value)}
                  disabled={isPending}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-[#f5f0e8] focus:outline-none focus:border-red-500/40 cursor-pointer transition-colors hover:border-white/[0.15] disabled:opacity-40"
                >
                  {PLAN_OPTIONS.map(p => (
                    <option key={p} value={p} className="bg-[#0d0d0d]">{p}</option>
                  ))}
                </select>
              </td>
              <td className="px-5 py-3.5">
                <button
                  onClick={() => handleToggleActive(tenant.id, tenant.isActivePublicly)}
                  disabled={isPending}
                  className={[
                    'text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer disabled:opacity-40',
                    tenant.isActivePublicly
                      ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.06] hover:bg-emerald-500/10'
                      : 'text-rose-400 border-rose-500/20 bg-rose-500/[0.06] hover:bg-rose-500/10',
                  ].join(' ')}
                >
                  {tenant.isActivePublicly ? '● Activo' : '○ Suspendido'}
                </button>
              </td>
              <td className="px-5 py-3.5 text-[11px] text-[#7a766e] font-mono hidden sm:table-cell">
                {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('es-AR') : '—'}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center justify-end gap-1.5">
                  <Link
                    href={`/superadmin/salones/${tenant.id}`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7a766e] hover:text-[#5af0b3] hover:bg-[#5af0b3]/[0.06] transition-all cursor-pointer"
                    title="Ver detalle"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  </Link>
                  <a
                    href={`/${tenant.slug}/dashboard`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7a766e] hover:text-[#f5f0e8] hover:bg-white/[0.06] transition-all cursor-pointer"
                    title="Ver dashboard"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  {confirmDelete === tenant.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(tenant.id)}
                        disabled={isPending}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-[11px] px-2.5 py-1 rounded-lg text-[#7a766e] hover:text-[#f5f0e8] hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(tenant.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7a766e]/40 hover:text-red-400 hover:bg-red-500/[0.06] transition-all cursor-pointer"
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
        <div className="px-5 py-2.5 text-[11px] text-[#7a766e] border-t border-white/[0.04] flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Guardando…
        </div>
      )}
    </div>
  )
}
