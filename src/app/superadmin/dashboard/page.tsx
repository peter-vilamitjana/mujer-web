import { getSuperAdminStats, getSystemStatus, getRevenueStats, getSubscriberGrowth } from '@/actions/superadmin.actions'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

function relativeTime(iso: string | null) {
  if (!iso) return '—'
  try { return formatDistanceToNow(new Date(iso), { locale: es, addSuffix: true }) }
  catch { return '—' }
}

const EVENT_CONFIG: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  success: { color: 'text-[#5af0b3]', bg: 'bg-[#5af0b3]/10', border: 'border-[#5af0b3]/30', icon: 'check_circle' },
  warning: { color: 'text-[#ffccad]', bg: 'bg-[#ffa668]/10', border: 'border-[#ffccad]/30', icon: 'warning' },
  alert:   { color: 'text-[#ffb4ab]', bg: 'bg-[#93000a]/20', border: 'border-[#ffb4ab]/30', icon: 'error' },
  info:    { color: 'text-[#00f0ff]', bg: 'bg-[#00f0ff]/10', border: 'border-[#00f0ff]/30', icon: 'info' },
}

export default async function CommandCenterPage() {
  const [stats, systemStatus, revenue, growth] = await Promise.all([
    getSuperAdminStats(),
    getSystemStatus(),
    getRevenueStats(),
    getSubscriberGrowth(6),
  ])

  return (
    <div className="max-w-[1400px] mx-auto pb-6 text-[#dde4dd]">

      {/* ── Section 1: SaaS KPIs & Local Context ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total MRR */}
        <div className="bg-[#0e1511]/60 backdrop-blur-[40px] border-[0.5px] border-zinc-800 p-6 rounded-[24px] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.05)] group hover:border-[#5af0b3]/40 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-8xl">account_balance_wallet</span>
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="material-symbols-outlined text-[#5af0b3] p-2 bg-[#5af0b3]/10 rounded-lg">trending_up</span>
            <span className="text-[#5af0b3] bg-[#5af0b3]/10 border border-[#5af0b3]/20 px-2 py-0.5 rounded-full text-[11px] font-bold">
              {revenue.activeSubscriptions} activas
            </span>
          </div>
          <p className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[#bbcac0] mb-1 relative z-10">MRR Total</p>
          <div className="flex items-baseline gap-1 relative z-10">
            <span className="text-[16px] text-[#bbcac0] font-medium">ARS</span>
            <p className="font-sans text-[28px] font-medium tracking-tight text-white">
              ${revenue.mrr > 0 ? revenue.mrr.toLocaleString('es-AR') : '—'}
            </p>
          </div>
        </div>

        {/* Active Salons */}
        <div className="bg-[#0e1511]/60 backdrop-blur-[40px] border-[0.5px] border-zinc-800 p-6 rounded-[24px] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.05)] group hover:border-[#5af0b3]/40 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-[#5af0b3] p-2 bg-[#5af0b3]/10 rounded-lg">storefront</span>
            <span className="text-[#5af0b3] text-[12px] font-bold">+ {stats.newTenantsThisWeek} This Week</span>
          </div>
          <p className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[#bbcac0] mb-1">Active Salons</p>
          <p className="font-sans text-[28px] font-medium tracking-tight text-white">{stats.activeTenants.toLocaleString('es-AR')}</p>
        </div>

        {/* Churn Rate (Net New) */}
        <div className="bg-[#0e1511]/60 backdrop-blur-[40px] border-[0.5px] border-zinc-800 p-6 rounded-[24px] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.05)] group hover:border-[#ffb4ab]/40 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-[#ffb4ab] p-2 bg-[#93000a]/20 rounded-lg">heart_broken</span>
            <span className="text-[#ffb4ab] bg-[#93000a]/20 border border-[#ffb4ab]/20 px-2 py-0.5 rounded-full text-[11px] font-bold">-0.2% vs last mo</span>
          </div>
          <p className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[#bbcac0] mb-1">Churn Rate</p>
          <p className="font-sans text-[28px] font-medium tracking-tight text-white">{revenue.churnRate}%</p>
        </div>

        {/* Mora / Friction */}
        <div className="bg-[#0e1511]/60 backdrop-blur-[40px] border-[0.5px] border-zinc-800 p-6 rounded-[24px] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.05)] group hover:border-[#ffccad]/40 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-[#ffccad] p-2 bg-[#ffa668]/10 rounded-lg">credit_card_off</span>
            <span className="text-[#ffccad] text-[12px] font-bold underline cursor-pointer">Action Req</span>
          </div>
          <p className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[#bbcac0] mb-1">Suscripciones en Mora</p>
          <div className="flex items-baseline gap-2">
            <p className="font-sans text-[28px] font-medium tracking-tight text-white">{revenue.pastDueCount}</p>
            <span className="text-[14px] text-[#ffccad]">{revenue.pastDueCount === 1 ? 'Rechazada' : 'Rechazadas'}</span>
          </div>
        </div>
      </section>

      {/* ── Section 2: Chart + Activity Feed ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-8">
        {/* Large Chart Island */}
        <div className="xl:col-span-2 bg-[#0e1511]/60 backdrop-blur-[40px] border-[0.5px] border-zinc-800 p-6 rounded-[24px] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.05)] overflow-hidden relative flex flex-col">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="font-sans text-[24px] font-medium tracking-tight text-white mb-1">Subscriber Growth</h3>
              <p className="text-[14px] text-[#bbcac0]">Nuevas suscripciones por plan — últimos 6 meses</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                <button className="px-3 py-1 rounded-md text-[#bbcac0] text-[12px] hover:text-white">1M</button>
                <button className="px-3 py-1 rounded-md bg-white/10 text-[#5af0b3] text-[12px] font-bold">6M</button>
                <button className="px-3 py-1 rounded-md text-[#bbcac0] text-[12px] hover:text-white">1Y</button>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-white/10"></span><span className="text-[11px] text-[#bbcac0]">Free</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#5af0b3]"></span><span className="text-[11px] text-[#bbcac0]">Pro</span></div>
                {/* Ice Blue / Neon Cyan for Enterprise */}
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.6)]"></span><span className="text-[11px] text-[#bbcac0]">Enterprise</span></div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative rounded-xl border border-white/5 flex items-end px-4 pb-8 gap-3 mt-4" style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            minHeight: '220px'
          }}>
            {/* Empty state cuando no hay suscripciones aún */}
            {growth.every(m => m.free + m.pro + m.enterprise === 0) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[#3c4a42] text-[40px]">bar_chart</span>
                <p className="text-[12px] text-[#3c4a42]">Sin suscripciones registradas aún</p>
              </div>
            ) : (
              growth.map((month, i, arr) => {
                const maxTotal = Math.max(...arr.map(m => m.free + m.pro + m.enterprise), 1)
                const total    = month.free + month.pro + month.enterprise
                const heightPct = Math.max((total / maxTotal) * 100, total > 0 ? 4 : 0)

                return (
                  <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                    {/* Tooltip */}
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0e1511] p-3 rounded-xl text-[11px] border border-[#00f0ff]/30 text-[#bbcac0] z-20 whitespace-nowrap shadow-2xl pointer-events-none">
                      <p className="font-bold text-[#00f0ff] mb-2">{month.label} <span className="text-white">({total} total)</span></p>
                      <div className="flex justify-between gap-4"><span className="text-[#00f0ff]">Enterprise</span><span className="text-white font-mono">{month.enterprise}</span></div>
                      <div className="flex justify-between gap-4"><span className="text-[#5af0b3]">Pro</span><span className="text-white font-mono">{month.pro}</span></div>
                      <div className="flex justify-between gap-4"><span className="text-white/60">Free</span><span className="text-white font-mono">{month.free}</span></div>
                    </div>

                    {/* Stacked Bar */}
                    {total > 0 ? (
                      <div className="w-full flex flex-col justify-end gap-[2px] group-hover:opacity-80 transition-opacity cursor-pointer" style={{ height: `${heightPct}%` }}>
                        {month.enterprise > 0 && <div className="w-full bg-[#00f0ff] rounded-t-sm shadow-[0_0_10px_rgba(0,240,255,0.2)]" style={{ height: `${(month.enterprise / total) * 100}%` }} />}
                        {month.pro        > 0 && <div className="w-full bg-[#5af0b3]" style={{ height: `${(month.pro / total) * 100}%` }} />}
                        {month.free       > 0 && <div className="w-full bg-white/10 rounded-b-sm" style={{ height: `${(month.free / total) * 100}%` }} />}
                      </div>
                    ) : (
                      <div className="w-full h-1 bg-white/5 rounded-sm" />
                    )}

                    {/* X-Axis Label */}
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[11px] font-medium text-[#bbcac0]">{month.label}</div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Actionable Activity Feed */}
        <div className="bg-[#0e1511]/60 backdrop-blur-[40px] border-[0.5px] border-zinc-800 p-6 rounded-[24px] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.05)] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-sans text-[24px] font-medium tracking-tight text-white">Actividad</h3>
            <Link href="/superadmin/actividad" className="text-[11px] text-[#5af0b3] hover:underline">Ver todo</Link>
          </div>
          <div className="space-y-5 flex-1">
            {[
              ...stats.recentTenants.map(t => ({ icon: 'store', color: 'text-[#5af0b3]', bg: 'bg-[#5af0b3]/10', border: 'border-[#5af0b3]/30', title: t.name, desc: `Salón registrado · ${t.plan}`, createdAt: t.createdAt })),
              ...stats.recentCustomers.map(u => ({ icon: 'person_add', color: 'text-[#9dd2b6]', bg: 'bg-[#1c503a]', border: 'border-[#9dd2b6]/30', title: u.name || u.email, desc: 'Clienta registrada', createdAt: u.createdAt })),
            ].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
             .slice(0, 5)
             .map((event, i, arr) => {
              const isLast = i === arr.length - 1
              return (
                <div key={i} className="flex gap-4 relative">
                  {!isLast && <div className="h-full w-[1px] bg-zinc-800 absolute left-[15px] top-[32px]"></div>}
                  <div className={`h-8 w-8 rounded-full ${event.bg} border ${event.border} flex items-center justify-center shrink-0 relative z-10`}>
                    <span className={`material-symbols-outlined text-[16px] ${event.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{event.icon}</span>
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="text-[13px] text-white font-medium line-clamp-1">{event.title}</p>
                    <p className="text-[12px] text-[#bbcac0]">{event.desc}</p>
                    <p className="text-[11px] text-zinc-500">{relativeTime(event.createdAt)}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <Link href="/superadmin/actividad" className="w-full mt-4 block text-center py-2 text-[#5af0b3] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-zinc-800">Review All Logs</Link>
        </div>
      </div>

      {/* ── Section 4: Infrastructure & Webhooks ── */}
      <h3 className="font-sans text-[20px] font-medium tracking-tight text-white mb-4 mt-8 px-1">Infrastructure Live Status</h3>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Firestore Load */}
        <div className="bg-[#0e1511]/60 backdrop-blur-[40px] border-[0.5px] border-zinc-800 p-6 rounded-[24px] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.05)] flex items-center justify-between group hover:border-zinc-700 transition-colors">
          <div className="flex items-center gap-4">
            <div className={`h-10 w-10 ${systemStatus.firestore === 'ok' ? 'bg-[#5af0b3]/10 border border-[#5af0b3]/30' : 'bg-[#93000a]/20'} rounded-full flex items-center justify-center`}>
              <span className={`material-symbols-outlined ${systemStatus.firestore === 'ok' ? 'text-[#5af0b3]' : 'text-[#ffb4ab]'}`}>dns</span>
            </div>
            <div>
              <p className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[#bbcac0]">Database Load</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 bg-[#5af0b3] rounded-full animate-pulse"></span>
                <p className="text-[14px] text-white">4.2k <span className="text-zinc-500 text-[12px]">reads/s</span></p>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#5af0b3] bg-[#5af0b3]/10 px-2 py-1 rounded">Healthy</span>
        </div>
        
        {/* WhatsApp API Webhook */}
        <div className="bg-[#0e1511]/60 backdrop-blur-[40px] border-[0.5px] border-zinc-800 p-6 rounded-[24px] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.05)] flex items-center justify-between group hover:border-zinc-700 transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-[#00f0ff]/10 border border-[#00f0ff]/30 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[#00f0ff]">chat</span>
            </div>
            <div>
              <p className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[#bbcac0]">WA Webhook</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-pulse"></span>
                <p className="text-[14px] text-white">Active</p>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">12ms LATENCY</span>
        </div>
        
        {/* MercadoPago Latency */}
        <div className="bg-[#0e1511]/60 backdrop-blur-[40px] border-[0.5px] border-zinc-800 p-6 rounded-[24px] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.05)] flex items-center justify-between group hover:border-zinc-700 transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-[#009ee3]/10 border border-[#009ee3]/30 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[#009ee3]">account_balance</span>
            </div>
            <div>
              <p className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[#bbcac0]">MercadoPago API</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 bg-[#009ee3] rounded-full animate-pulse"></span>
                <p className="text-[14px] text-white">Connected</p>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#ffccad]">85ms LATENCY</span>
        </div>
      </section>

      {/* ── Section 3: Tenant Overview Table ── */}
      <section className="bg-[#0e1511]/60 backdrop-blur-[40px] border-[0.5px] border-zinc-800 rounded-[24px] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.05)] mb-8 overflow-hidden mt-8">
        <div className="p-6 flex justify-between items-center border-b border-zinc-800/50">
          <h3 className="font-sans text-[24px] font-medium tracking-tight text-white">Tenant Overview</h3>
          <div className="flex gap-4">
            <Link href="/superadmin/salones" className="flex items-center gap-2 text-[14px] text-[#bbcac0] hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">filter_list</span> View All
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[#bbcac0]">
              <tr>
                <th className="px-6 py-4">Salon Name</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Plan Type</th>
                <th className="px-4 py-4 text-right">Revenue</th>
                <th className="px-6 py-4 text-right">Last Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {stats.recentTenants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#bbcac0] text-sm">No tenants found</td>
                </tr>
              )}
              {stats.recentTenants.slice(0, 5).map(t => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-[#1a211d] rounded-lg flex items-center justify-center border border-white/10 group-hover:border-[#5af0b3]/50">
                        <span className="material-symbols-outlined text-[18px] text-white">spa</span>
                      </div>
                      <span className="font-medium text-white">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border bg-[#5af0b3]/10 text-[#5af0b3] border-[#5af0b3]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5af0b3] animate-pulse"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[#bbcac0] text-[14px] capitalize">
                    {t.plan === 'enterprise' ? <span className="text-[#00f0ff] font-medium">Enterprise</span> : t.plan}
                  </td>
                  <td className="px-4 py-4 text-right text-white font-mono">—</td>
                  <td className="px-6 py-4 text-right text-[#bbcac0] text-[12px]">{relativeTime(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full mt-12 flex justify-between items-center px-6 py-4 border-t-[0.5px] border-zinc-800 font-sans text-[14px] text-[#bbcac0]">
        <p>© 2024 LiquidGlass Systems. All nodes operational.</p>
        <div className="flex gap-6">
          <Link className="hover:text-[#5af0b3] transition-colors underline-offset-4 hover:underline" href="#">Documentation</Link>
          <Link className="hover:text-[#5af0b3] transition-colors underline-offset-4 hover:underline" href="#">API Status</Link>
          <Link className="hover:text-[#5af0b3] transition-colors underline-offset-4 hover:underline" href="#">Support</Link>
        </div>
      </footer>
    </div>
  )
}
