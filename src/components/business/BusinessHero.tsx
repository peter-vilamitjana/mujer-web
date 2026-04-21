"use client";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { motion } from "framer-motion";

const weekData = [
  { label: "LUN", height: 40, highlight: false },
  { label: "MAR", height: 62, highlight: false },
  { label: "MIE", height: 32, highlight: false },
  { label: "JUE", height: 100, highlight: true },
  { label: "VIE", height: 58, highlight: false },
  { label: "SAB", height: 75, highlight: false },
  { label: "DOM", height: 44, highlight: false },
];

const appointments = [
  { name: "Corte de Autor — Martina S.", time: "14:00" },
  { name: "Balayage Premium — Carolina V.", time: "15:30" },
  { name: "Tratamiento Keratina", time: "17:00" },
];

export default function BusinessHero() {
  return (
    <>
      {/* ── Sección 1: Hero con BackgroundPaths ── */}
      <BackgroundPaths
        title="Transformá tu salón."
        subtitle="Gestión sofisticada para el profesional contemporáneo. Agenda, clientes, métricas y pagos — todo en un lugar."
        cta={{
          label: "Comenzar gratis",
          href: "/business/register",
          secondary: { label: "Ver la plataforma", href: "/explore" },
        }}
        stats={[
          { value: "+340", label: "Salones activos" },
          { value: "42k", label: "Reservas / mes" },
          { value: "Free", label: "Para empezar" },
        ]}
      />

      {/* ── Sección 2: ContainerScroll — el dashboard se desdobla en 3D ── */}
      <div className="bg-white dark:bg-[#050505] overflow-hidden relative">
        {/* Ambient Glow */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/10 dark:bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />
        <ContainerScroll
          titleComponent={
            <div className="flex flex-col items-center gap-4 pb-4">
              <span className="text-[9px] uppercase tracking-[0.4em] text-[#0a0a0a]/60 dark:text-white/60 font-inter">
                La experiencia
              </span>
              <h2 className="font-vogue text-5xl md:text-6xl text-[#0a0a0a] dark:text-white leading-[0.9]">
                Minimalismo funcional.
              </h2>
              <p className="text-[#0a0a0a]/60 dark:text-white/60 font-light font-inter text-sm leading-relaxed max-w-sm mx-auto text-center">
                Una interfaz que desaparece para dejar que tu trabajo brille.
              </p>
            </div>
          }
        >
          {/* ── Dashboard mock ── */}
          <motion.div 
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="h-full flex flex-col bg-[#050504]"
          >

            {/* Top bar */}
            <div className="px-5 md:px-7 py-3.5 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-5">
                <span className="font-vogue text-sm italic text-white/65">Pro Workspace</span>
                <div className="hidden md:flex items-center gap-0.5">
                  {["Dashboard", "Agenda", "Clientes", "Finanzas"].map((item, i) => (
                    <span
                      key={item}
                      className="px-3 py-1.5 rounded-full text-[11px] font-inter"
                      style={{
                        background: i === 0 ? "rgba(255,255,255,0.15)" : "transparent",
                        color: i === 0 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.6)",
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[10px] text-green-400 font-inter">En vivo</span>
                </div>
                <div
                  className="w-7 h-7 rounded-full border border-white/[0.1] flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.35)" }} />
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 min-h-0 p-5 md:p-6 flex flex-col gap-4 overflow-hidden">

              {/* Greeting row */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-light text-white/90 font-inter">
                    Buenos días, <span className="text-white font-medium">Carolina</span>
                  </p>
                  <p className="text-[10px] text-white/60 font-inter mt-0.5">Tenés 12 turnos para hoy</p>
                </div>
                <div className="text-right">
                  <p className="font-vogue text-2xl text-white">$45.200</p>
                  <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(74,222,128,0.8)" }}>+12% hoy</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { label: "Ingresos", value: "$45.200", sub: "+12%", green: true },
                  { label: "Nuevas clientas", value: "+8", sub: "este mes", green: false },
                  { label: "Turnos hoy", value: "12", sub: "4 completos", green: false },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-3 md:p-4"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <p className="text-[8px] uppercase tracking-widest mb-1.5 font-inter" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {stat.label}
                    </p>
                    <p className="font-vogue text-lg md:text-xl text-white leading-none">{stat.value}</p>
                    <p className="text-[9px] font-inter mt-1.5" style={{ color: stat.green ? "rgba(74,222,128,0.9)" : "rgba(255,255,255,0.6)" }}>
                      {stat.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bottom: appointments + chart */}
              <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-3 flex-1 min-h-0">

                {/* Appointments */}
                <div
                  className="rounded-xl p-4 flex flex-col gap-3 overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <p className="text-[8px] uppercase tracking-[0.35em] font-inter flex-shrink-0" style={{ color: "rgba(255,255,255,0.6)" }}>
                    Próximos turnos
                  </p>
                  <div className="space-y-1.5">
                    {appointments.map((apt, i) => (
                      <div
                        key={apt.name}
                        className="flex items-center justify-between rounded-lg px-3 py-2.5"
                        style={{
                          background: i === 0 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                          border: `1px solid ${i === 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}`,
                          opacity: 1 - i * 0.25,
                        }}
                      >
                        <span className="text-[10px] text-white/80 font-inter truncate pr-2">{apt.name}</span>
                        <span
                          className="text-[10px] font-inter font-semibold flex-shrink-0"
                          style={{ color: i === 0 ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.6)" }}
                        >
                          {apt.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart */}
                <div
                  className="rounded-xl p-4 flex flex-col gap-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex justify-between items-start flex-shrink-0">
                    <p className="text-[8px] uppercase tracking-[0.35em] font-inter" style={{ color: "rgba(255,255,255,0.6)" }}>
                      Rendimiento
                    </p>
                    <span className="text-[10px] font-inter font-semibold" style={{ color: "rgba(74,222,128,0.8)" }}>
                      +18%
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-1.5 flex-1" style={{ minHeight: "50px" }}>
                    {weekData.map(({ label, height, highlight }) => (
                      <div key={label} className="flex-1 flex flex-col items-center gap-1" style={{ height: "100%" }}>
                        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                          <div
                            style={{
                              width: "100%",
                              height: `${height}%`,
                              borderRadius: "3px 3px 0 0",
                              backgroundColor: highlight ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.08)",
                            }}
                          />
                        </div>
                        <span className="text-[8px] font-inter" style={{ color: highlight ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </ContainerScroll>
      </div>
    </>
  );
}
