import { getAllTenants } from '@/actions/superadmin.actions'
import { SalonesTable } from './_components/SalonesTable'

export default async function SalonesPage() {
  const tenants = await getAllTenants()

  return (
    <div className="max-w-[1400px] mx-auto pb-6">
      <div className="mb-8 md:mb-10">
        <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.4em] font-bold mb-2">Super Admin · Gestión</p>
        <div className="flex items-end justify-between">
          <h1 className="font-playfair text-3xl md:text-4xl italic text-[#f5f0e8]">Salones</h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total', value: tenants.length, color: 'text-[#f5f0e8]' },
          {
            label: 'Activos',
            value: tenants.filter(t => t.isActivePublicly !== false).length,
            color: 'text-emerald-400'
          },
          {
            label: 'Inactivos',
            value: tenants.filter(t => t.isActivePublicly === false).length,
            color: 'text-rose-400'
          },
        ].map(({ label, value, color }) => (
          <div key={label}
            className="relative isolate rounded-[1.5rem] border border-white/[0.06]
              bg-[#0d0d0d]/80 p-4 text-center overflow-hidden">
            <div className="absolute inset-0 liquid-glass-rich pointer-events-none -z-10" />
            <p className={`font-playfair text-3xl italic ${color}`}>{value}</p>
            <p className="text-[9px] text-[#7a766e] uppercase tracking-widest font-bold mt-1">
              {label}
            </p>
          </div>
        ))}
      </div>

      <SalonesTable initialTenants={tenants} />
    </div>
  )
}
