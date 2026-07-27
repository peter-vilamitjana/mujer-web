import { getSystemStatus } from '@/actions/superadmin.actions'

export default async function SistemaPage() {
  const status = await getSystemStatus()

  return (
    <div className="max-w-3xl mx-auto pb-6">
      <div className="mb-10">
        <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.4em] font-bold mb-2">
          Super Admin · Infraestructura
        </p>
        <h1 className="font-playfair text-4xl italic text-[#f5f0e8]">
          Estado del Sistema
        </h1>
      </div>

      {/* Cards de estado — una por servicio */}
      <div className="grid grid-cols-1 gap-4">
        {[
          {
            name: 'Firestore',
            desc: 'Base de datos principal',
            status: status.firestore,
            icon: 'database',
          },
          {
            name: 'NextAuth',
            desc: 'Sistema de autenticación',
            status: status.nextauth,
            icon: 'lock',
          },
          {
            name: 'MercadoPago',
            desc: 'Pasarela de pagos',
            status: status.mercadopago,
            icon: 'payments',
            note: status.mercadopago === 'missing'
              ? 'Configurar MERCADOPAGO_ACCESS_TOKEN para habilitar cobros online'
              : null,
          },
          {
            name: 'Google Calendar',
            desc: 'Sincronización de calendario',
            status: status.googleCalendar,
            icon: 'calendar_today',
          },
        ].map(({ name, desc, status: s, icon, note }) => {
          const ok = s === 'ok' || s === 'configured'
          return (
            <div key={name}
              className={`relative isolate rounded-[1.5rem] border p-5 overflow-hidden
                flex items-center gap-4
                ${ok
                  ? 'border-white/[0.06] bg-[#0d0d0d]/80'
                  : 'border-amber-500/20 bg-amber-500/[0.03]'
                }`}>
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none -z-10" />

              {/* Ícono */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                ${ok
                  ? 'bg-emerald-400/[0.08] border border-emerald-400/20'
                  : 'bg-amber-400/[0.08] border border-amber-400/20'
                }`}>
                <span className={`material-symbols-outlined
                  ${ok ? 'text-emerald-400' : 'text-amber-400'}`}
                  style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
                  {icon}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#f5f0e8]">{name}</p>
                <p className="text-[11px] text-[#7a766e]">{desc}</p>
                {note && (
                  <p className="text-[10px] text-amber-400/80 mt-1">{note}</p>
                )}
              </div>

              {/* Status badge */}
              <div className={`flex items-center gap-1.5 shrink-0
                text-[11px] font-bold px-3 py-1.5 rounded-full border
                ${ok
                  ? 'text-emerald-400 bg-emerald-400/[0.08] border-emerald-400/20'
                  : 'text-amber-400 bg-amber-400/[0.08] border-amber-400/20'
                }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {ok ? 'Operacional' : 'Pendiente'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Info del entorno */}
      <div className="mt-6 relative isolate rounded-[1.5rem] border border-white/[0.06]
        bg-[#0d0d0d]/80 p-5 overflow-hidden">
        <div className="absolute inset-0 liquid-glass-rich pointer-events-none -z-10" />
        <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.4em] font-bold mb-3">
          Entorno
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#a09a8e]">NODE_ENV</span>
          <span className="font-mono text-[13px] text-[#f5f0e8] bg-white/[0.04]
            px-3 py-1 rounded-lg border border-white/[0.06]">
            {status.environment}
          </span>
        </div>
      </div>
    </div>
  )
}
