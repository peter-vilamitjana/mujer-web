const weekData = [
  { label: 'LUN', height: 40, value: '$12k' },
  { label: 'MAR', height: 62, value: '$18k' },
  { label: 'MIE', height: 32, value: '$9k' },
  { label: 'JUE', height: 100, value: '$29k', highlight: true },
  { label: 'VIE', height: 58, value: '$17k' },
  { label: 'SAB', height: 75, value: '$22k' },
  { label: 'DOM', height: 44, value: '$13k' },
];

export default function BusinessDashboardMock() {
  return (
    <section className="py-24 bg-white dark:bg-[#050505]">
      <div className="max-w-7xl mx-auto px-8 lg:px-20">

        <div className="text-center mb-16">
          <span className="text-[9px] uppercase tracking-[0.4em] text-[#0a0a0a]/35 dark:text-white/25 font-inter block mb-4">
            La experiencia
          </span>
          <h2 className="font-vogue text-5xl md:text-6xl text-[#0a0a0a] dark:text-white mb-4">
            Minimalismo funcional.
          </h2>
          <p className="text-[#0a0a0a]/50 dark:text-white/35 font-light font-inter max-w-md mx-auto text-sm leading-relaxed">
            Una interfaz que desaparece para dejar que tu trabajo brille.
          </p>
        </div>

        {/* Mock container */}
        <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-[2.5rem] p-3">
          <div className="bg-[#050504] rounded-[2.25rem] overflow-hidden">

            {/* Top bar */}
            <div className="px-8 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-8">
                <span className="font-vogue text-base italic text-white/70">Pro Workspace</span>
                <div className="hidden md:flex items-center gap-1">
                  {['Dashboard', 'Agenda', 'Clientes', 'Finanzas'].map((item, i) => (
                    <span
                      key={item}
                      className="px-4 py-1.5 rounded-full text-xs font-inter transition-colors"
                      style={{
                        background: i === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
                        color: i === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div
                className="w-7 h-7 rounded-full border border-white/[0.1] flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.35)' }} />
              </div>
            </div>

            {/* Content */}
            <div className="p-8">

              {/* Greeting */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="text-lg font-light text-white/75 mb-1 font-inter">Buenos días, Carolina</h4>
                  <p className="text-xs text-white/25 font-inter">Tenés 12 turnos para hoy</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[10px] text-green-400 font-inter">94% ocupación</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Ingresos', value: '$45.200', sub: '+12%', subColor: 'rgba(74,222,128,0.8)' },
                  { label: 'Nuevas clientas', value: '+8', sub: 'este mes', subColor: 'rgba(255,255,255,0.25)' },
                  { label: 'Turnos hoy', value: '12', sub: '4 completados', subColor: 'rgba(255,255,255,0.25)' },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-5"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <p className="text-[9px] uppercase tracking-widest mb-2 font-inter" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {stat.label}
                    </p>
                    <p className="font-vogue text-2xl text-white">{stat.value}</p>
                    <p className="text-[10px] font-inter mt-1" style={{ color: stat.subColor }}>{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Gráfico */}
              <div
                className="rounded-xl p-6"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h5 className="text-sm font-inter text-white/65">Rendimiento semanal</h5>
                    <p className="text-[10px] text-white/25 font-inter mt-0.5">Ingresos por día</p>
                  </div>
                  <div className="flex gap-1.5">
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-inter font-semibold"
                      style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                    >Semana</span>
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-inter"
                      style={{ color: 'rgba(255,255,255,0.25)' }}
                    >Mes</span>
                  </div>
                </div>

                {/* Barras — height explícito en px */}
                <div className="flex items-end justify-between gap-3" style={{ height: '100px' }}>
                  {weekData.map(({ label, height, highlight }) => (
                    <div key={label} className="flex-1 flex flex-col items-center gap-2" style={{ height: '100%' }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                        <div
                          style={{
                            width: '100%',
                            height: `${height}%`,
                            borderRadius: '4px 4px 0 0',
                            backgroundColor: highlight
                              ? 'rgba(255,255,255,0.55)'
                              : 'rgba(255,255,255,0.08)',
                            transition: 'background-color 0.3s',
                          }}
                        />
                      </div>
                      <span
                        className="text-[9px] font-inter"
                        style={{ color: highlight ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.2)' }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
