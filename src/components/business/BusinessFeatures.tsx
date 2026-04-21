import { Calendar, BarChart3, MessageSquare, Zap, Shield, Users } from 'lucide-react';

const barData = [30, 45, 35, 60, 50, 75, 65, 85, 70, 95];

const whatsappMessages = [
  { from: 'bot', text: 'Hola Martina 👋 Te recordamos tu turno mañana a las 14:00 en Salon Ouleeh.', time: '9:00' },
  { from: 'client', text: '¡Perfecto! Ahí estaré 😊', time: '9:03' },
  { from: 'bot', text: 'Genial. Si necesitás reprogramar, respondé este mensaje.', time: '9:03' },
];

export default function BusinessFeatures() {
  return (
    <section className="py-32 bg-white dark:bg-[#050505]">
      <div className="max-w-7xl mx-auto px-8 lg:px-20">

        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-[9px] uppercase tracking-[0.4em] text-[#0a0a0a]/35 dark:text-white/25 font-inter block mb-4">
            Todo lo que necesitás
          </span>
          <h2 className="font-vogue text-5xl md:text-6xl text-[#0a0a0a] dark:text-white">
            Potencia en tiempo real.
          </h2>
          <p className="text-[#0a0a0a]/45 dark:text-white/35 font-light font-inter text-sm mt-4 max-w-md mx-auto leading-relaxed">
            Tres pilares que transforman cómo gestionás tu salón cada día.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

          {/* ── Agenda Inteligente (grande) ── */}
          <div className="md:col-span-7 bg-[#0a0a0a] border border-white/[0.07] rounded-[2rem] p-10 relative overflow-hidden
            hover:border-white/[0.12] transition-all duration-500 cursor-pointer group">
            <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-white/[0.015] rounded-full blur-[80px] pointer-events-none
              group-hover:bg-white/[0.025] transition-all duration-700" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.07] border border-white/[0.1] flex items-center justify-center mb-8">
                <Calendar className="w-4.5 h-4.5 text-white/40" strokeWidth={1.5} />
              </div>
              <h3 className="font-vogue text-3xl text-white mb-3">Agenda Inteligente</h3>
              <p className="text-white/35 font-light text-sm leading-relaxed max-w-sm font-inter mb-8">
                Tus clientas reservan 24/7 sin llamadas, sin errores, sin que vos estés presente.
              </p>
              <div className="space-y-2">
                {[
                  { name: 'Corte de Autor — Martina S.', time: '14:00', active: true },
                  { name: 'Balayage Premium — Carolina V.', time: '15:30', active: false },
                  { name: 'Tratamiento Keratina', time: '17:00', active: false },
                ].map((apt, i) => (
                  <div
                    key={apt.name}
                    className="flex justify-between items-center rounded-xl px-5 py-3.5"
                    style={{
                      background: i === 0 ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${i === 0 ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.05)'}`,
                      opacity: 1 - i * 0.25,
                    }}
                  >
                    <span className="text-sm font-inter" style={{ color: i === 0 ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.4)' }}>
                      {apt.name}
                    </span>
                    {i === 0
                      ? <span className="text-[10px] bg-white text-black px-3 py-1 rounded-full font-black font-inter tracking-wide">{apt.time}</span>
                      : <span className="text-[10px] font-inter" style={{ color: 'rgba(255,255,255,0.3)' }}>{apt.time}</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Stats (pequeño) ── */}
          <div className="md:col-span-5 bg-[#0a0a0a] border border-white/[0.07] rounded-[2rem] p-10 relative overflow-hidden
            hover:border-white/[0.12] transition-all duration-500 cursor-pointer group flex flex-col">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.07] border border-white/[0.1] flex items-center justify-center mb-8">
              <BarChart3 className="w-4.5 h-4.5 text-white/40" strokeWidth={1.5} />
            </div>
            <h3 className="font-vogue text-3xl text-white mb-3">Pulso en Real-Time</h3>
            <p className="text-white/35 font-light text-sm leading-relaxed font-inter mb-auto">
              Datos precisos para decisiones con poder.
            </p>
            <div className="mt-8">
              <div className="flex justify-between mb-3">
                <span className="text-[9px] uppercase tracking-widest font-inter" style={{ color: 'rgba(255,255,255,0.22)' }}>
                  Ingresos mensuales
                </span>
                <span className="text-[10px] font-inter" style={{ color: 'rgba(74,222,128,0.8)' }}>+32%</span>
              </div>
              <div className="flex items-end gap-1.5" style={{ height: '70px' }}>
                {barData.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all duration-300"
                    style={{
                      height: `${h}%`,
                      backgroundColor:
                        i === barData.length - 1 ? 'rgba(255,255,255,0.6)' :
                        i >= barData.length - 3 ? 'rgba(255,255,255,0.2)' :
                        'rgba(255,255,255,0.07)',
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[8px] text-white/18 font-inter">Ene</span>
                <span className="text-[8px] text-white/18 font-inter">Hoy</span>
              </div>
            </div>
          </div>

          {/* ── Automatización WhatsApp (ancho) ── */}
          <div className="md:col-span-12 bg-[#0a0a0a] border border-white/[0.07] rounded-[2rem] p-2 overflow-hidden
            hover:border-white/[0.12] transition-all duration-500">
            <div className="bg-white/[0.02] rounded-[1.75rem] p-10 flex flex-col lg:flex-row items-center gap-12">

              {/* Copy */}
              <div className="flex-1">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.07] border border-white/[0.1] flex items-center justify-center mb-8">
                  <MessageSquare className="w-4.5 h-4.5 text-white/40" strokeWidth={1.5} />
                </div>
                <span className="text-[9px] uppercase tracking-[0.3em] text-white/22 font-inter block mb-4">
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
                    <span key={tag} className="px-4 py-2 border border-white/[0.08] rounded-full text-[10px] font-inter text-white/30 uppercase tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* WhatsApp mock */}
              <div className="flex-1 w-full max-w-sm mx-auto lg:mx-0">
                <div className="rounded-2xl overflow-hidden" style={{ background: '#111B21' }}>
                  {/* WA header */}
                  <div className="px-5 py-3 flex items-center gap-3" style={{ background: '#202C33' }}>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="font-vogue text-xs text-white/60 italic">O</span>
                    </div>
                    <div>
                      <p className="text-sm font-inter text-white/85">Ouleeh Pro</p>
                      <p className="text-[10px] font-inter" style={{ color: '#53B8A4' }}>en línea</p>
                    </div>
                  </div>
                  {/* Messages */}
                  <div className="p-4 space-y-2.5" style={{ background: '#0D1117' }}>
                    {whatsappMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.from === 'client' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className="max-w-[85%] rounded-xl px-3.5 py-2.5"
                          style={{
                            background: msg.from === 'client' ? '#005C4B' : '#202C33',
                          }}
                        >
                          <p className="text-[11px] font-inter leading-relaxed" style={{ color: 'rgba(255,255,255,0.88)' }}>
                            {msg.text}
                          </p>
                          <p className="text-[9px] font-inter mt-1.5 text-right" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Fila de 3 mini-features ── */}
          {[
            {
              icon: Zap,
              title: 'Onboarding en 10 min',
              desc: 'Configurá tu salón desde cero en minutos. Sin fricción, sin técnicos.',
            },
            {
              icon: Shield,
              title: 'Datos seguros',
              desc: 'Tus datos y los de tus clientas protegidos con cifrado de nivel bancario.',
            },
            {
              icon: Users,
              title: 'Multi-staff',
              desc: 'Gestioná todo tu equipo de profesionales desde un solo panel.',
            },
          ].map(feature => (
            <div
              key={feature.title}
              className="md:col-span-4 bg-[#0a0a0a] border border-white/[0.07] rounded-[2rem] p-8 relative overflow-hidden
                hover:border-white/[0.12] transition-all duration-500 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/[0.07] border border-white/[0.1] flex items-center justify-center mb-6">
                <feature.icon className="w-4.5 h-4.5 text-white/40" strokeWidth={1.5} />
              </div>
              <h3 className="font-vogue text-xl text-white mb-2">{feature.title}</h3>
              <p className="text-white/30 font-light text-sm leading-relaxed font-inter">{feature.desc}</p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
