import { getTenantDetail } from '@/actions/superadmin.actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, Users, DollarSign, Activity } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { TenantActionButtons } from './_components/TenantActionButtons'

function relativeTime(iso: string | null) {
  if (!iso) return '—'
  try { return formatDistanceToNow(new Date(iso), { locale: es, addSuffix: true }) }
  catch { return '—' }
}

const PLAN_BADGE: Record<string, string> = {
  enterprise: 'text-amber-400 bg-amber-400/[0.08] border-amber-400/20',
  pro:        'text-violet-400 bg-violet-400/[0.08] border-violet-400/20',
  free:       'text-[#7a766e] bg-white/[0.04] border-white/[0.08]',
}

const STATUS_BADGE: Record<string, string> = {
  active:   'text-[#5af0b3] bg-[#5af0b3]/[0.08] border-[#5af0b3]/20',
  past_due: 'text-[#ffccad] bg-[#ffa668]/[0.08] border-[#ffccad]/20',
  trialing: 'text-[#00f0ff] bg-[#00f0ff]/[0.08] border-[#00f0ff]/20',
  cancelled:'text-[#ffb4ab] bg-[#93000a]/[0.08] border-[#ffb4ab]/20',
}

const CARD = 'bg-[#0e1511]/60 backdrop-blur-[40px] border-[0.5px] border-zinc-800 rounded-[24px] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.05)]'

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params

  let detail: Awaited<ReturnType<typeof getTenantDetail>>
  try {
    detail = await getTenantDetail(tenantId)
  } catch {
    notFound()
  }

  const { tenant, subscription, staff, metrics, integrations } = detail

  return (
    <div className="max-w-[1200px] mx-auto pb-8 text-[#dde4dd]">

      {/* Back */}
      <Link
        href="/superadmin/salones"
        className="inline-flex items-center gap-2 text-[12px] text-[#7a766e] hover:text-[#5af0b3] transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver a Salones
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.4em] font-bold mb-2">
            Superadmin · Detalle de Salón
          </p>
          <h1 className="font-playfair text-3xl md:text-4xl italic text-[#f5f0e8] mb-2">
            {tenant.name}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-[#7a766e] font-mono">/{tenant.slug}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${PLAN_BADGE[tenant.plan] ?? PLAN_BADGE.free}`}>
              {tenant.plan}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              tenant.isActivePublicly ? 'text-[#5af0b3] bg-[#5af0b3]/[0.08] border-[#5af0b3]/20' : 'text-rose-400 bg-rose-500/[0.08] border-rose-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${tenant.isActivePublicly ? 'bg-[#5af0b3] animate-pulse' : 'bg-rose-400'}`} />
              {tenant.isActivePublicly ? 'Activo' : 'Suspendido'}
            </span>
          </div>
        </div>
        <a
          href={`/${tenant.slug}/dashboard`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-[#5af0b3] border border-[#5af0b3]/20 bg-[#5af0b3]/[0.06] hover:bg-[#5af0b3]/10 transition-all cursor-pointer self-start sm:self-auto"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ver Dashboard del Salón
        </a>
      </div>

      {/* Métricas */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Calendar, label: 'Turnos totales',     value: metrics.totalAppointments.toLocaleString('es-AR'),  color: 'text-[#5af0b3]', bg: 'bg-[#5af0b3]/10' },
          { icon: Calendar, label: 'Turnos este mes',    value: metrics.appointmentsThisMonth.toLocaleString('es-AR'), color: 'text-[#00f0ff]', bg: 'bg-[#00f0ff]/10' },
          { icon: Users,    label: 'Clientes únicos/mes',value: metrics.uniqueClients.toLocaleString('es-AR'),       color: 'text-violet-400', bg: 'bg-violet-400/10' },
          { icon: DollarSign, label: 'Revenue este mes', value: `$${metrics.revenueThisMonth.toLocaleString('es-AR')}`, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`${CARD} p-5`}>
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#bbcac0] mb-1">{label}</p>
            <p className={`font-playfair text-2xl italic ${color}`}>{value}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna izquierda: Suscripción + Integraciones */}
        <div className="space-y-6">

          {/* Suscripción */}
          <div className={`${CARD} p-5`}>
            <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.4em] font-bold mb-4">Suscripción</p>
            {subscription ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#bbcac0]">Plan</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${PLAN_BADGE[subscription.plan] ?? PLAN_BADGE.free}`}>
                    {subscription.plan}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#bbcac0]">Estado</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[subscription.status] ?? ''}`}>
                    {subscription.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#bbcac0]">Ciclo</span>
                  <span className="text-[12px] text-[#f5f0e8]">{subscription.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#bbcac0]">Monto</span>
                  <span className="text-[12px] text-[#f5f0e8] font-mono">ARS ${subscription.amountARS.toLocaleString('es-AR')}</span>
                </div>
                {subscription.currentPeriodEnd && (
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#bbcac0]">Vence</span>
                    <span className="text-[11px] text-[#7a766e] font-mono">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                )}
                {subscription.lastPaymentAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#bbcac0]">Último pago</span>
                    <span className="text-[11px] text-[#7a766e]">{relativeTime(subscription.lastPaymentAt)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#bbcac0]">Método</span>
                  <span className="text-[11px] text-[#f5f0e8]">{subscription.paymentMethod}</span>
                </div>
              </div>
            ) : (
              <p className="text-[12px] text-[#7a766e]">Sin suscripción registrada</p>
            )}
          </div>

          {/* Integraciones */}
          <div className={`${CARD} p-5`}>
            <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.4em] font-bold mb-4">Integraciones</p>
            <div className="space-y-3">
              {[
                { label: 'WhatsApp', active: integrations.hasWhatsApp,      icon: 'chat' },
                { label: 'Google Calendar', active: integrations.hasGoogleCalendar, icon: 'calendar_month' },
              ].map(({ label, active, icon }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[16px] ${active ? 'text-[#5af0b3]' : 'text-[#7a766e]/40'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {icon}
                    </span>
                    <span className="text-[12px] text-[#bbcac0]">{label}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    active ? 'text-[#5af0b3] bg-[#5af0b3]/[0.08] border-[#5af0b3]/20' : 'text-[#7a766e] bg-white/[0.03] border-white/[0.06]'
                  }`}>
                    {active ? 'Conectado' : 'No config.'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Info de contacto */}
          {(tenant.phone || tenant.address) && (
            <div className={`${CARD} p-5`}>
              <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.4em] font-bold mb-3">Contacto</p>
              {tenant.phone   && <p className="text-[12px] text-[#bbcac0] mb-1">{tenant.phone}</p>}
              {tenant.address && <p className="text-[12px] text-[#7a766e]">{tenant.address}</p>}
              {tenant.createdAt && (
                <p className="text-[11px] text-[#7a766e]/60 mt-2">Registrado {relativeTime(tenant.createdAt)}</p>
              )}
            </div>
          )}
        </div>

        {/* Columna derecha: Acciones + Staff */}
        <div className="lg:col-span-2 space-y-6">

          {/* Acciones */}
          <div className={`${CARD} p-5`}>
            <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.4em] font-bold mb-4">Acciones de Administración</p>
            <TenantActionButtons
              tenantId={tenant.id}
              tenantName={tenant.name}
              currentPlan={tenant.plan}
              isActive={tenant.isActivePublicly}
            />
          </div>

          {/* Staff */}
          <div className={`${CARD} overflow-hidden`}>
            <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
              <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.4em] font-bold">Staff activo</p>
              <span className="text-[10px] text-[#7a766e] bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
                {staff.length}
              </span>
            </div>
            {staff.length === 0 ? (
              <div className="py-10 text-center">
                <span className="material-symbols-outlined text-[#7a766e]/30 block mb-2" style={{ fontSize: '32px' }}>group</span>
                <p className="text-[12px] text-[#7a766e]">Sin staff registrado</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {staff.map(member => (
                  <div key={member.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-[11px] font-bold text-violet-400 shrink-0">
                      {(member.name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#f5f0e8] truncate">{member.name}</p>
                      <p className="text-[11px] text-[#7a766e] truncate">{member.role}</p>
                    </div>
                    {member.email && (
                      <p className="text-[11px] text-[#7a766e] hidden md:block truncate max-w-[180px]">{member.email}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
