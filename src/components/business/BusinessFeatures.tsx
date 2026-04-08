import { Calendar, BarChart3, MessageSquare } from 'lucide-react';

const barData = [30, 45, 35, 60, 50, 75, 65, 85, 70, 95];

export default function BusinessFeatures() {
  return (
    <section className="py-24 bg-white dark:bg-[#050505]">
      <div className="max-w-7xl mx-auto px-8 lg:px-20">

        <div className="text-center mb-20">
          <span className="text-[9px] uppercase tracking-[0.4em] text-[#0a0a0a]/35 dark:text-white/25 font-inter block mb-4">
            Todo lo que necesitás
          </span>
          <h2 className="font-vogue text-5xl md:text-6xl text-[#0a0a0a] dark:text-white">
            Potencia en tiempo real.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

          {/* Feature grande — Agenda */}
          <div className="md:col-span-8 bg-[#0a0a0a] border border-white/[0.07] rounded-[2rem] p-10 relative overflow-hidden group
            hover:bg-[#0f0f0f] hover:border-white/[0.1] transition-all duration-500">
            <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-white/[0.02] rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-white/[0.07] border border-white/[0.1] flex items-center justify-center mb-8">
                <Calendar className="w-5 h-5 text-white/45" strokeWidth={1.5} />
              </div>
              <h3 className="font-vogue text-3xl text-white mb-3">Agenda Inteligente</h3>
              <p className="text-white/35 font-light text-sm leading-relaxed max-w-md font-inter mb-8">
                Sincronización fluida diseñada para eliminar fricción. Tus clientas reservan 24/7
                sin llamadas, sin errores, sin vos estar presente.
              </p>
              <div className="space-y-2.5">
                <div className="bg-white/[0.07] border border-white/[0.09] rounded-xl px-5 py-3.5 flex justify-between items-center">
                  <span className="text-sm text-white/65 font-inter">Corte de Autor — Martina S.</span>
                  <span className="text-[10px] bg-white text-black px-3 py-1 rounded-full font-black font-inter tracking-wide">14:00</span>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-5 py-3.5 flex justify-between items-center opacity-55">
                  <span className="text-sm text-white/45 font-inter">Balayage Premium — Carolina V.</span>
                  <span className="text-[10px] text-white/35 font-inter">15:30</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-5 py-3.5 flex justify-between items-center opacity-30">
                  <span className="text-sm text-white/35 font-inter">Tratamiento Keratina</span>
                  <span className="text-[10px] text-white/25 font-inter">17:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature — Stats */}
          <div className="md:col-span-4 bg-[#0a0a0a] border border-white/[0.07] rounded-[2rem] p-10 relative overflow-hidden
            hover:bg-[#0f0f0f] hover:border-white/[0.1] transition-all duration-500 flex flex-col">
            <div className="w-11 h-11 rounded-2xl bg-white/[0.07] border border-white/[0.1] flex items-center justify-center mb-8">
              <BarChart3 className="w-5 h-5 text-white/45" strokeWidth={1.5} />
            </div>
            <h3 className="font-vogue text-3xl text-white mb-3">Pulso en Real-Time</h3>
            <p className="text-white/35 font-light text-sm leading-relaxed font-inter mb-8">
              Datos precisos para decisiones con poder.
            </p>
            {/* Gráfico de barras — divs con altura explícita en px para garantizar render */}
            <div className="mt-auto">
              <div className="flex items-end gap-1.5" style={{ height: '80px' }}>
                {barData.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      backgroundColor: i === barData.length - 1
                        ? 'rgba(255,255,255,0.55)'
                        : i >= barData.length - 3
                        ? 'rgba(255,255,255,0.22)'
                        : 'rgba(255,255,255,0.07)',
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[8px] text-white/20 font-inter">Ene</span>
                <span className="text-[8px] text-white/20 font-inter">Hoy</span>
              </div>
            </div>
          </div>

          {/* Feature ancha — Automatización */}
          <div className="md:col-span-12 bg-[#0a0a0a] border border-white/[0.07] rounded-[2rem] p-2 overflow-hidden">
            <div className="bg-white/[0.02] rounded-[1.75rem] p-10 flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="w-11 h-11 rounded-2xl bg-white/[0.07] border border-white/[0.1] flex items-center justify-center mb-8">
                  <MessageSquare className="w-5 h-5 text-white/45" strokeWidth={1.5} />
                </div>
                <span className="text-[9px] uppercase tracking-[0.3em] text-white/25 font-inter block mb-4">
                  Automation Core
                </span>
                <h3 className="font-vogue text-4xl text-white mb-4">
                  Gestión Automatizada
                </h3>
                <p className="text-white/35 font-light text-sm leading-relaxed font-inter mb-8 max-w-lg">
                  Recordatorios inteligentes vía WhatsApp que reducen la inasistencia hasta un 45%.
                  Enfocate en el arte del servicio — el resto corre solo.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['WhatsApp Sincronizado', 'Recordatorios Automáticos', 'AI Scheduling'].map(tag => (
                    <span key={tag} className="px-4 py-2 border border-white/[0.09] rounded-full text-[10px] font-inter text-white/35 uppercase tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(5,5,5,0.5) 0%, transparent 100%)' }} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
