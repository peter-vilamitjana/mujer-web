import { getSystemStatus } from '@/actions/superadmin.actions'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

function StatusRow({
  label,
  status,
  detail,
}: {
  label: string
  status: 'ok' | 'configured' | 'error' | 'missing'
  detail?: string
}) {
  const isOk = status === 'ok' || status === 'configured'
  const isError = status === 'error'

  const Icon = isError ? XCircle : isOk ? CheckCircle2 : AlertCircle
  const color = isError
    ? 'text-red-400'
    : isOk
    ? 'text-green-400'
    : 'text-yellow-400'

  const label2 =
    status === 'ok'         ? 'OK' :
    status === 'configured' ? 'Configurado' :
    status === 'error'      ? 'Error' :
                              'Sin credenciales'

  return (
    <div className="flex items-center justify-between py-4 border-b border-white/[0.06] last:border-0">
      <span className="text-sm text-white/70">{label}</span>
      <div className="flex items-center gap-2">
        {detail && <span className="text-xs text-white/30">{detail}</span>}
        <Icon className={`w-4 h-4 ${color}`} />
        <span className={`text-sm font-medium ${color}`}>{label2}</span>
      </div>
    </div>
  )
}

export default async function SistemaPage() {
  const status = await getSystemStatus()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <p className="text-xs text-red-400/70 uppercase tracking-widest font-medium mb-1">Super Admin</p>
        <h1 className="text-2xl font-semibold text-white">Estado del Sistema</h1>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-1">
        <StatusRow label="Firestore"         status={status.firestore as 'ok' | 'error'} />
        <StatusRow label="NextAuth"           status={status.nextauth as 'ok' | 'missing'} />
        <StatusRow label="MercadoPago"        status={status.mercadopago as 'configured' | 'missing'} />
        <StatusRow label="Google Calendar"    status={status.googleCalendar as 'configured' | 'missing'} />
        <StatusRow
          label="Entorno"
          status="ok"
          detail={status.environment}
        />
      </div>
    </div>
  )
}
