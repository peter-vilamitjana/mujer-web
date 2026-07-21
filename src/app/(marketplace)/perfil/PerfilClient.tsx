'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { AlertTriangle, Target } from 'lucide-react';
import {
  type HistorialEntry,
  type HairProfile,
  type SerializedPreferences,
  type FavoriteSalonData,
  updateMyPreferences,
  updateMyHairProfile,
  cancelMyAppointment,
} from '@/actions/profile.actions';
import ExplorarTab from './ExplorarTab';

// Condition → score and badge label
const CONDITION_SCORE: Record<string, number> = {
  sano: 90, procesado: 75, dañado: 55, 'muy-dañado': 35,
};
const CONDITION_LABEL: Record<string, string> = {
  sano: 'Excelente', procesado: 'Buen estado', dañado: 'En tratamiento', 'muy-dañado': 'Atención',
};
const SLOT_TO_LABEL = { morning: 'Mañana', afternoon: 'Tarde', evening: 'Noche' } as const;
const LABEL_TO_SLOT = { Mañana: 'morning', Tarde: 'afternoon', Noche: 'evening' } as const;

// Placeholder evolution — replaced when TechnicalRecord feature ships
const STATIC_EVOLUTION = [
  { month: 'Oct', score: 65 },
  { month: 'Nov', score: 55 },
  { month: 'Dic', score: 60 },
  { month: 'Ene', score: 70 },
  { month: 'Feb', score: 75 },
  { month: 'Abr', score: 80 },
];

const MAP_POSITIONS = [
  { x: '35%', y: '45%' },
  { x: '65%', y: '25%' },
  { x: '50%', y: '65%' },
];

interface Props {
  initialAppointments: HistorialEntry[];
  initialHairProfile: HairProfile | null;
  initialPreferences: SerializedPreferences | null;
  initialFavorites: FavoriteSalonData[];
  initialPhone?: string;
}

function fmtDay(ms: number) { return new Date(ms).toLocaleDateString('es-AR', { day: '2-digit' }); }
function fmtMonth(ms: number) { return new Date(ms).toLocaleDateString('es-AR', { month: 'long' }).toUpperCase(); }
function fmtTime(ms: number) { return new Date(ms).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: true }); }

export default function PerfilClient({
  initialAppointments,
  initialHairProfile,
  initialPreferences,
  initialFavorites,
  initialPhone,
}: Props) {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const userInitial = userName.charAt(0).toUpperCase() || '?';

  const [activeTab, setActiveTab] = React.useState<'panel' | 'turnos' | 'perfil' | 'explorar'>('panel');
  const [upcomingAppointments, setUpcomingAppointments] = React.useState<HistorialEntry[]>(initialAppointments);
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);

  // ── Preferences (server-synced, debounced save) ──────────────────────────
  const [preferredZone, setPreferredZone] = React.useState(
    initialPreferences?.preferredZone ?? 'Palermo',
  );
  const [config, setConfig] = React.useState({
    whatsappNotif: initialPreferences?.notifications?.whatsappReminder ?? true,
    reminderTime: '24hs',
    preferredTime: initialPreferences?.preferredTimeSlot
      ? (SLOT_TO_LABEL[initialPreferences.preferredTimeSlot] ?? 'Mañana')
      : 'Mañana',
  });

  const prefTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const schedulePreferenceSave = React.useCallback(
    (zone: string, cfg: typeof config) => {
      clearTimeout(prefTimer.current);
      prefTimer.current = setTimeout(() => {
        updateMyPreferences({
          preferredZone: zone,
          preferredTimeSlot:
            LABEL_TO_SLOT[cfg.preferredTime as keyof typeof LABEL_TO_SLOT] ?? 'morning',
          notifications: {
            whatsappReminder: cfg.whatsappNotif,
            reminderHoursBefore: 24,
            favoriteSalonUpdates: true,
          },
        }).catch(console.error);
      }, 800);
    },
    [],
  );

  // ── Hair data (derived from server hairProfile) ──────────────────────────
  const hairScore = CONDITION_SCORE[initialHairProfile?.condition ?? ''] ?? 80;
  const hairStatusLabel = CONDITION_LABEL[initialHairProfile?.condition ?? ''] ?? 'Buen estado';
  const hairAllergy = initialHairProfile?.allergies?.[0] ?? null;
  const hairGoal = initialHairProfile?.goal ?? null;
  const hairType = initialHairProfile?.type ?? null;
  const hairCondition = initialHairProfile?.condition ?? null;
  const ringOffset = 213.6 * (1 - hairScore / 100);

  // ── Hair profile editing ─────────────────────────────────────────────────
  const [hairForm, setHairForm] = React.useState({
    type:      initialHairProfile?.type      ?? '',
    thickness: initialHairProfile?.thickness ?? '',
    condition: initialHairProfile?.condition ?? '',
    goal:      initialHairProfile?.goal      ?? '',
    allergies: initialHairProfile?.allergies?.join(', ') ?? '',
  });
  const [hairSaving, setHairSaving] = React.useState(false);
  const [hairSaved,  setHairSaved]  = React.useState(false);
  const [hairError,  setHairError]  = React.useState<string | null>(null);

  const hairFormScore = CONDITION_SCORE[hairForm.condition] ?? hairScore;
  const hairFormLabel = CONDITION_LABEL[hairForm.condition] ?? hairStatusLabel;

  // ── Favorites for the panel map widget ───────────────────────────────────
  const mySalons = initialFavorites.slice(0, 3).map((s, i) => ({
    id: i + 1,
    name: s.name,
    slug: s.slug,
    coords: MAP_POSITIONS[i] ?? { x: '50%', y: '50%' },
  }));

  const confirmedCount = upcomingAppointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'pending',
  ).length;
  const nextAppointment = upcomingAppointments[0] ?? null;

  const handleSaveHairProfile = async () => {
    setHairSaving(true);
    setHairError(null);
    const result = await updateMyHairProfile({
      type:      hairForm.type      || undefined,
      thickness: hairForm.thickness || undefined,
      condition: hairForm.condition || undefined,
      goal:      hairForm.goal      || undefined,
      allergies: hairForm.allergies
        ? hairForm.allergies.split(',').map(a => a.trim()).filter(Boolean)
        : [],
    });
    setHairSaving(false);
    if (result.success) {
      setHairSaved(true);
      setTimeout(() => setHairSaved(false), 2500);
    } else {
      setHairError(result.error ?? 'Error al guardar.');
    }
  };

  const handleCancelAppointment = async (appt: HistorialEntry) => {
    if (!appt.tenantId) return;
    setCancellingId(appt.id);
    const result = await cancelMyAppointment(appt.id, appt.tenantId);
    if (result.success) {
      setUpcomingAppointments((prev) =>
        prev.map((a) =>
          a.id === appt.id ? { ...a, status: 'cancelled' as const } : a,
        ),
      );
    }
    setCancellingId(null);
  };

  return (
    <div
      className="min-h-screen text-[#f5f0e8] font-body selection:bg-[#f1c97d] selection:text-[#050504] relative"
      style={{
        background:
          'radial-gradient(circle at 0% 0%, #1a160f 0%, #050504 50%), radial-gradient(circle at 100% 100%, #121212 0%, #050504 50%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <style>{`
        .mesh-glow {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none; z-index: -1;
          background:
            radial-gradient(circle at 20% 30%, rgba(241,201,125,0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(241,201,125,0.03) 0%, transparent 40%);
        }
        .sidebar-expand { width: 60px !important; }
        .sidebar-expand:hover { width: 220px !important; }
      `}</style>
      <div className="mesh-glow" />

      {/* Sidebar */}
      <aside className="fixed left-3 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 group sidebar-expand">
        <div className="liquid-glass-floating rounded-[2rem] flex flex-col py-5 px-2 gap-1 w-full overflow-hidden">

          <Link href="/" className="flex items-center gap-4 px-[5px] mb-6 group/logo cursor-pointer">
            <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-b from-white/[0.15] to-transparent p-[1px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover/logo:shadow-[0_0_15px_rgba(241,201,125,0.15)] group-hover/logo:scale-105">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1c1c1e] to-[#0a0a0c] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#f1c97d]/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
                <span className="font-headline italic text-[#f5f0e8] text-[15px] tracking-widest relative z-10 transition-colors duration-500 group-hover/logo:text-[#f1c97d]">M</span>
              </div>
            </div>
            <span className="text-xl font-headline italic text-[#f5f0e8] group-hover/logo:text-[#f1c97d] opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap">Ouleeh</span>
          </Link>

          <nav className="flex flex-col gap-1 w-full">
            {([
              { tab: 'panel', icon: 'dashboard', label: 'Panel' },
              { tab: 'turnos', icon: 'calendar_month', label: 'Turnos' },
              { tab: 'explorar', icon: 'explore', label: 'Explorar' },
            ] as const).map(({ tab, icon, label }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full h-10 rounded-xl flex items-center gap-4 px-2.5 transition-all duration-200 cursor-pointer ${activeTab === tab ? 'text-[#f1c97d] bg-white/[0.08]' : 'text-[#7a766e] hover:text-[#f1c97d] hover:bg-white/5'}`}
              >
                <span className="material-symbols-outlined text-[19px] flex-shrink-0">{icon}</span>
                <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">{label}</span>
              </button>
            ))}
            <Link
              href="/perfil/favoritos"
              className="w-full h-10 rounded-xl flex items-center gap-4 px-2.5 text-[#7a766e] hover:text-[#f1c97d] hover:bg-white/5 transition-all duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px] flex-shrink-0">favorite</span>
              <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Favoritos</span>
            </Link>
            <button
              onClick={() => setActiveTab('perfil')}
              className={`w-full h-10 rounded-xl flex items-center gap-4 px-2.5 transition-all duration-200 cursor-pointer ${activeTab === 'perfil' ? 'text-[#f1c97d] bg-white/[0.08]' : 'text-[#7a766e] hover:text-[#f1c97d] hover:bg-white/5'}`}
            >
              <span className="material-symbols-outlined text-[19px] flex-shrink-0">person</span>
              <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Perfil</span>
            </button>
          </nav>

          <div className="w-full h-px bg-white/10 my-2 opacity-50" />

          <div className="flex flex-col gap-1 w-full">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full h-10 rounded-xl flex items-center gap-4 px-2.5 text-[#7a766e] hover:text-[#f1c97d] hover:bg-white/5 transition-all duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px] flex-shrink-0">logout</span>
              <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Salir</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-40 px-12 py-6 flex justify-end items-center pointer-events-none">
        <div className="flex items-center gap-8 pointer-events-auto">
          <div className="flex items-center gap-6 liquid-glass-rich px-4 py-2 rounded-full">
            <button className="relative flex items-center">
              <span className="material-symbols-outlined text-[#7a766e] hover:text-[#f1c97d] transition-colors text-[20px]">notifications</span>
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#f1c97d] rounded-full shadow-[0_0_8px_rgba(241,201,125,0.8)]" />
            </button>
            <div className="flex items-center gap-4 border-l border-white/10 pl-4">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#f5f0e8]">{userName}</p>
                <p className="text-[8px] text-[#f1c97d] uppercase tracking-[0.15em]">Premium</p>
              </div>
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={userName}
                  className="w-9 h-9 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className="w-9 h-9 rounded-full border border-white/20 bg-[#050504] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[#f1c97d]">{userInitial}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pl-[84px] pr-16 pt-32 pb-24 min-h-screen">
        <div className="max-w-6xl mx-auto w-full relative transform-gpu">

          {/* ── PANEL ─────────────────────────────────────────────────────────── */}
          {activeTab === 'panel' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h1 className="text-5xl font-body font-light text-[#f5f0e8] mb-2">Mi Panel</h1>
                  <p className="text-[#7a766e] text-xs tracking-wide">Tu espacio personal de estética y bienestar</p>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6 items-stretch">
                {/* COL IZQUIERDA — span 8 */}
                <div className="col-span-8 flex flex-col gap-6 h-full">

                  {/* Próximo Turno */}
                  <div>
                    <p className="text-[9px] font-label uppercase tracking-[0.2em] text-[#7a766e] mb-3 ml-1">Tu próximo turno</p>
                    {nextAppointment ? (
                      <div className="relative isolate z-0 overflow-hidden rounded-[2rem] p-0 flex flex-row w-full transition-all duration-700 hover:scale-[1.01] hover:bg-white/[0.02] border border-white/10 group" style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
                        <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-20" />
                        <div className="flex flex-col items-center justify-center w-[150px] shrink-0 border-r border-dashed border-white/10 px-6 py-8 relative z-10">
                          <span className="text-5xl font-headline text-[#f1c97d] leading-none" style={{ textShadow: '0 0 30px rgba(241,201,125,0.3)' }}>{fmtDay(nextAppointment.dateMs)}</span>
                          <span className="text-[10px] font-headline italic tracking-[0.1em] text-[#7a766e] mt-2 lowercase">{fmtMonth(nextAppointment.dateMs)}</span>
                          <span className="text-sm font-headline italic text-[#f5f0e8] mt-3">{fmtTime(nextAppointment.dateMs)}</span>
                        </div>
                        <div className="flex-1 px-8 py-6 flex flex-col justify-center relative z-10">
                          <div className="flex items-center gap-2.5 mb-2">
                            <p className="text-[10px] font-label uppercase tracking-[0.2em] text-[#f1c97d]">{nextAppointment.salonName}</p>
                          </div>
                          <h2 className="text-2xl font-headline italic text-[#f5f0e8] mb-1 leading-tight">{nextAppointment.service}</h2>
                          {nextAppointment.staffName && (
                            <p className="text-[11px] text-[#7a766e] mt-1">con {nextAppointment.staffName}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-4">
                            <Link href={`/salones/${nextAppointment.salonSlug}`} className="h-8 px-4 rounded-full border border-white/10 hover:border-[#f1c97d]/30 hover:bg-[#f1c97d]/5 transition-all text-[10px] uppercase tracking-[0.1em] font-label text-[#7a766e] hover:text-[#f1c97d] flex items-center gap-2">
                              <span className="material-symbols-outlined text-[14px]">storefront</span> Ver salón
                            </Link>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative isolate z-0 overflow-hidden rounded-[2rem] flex flex-col items-center justify-center h-[140px] border border-white/10 gap-3">
                        <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-20" />
                        <p className="text-[#7a766e] text-sm">No tenés turnos próximos</p>
                        <Link href="/explore" className="text-[10px] font-label uppercase tracking-widest text-[#f1c97d] hover:opacity-70 transition-opacity">Explorar salones →</Link>
                      </div>
                    )}
                  </div>

                  {/* Sugerencias para vos */}
                  <div className="relative isolate z-0 rounded-[2rem] overflow-hidden min-h-[260px] flex flex-col items-center justify-center gap-3 border border-white/10" style={{ boxShadow: '0 0 30px -10px rgba(255,255,255,0.05)' }}>
                    <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-20" />
                    <div className="inline-flex px-3.5 py-1.5 bg-white/[0.03] border border-white/10 rounded-full">
                      <span className="text-[8px] font-label uppercase tracking-[0.2em] text-[#7a766e]">PARA VOS</span>
                    </div>
                    <p className="text-[#7a766e] text-sm text-center max-w-[280px]">Todavía no tenemos sugerencias para vos</p>
                    <Link href="/explore" className="text-[10px] font-label uppercase tracking-widest text-[#f1c97d] hover:opacity-70 transition-opacity">Explorar salones →</Link>
                  </div>
                </div>

                {/* COL DERECHA — span 4 */}
                <div className="col-span-4 flex flex-col gap-6 h-full">
                  <div>
                    <p className="text-[9px] font-label uppercase tracking-[0.2em] text-[#7a766e] mb-3 ml-1">Tu expediente</p>
                    <div className="relative isolate overflow-hidden rounded-[2rem] p-6 flex flex-col border border-white/10">
                      <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
                      <h3 className="text-xl font-body font-light text-[#f5f0e8] mb-1.5 flex items-center gap-2.5 relative z-10">
                        Tu Cabello
                        {initialHairProfile && (
                          <span className="inline-flex items-center justify-center p-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                            <span className="material-symbols-outlined text-[11px]">check</span>
                          </span>
                        )}
                      </h3>
                      {initialHairProfile ? (
                        <div className="flex flex-col gap-2.5 mt-3 mb-5 relative z-10">
                          <div>
                            <p className="text-[8px] font-label uppercase tracking-[0.2em] text-[#7a766e] mb-1">Tipo</p>
                            <p className="text-[#f1c97d] font-headline italic text-base leading-tight capitalize">{hairType ?? '—'}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-label uppercase tracking-[0.2em] text-[#7a766e] mb-1">Condición</p>
                            <p className="text-[#f5f0e8] font-headline italic text-base leading-tight">{hairStatusLabel}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 mt-3 mb-5 relative z-10">
                          <p className="text-[11px] text-[#7a766e] leading-relaxed">Completá tu ficha capilar en la pestaña Perfil.</p>
                        </div>
                      )}
                      <div className="relative z-10 mb-5">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[9px] font-label uppercase tracking-[0.15em] text-[#f1c97d]">{hairScore}%</p>
                          <p className="text-[8px] text-[#7a766e] font-label">{hairStatusLabel}</p>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full relative overflow-hidden" style={{ width: `${hairScore}%`, background: 'linear-gradient(90deg, rgba(241,201,125,0.4) 0%, rgba(241,201,125,1) 100%)' }}>
                            <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30" />
                          </div>
                        </div>
                      </div>
                      <div className="relative z-10 mt-auto pt-6 border-t border-white/5">
                        <button onClick={() => setActiveTab('perfil')} className="text-[9px] uppercase tracking-widest text-[#f1c97d] hover:text-[#f5f0e8] transition-colors flex items-center gap-1 group/link font-label cursor-pointer">
                          {initialHairProfile ? 'Ver expediente' : 'Completar perfil'} <span className="material-symbols-outlined text-[12px] group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="relative isolate overflow-hidden rounded-[2rem] p-6 border border-white/10 flex flex-col justify-center min-h-[180px] flex-grow">
                    <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
                    <div className="relative z-10">
                      <span className="text-[8px] font-label uppercase tracking-[0.2em] text-[#7a766e] mb-2.5 block">DESCUBRIMIENTO</span>
                      <h3 className="text-lg lg:text-xl font-body font-light text-[#f5f0e8] mb-5">¿Qué necesitás hoy?</h3>
                      <div className="flex flex-wrap gap-2">
                        <button className="px-4 py-2 rounded-full border border-[#f1c97d]/30 bg-[#f1c97d]/10 hover:bg-[#f1c97d]/20 transition-all text-[9px] uppercase font-label tracking-[0.1em] text-[#f1c97d] cursor-pointer flex-grow text-center flex items-center justify-center gap-1.5 mb-1.5">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span> Agendar Turno
                        </button>
                        {['Corte', 'Color', 'Tratamiento', 'Uñas', 'Maquillaje'].map((tag) => (
                          <button key={tag} className="px-3.5 py-1.5 rounded-full border border-white/10 bg-[#050504]/40 hover:border-[#f1c97d]/30 hover:bg-[#f1c97d]/5 transition-all text-[8px] uppercase font-label tracking-[0.1em] text-[#f5f0e8] hover:text-[#f1c97d] cursor-pointer flex-grow text-center">
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TUS SALONES */}
              <div className="mt-8 mb-12">
                <div className="flex justify-between items-center mb-4 ml-1">
                  <p className="text-[9px] font-label uppercase tracking-[0.2em] text-[#7a766e] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[13px] text-[#f1c97d]">explore</span> Tus salones
                  </p>
                  <Link href="/perfil/favoritos" className="text-[9px] uppercase tracking-widest text-[#f1c97d] hover:text-[#f5f0e8] transition-colors font-label cursor-pointer flex items-center gap-1 group/btn">
                    Ver todos <span className="material-symbols-outlined text-[14px] group-hover/btn:translate-x-1 transition-transform">arrow_forward_ios</span>
                  </Link>
                </div>
                <div className="relative isolate z-0 overflow-hidden rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row min-h-[290px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] bg-[#151515]">
                  <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-20" />
                  {/* Mapa vectorial */}
                  <div className="flex-1 relative bg-[#0a0a0c] border-r border-white/5 overflow-hidden">
                    <div className="absolute inset-0 origin-center rotate-[-12deg] scale-[1.3] pointer-events-none z-0 opacity-40">
                      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.06) 2px, transparent 2px), linear-gradient(to bottom, rgba(255,255,255,0.06) 2px, transparent 2px)', backgroundSize: '140px 140px' }} />
                      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '35px 35px' }} />
                      <div className="absolute top-[30%] left-0 w-full h-[6px] bg-[#f1c97d]/10 shadow-[0_0_15px_rgba(241,201,125,0.1)] -rotate-6" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-transparent to-[#0a0a0c]/80 pointer-events-none z-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c]/90 via-transparent to-[#0a0a0c]/40 pointer-events-none z-0" />
                    {mySalons.map((salon) => (
                      <div key={salon.id} className="absolute group/pin cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-1 z-10" style={{ left: salon.coords.x, top: salon.coords.y }}>
                        <div className="relative flex flex-col items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.6)] relative z-10">
                            <div className="w-2.5 h-2.5 bg-gradient-to-br from-[#f1c97d] to-[#d4af37] rounded-full shadow-[0_0_10px_rgba(241,201,125,0.8)]" />
                          </div>
                          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white/30 -mt-[2px] opacity-80 z-0" />
                          <div className="w-1.5 h-1.5 bg-black/40 rounded-full mt-1 blur-[2px]" />
                          <div className="absolute top-1/2 -translate-y-1/2 left-full ml-3 opacity-80 group-hover/pin:opacity-0 transition-opacity whitespace-nowrap pointer-events-none z-0">
                            <span className="text-[10px] font-headline italic tracking-wide text-[#f5f0e8] drop-shadow-md">{salon.name.split(' ')[0]}</span>
                          </div>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover/pin:opacity-100 transition-all duration-300 translate-y-3 group-hover/pin:translate-y-0 bg-[#252528]/80 border border-white/10 px-4 py-3 rounded-2xl backdrop-blur-2xl pointer-events-none whitespace-nowrap z-20 shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col items-center">
                            <p className="text-[12px] text-[#f5f0e8] font-medium tracking-wide mb-1 flex items-center gap-1.5">{salon.name} <span className="material-symbols-outlined text-[12px] text-[#f1c97d]">verified</span></p>
                            <p className="text-[8px] text-[#63d297] font-medium uppercase tracking-[0.1em]">Disponible hoy</p>
                            <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#252528]/80 border-b border-r border-white/10 rotate-45 backdrop-blur-2xl" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="absolute bottom-5 right-5 z-10 flex flex-col gap-2">
                      <button className="w-8 h-8 bg-white/10 backdrop-blur-xl border border-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-[#f5f0e8] transition-all cursor-pointer shadow-lg">
                        <span className="material-symbols-outlined text-[16px]">my_location</span>
                      </button>
                    </div>
                  </div>
                  {/* Lista */}
                  <div className="w-full md:w-[320px] p-0 flex flex-col relative z-10 bg-[#121214] border-l border-white/5">
                    <div className="px-6 py-5 border-b border-white/5 bg-[#0a0a0c]">
                      <h3 className="text-xl font-body font-light text-[#f5f0e8]">Lugares Guardados</h3>
                      <p className="text-[10px] font-label tracking-widest text-[#7a766e] uppercase mt-1">Tu selección</p>
                    </div>
                    <div className="flex flex-col flex-1 p-3 gap-2 overflow-y-auto">
                      {mySalons.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8">
                          <p className="text-[11px] text-[#7a766e] text-center">No tenés salones guardados</p>
                          <Link href="/perfil/favoritos" className="text-[9px] text-[#f1c97d] font-label uppercase tracking-widest">Explorar →</Link>
                        </div>
                      ) : (
                        mySalons.map((salon) => (
                          <Link href={`/salones/${salon.slug}`} key={salon.id} className="flex gap-4 group/item cursor-pointer p-3 rounded-2xl hover:bg-white/[0.06] transition-colors border border-transparent">
                            <div className="w-10 h-10 mt-1 flex-shrink-0 bg-gradient-to-tr from-[#f1c97d]/20 to-[#f1c97d]/5 rounded-full flex items-center justify-center border border-[#f1c97d]/20">
                              <span className="material-symbols-outlined text-[18px] text-[#f1c97d]">storefront</span>
                            </div>
                            <div className="flex flex-col flex-1">
                              <h4 className="text-[15px] font-medium text-[#f5f0e8] group-hover/item:text-[#f1c97d] transition-colors">{salon.name}</h4>
                              <span className="text-[11px] text-[#7a766e] mt-1">Favorito</span>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TURNOS ────────────────────────────────────────────────────────── */}
          {activeTab === 'turnos' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center gap-5">
                  <h1 className="text-5xl font-body font-light text-[#f5f0e8]">Mis Turnos</h1>
                  {confirmedCount > 0 && (
                    <div className="liquid-glass-rich px-4 py-1.5 rounded-full border border-[#f1c97d]/20">
                      <span className="text-[#f1c97d] text-[9px] font-bold uppercase tracking-[0.2em]">{confirmedCount} PRÓXIMOS</span>
                    </div>
                  )}
                </div>
                <p className="text-[#7a766e] text-xs tracking-wide">Tus próximas citas de belleza.</p>
              </div>

              {upcomingAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 rounded-[2rem] border border-white/10" style={{ backgroundColor: '#111010' }}>
                  <p className="font-vogue text-xl text-[#7a766e]">No tenés turnos próximos.</p>
                  <Link href="/explore" className="mt-4 text-[13px] font-medium transition-opacity hover:opacity-70 text-[#D4AF37]">Explorá salones →</Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {upcomingAppointments.map((appt) => (
                    <div key={appt.id} className="relative group overflow-hidden liquid-glass-rich rounded-[1.5rem] flex min-h-[120px] transition-all duration-700 hover:scale-[1.02] hover:bg-white/[0.05]" style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
                      <div className="relative z-10 flex flex-col items-center justify-center min-w-[90px] px-5 py-4">
                        <span className="text-4xl font-headline text-[#f1c97d]" style={{ textShadow: '0 0 30px rgba(241,201,125,0.3)' }}>{fmtDay(appt.dateMs)}</span>
                        <span className="text-[9px] font-label uppercase tracking-[0.3em] text-[#7a766e] mt-0.5">{fmtMonth(appt.dateMs)}</span>
                        <span className="text-[10px] font-headline italic text-[#f5f0e8] mt-1">{fmtTime(appt.dateMs)}</span>
                      </div>
                      <div className="relative z-10" style={{ width: '1px', alignSelf: 'stretch', margin: '12px 0', background: 'linear-gradient(to bottom, transparent, rgba(241,201,125,0.3), transparent)' }} />
                      <div className="relative z-10 flex-grow px-7 py-4 flex flex-col justify-center">
                        <div className="flex items-center gap-3.5 mb-1.5">
                          <h2 className="text-2xl font-body font-light tracking-wide">{appt.salonName}</h2>
                          {(appt.status === 'confirmed' || appt.status === 'pending') && (
                            <span className="bg-emerald-500/10 text-emerald-400 text-[8px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border border-emerald-500/20">
                              {appt.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                            </span>
                          )}
                          {appt.status === 'cancelled' && (
                            <span className="bg-red-500/10 text-red-400 text-[8px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border border-red-500/20">Cancelado</span>
                          )}
                        </div>
                        <p className="text-[#7a766e] text-base font-headline italic mb-2.5">{appt.service}</p>
                        {appt.staffName && (
                          <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-[#f1c97d]/60 text-[18px]">person</span>
                            <div>
                              <p className="text-[7px] text-[#7a766e] uppercase tracking-widest">Profesional</p>
                              <p className="text-[10px] uppercase tracking-wider font-medium">{appt.staffName}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="relative z-10 flex-shrink-0 flex flex-col items-center justify-center gap-3 border-l border-dashed border-white/15 px-5">
                        <Link href={`/salones/${appt.salonSlug}`} className="text-[9px] text-[#f1c97d] uppercase tracking-widest font-label hover:opacity-70 transition-opacity flex items-center gap-1">
                          Ver salón <span className="material-symbols-outlined text-[13px]">chevron_right</span>
                        </Link>
                        {(appt.status === 'confirmed' || appt.status === 'pending') && (
                          <button
                            onClick={() => handleCancelAppointment(appt)}
                            disabled={cancellingId === appt.id}
                            className="text-[9px] text-red-400/60 uppercase tracking-widest font-label hover:text-red-400 transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {cancellingId === appt.id ? (
                              <span className="animate-pulse">Cancelando...</span>
                            ) : (
                              <>Cancelar <span className="material-symbols-outlined text-[13px]">close</span></>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PERFIL ────────────────────────────────────────────────────────── */}
          {activeTab === 'perfil' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
              <div className="flex flex-col gap-2 mb-12">
                <h1 className="text-6xl font-body font-light text-[#f5f0e8]">Mi Perfil</h1>
                <p className="text-[#7a766e] text-sm tracking-widest font-label uppercase">Tu expediente de belleza y configuraciones</p>
              </div>

              <div className="grid grid-cols-12 gap-10 items-start">
                {/* COL IZQUIERDA (span-4) */}
                <div className="col-span-4 flex flex-col gap-8">
                  {/* Identidad */}
                  <div className="relative isolate overflow-hidden rounded-[2.5rem] p-8 flex flex-col items-center text-center border border-white/10 group/id">
                    <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#f1c97d]/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/4 -z-10 transition-opacity duration-700 opacity-50 group-hover/id:opacity-100" />
                    <div className="relative mb-6 group">
                      <div className="w-36 h-36 rounded-full p-[2px] shadow-[0_0_50px_rgba(241,201,125,0.15)] bg-gradient-to-tr from-[#f1c97d] via-[#f1c97d]/20 to-[#f1c97d] relative overflow-hidden transition-transform duration-700 hover:scale-105">
                        <div className="w-full h-full rounded-full bg-[#050504] p-1 flex items-center justify-center overflow-hidden">
                          {session?.user?.image ? (
                            <img src={session.user.image} alt={userName} className="w-full h-full rounded-full object-cover grayscale brightness-90 group-hover:grayscale-0 transition-all duration-700" />
                          ) : (
                            <span className="text-3xl font-vogue text-[#f1c97d]">{userInitial}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <h2 className="text-3xl font-body font-light text-[#f5f0e8] mb-1">{userName}</h2>
                    <div className="flex items-center gap-2 mb-8">
                      <p className="text-[10px] text-[#7a766e] font-label lowercase tracking-widest">{session?.user?.email}</p>
                      <span className="material-symbols-outlined text-[13px] text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">verified</span>
                    </div>
                    {initialPhone && (
                      <div className="w-full flex flex-col gap-4 text-left border-t border-white/5 pt-8">
                        <div className="group/wp p-3 -mx-3 rounded-xl">
                          <p className="text-[8px] font-label uppercase tracking-[0.2em] text-[#7a766e] mb-1">WhatsApp / Confirmaciones</p>
                          <p className="text-sm text-[#f5f0e8] font-body">{initialPhone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expediente portable */}
                  <div className="relative isolate overflow-hidden rounded-[2.5rem] p-8 border border-[#f1c97d]/20 bg-gradient-to-br from-[#f1c97d]/5 to-transparent group cursor-pointer hover:border-[#f1c97d]/40 transition-all duration-500">
                    <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
                    <div className="absolute inset-0 bg-gradient-to-bl from-[#f1c97d]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10" />
                    <div className="flex flex-col items-center">
                      <div className="mb-6">
                        <div className="bg-[#121212] backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl transition-all duration-700 group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),_0_0_30px_rgba(241,201,125,0.15)] group-hover:border-[#f1c97d]/40">
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '3px', width: '90px', height: '90px' }}>
                            {[1,0,1,1,0,1,1,1,0,1,1,0,0,1,1,0,1,1,1,0,1,1,0,1,0,1,0,1,1,0,1,1,1,0,0,1].map((val, i) => (
                              <div key={i} className={`rounded-[2px] transition-all duration-700 ${val === 1 ? 'bg-gradient-to-br from-[#f1c97d] to-[#d4af37]' : 'bg-white/5'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <h3 className="text-xl font-body font-light text-[#f1c97d] mb-2 text-center">Expediente Portable</h3>
                      <p className="text-[10px] text-[#7a766e] text-center leading-relaxed font-label uppercase tracking-widest px-4">Compartí tu historial con cualquier estilista nueva en un tap.</p>
                      <button className="mt-8 w-full py-3 rounded-xl border border-white/10 group-hover:border-[#f1c97d]/50 bg-white/5 group-hover:bg-[#f1c97d]/10 text-[9px] font-label uppercase tracking-[0.2em] text-[#f5f0e8] group-hover:text-[#f1c97d] transition-all duration-500 cursor-pointer">
                        Copiar link abierto
                      </button>
                    </div>
                  </div>
                </div>

                {/* COL DERECHA (span-8) */}
                <div className="col-span-8 flex flex-col gap-10">

                  {/* BLOQUE 2: Tu perfil capilar */}
                  <div className="relative isolate overflow-hidden p-6 rounded-[1.5rem]">
                    <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
                    <div className="relative z-10 w-full h-full">
                      <div className="flex flex-row justify-between items-center mb-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-[.12em] text-[#7a766e] mb-1">Estado actual</span>
                          <h3 className="font-body font-light text-[17px] text-[#f5f0e8]">Tu Cabello</h3>
                        </div>
                        <div className={`text-[11px] px-3 py-1 rounded-full border ${
                          hairCondition === 'sano'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : hairCondition === 'dañado' || hairCondition === 'muy-dañado'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {hairStatusLabel}
                        </div>
                      </div>

                      {/* Score ring */}
                      <div className="flex flex-row items-center gap-6 mb-8 mt-2">
                        <div className="relative w-[86px] h-[86px] flex-shrink-0 drop-shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                          <div className="absolute inset-0 bg-[#4ade80]/10 rounded-full blur-[15px]" />
                          <svg className="w-full h-full relative z-10" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.06)" strokeWidth="7" fill="none" />
                            <circle cx="40" cy="40" r="34" stroke="url(#green-gradient)" strokeWidth="7" strokeLinecap="round" fill="none" strokeDasharray="213.6" strokeDashoffset={ringOffset} transform="rotate(-90 40 40)" />
                            <defs>
                              <linearGradient id="green-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#4ade80" />
                                <stop offset="100%" stopColor="#10b981" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[22px] font-headline text-[#f5f0e8] z-10">{hairScore}%</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-medium text-[#f5f0e8] mb-1.5">Salud general</span>
                          {initialHairProfile ? (
                            <span className="text-[11px] text-[#7a766e] font-label tracking-wide uppercase">
                              {hairType && <span className="capitalize">{hairType}</span>}
                              {hairType && hairCondition && ' · '}
                              {hairCondition && <span className="capitalize">{hairCondition}</span>}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#7a766e] font-label tracking-wide uppercase">Sin datos — completá tu ficha</span>
                          )}
                        </div>
                      </div>

                      {/* Métricas — placeholder hasta TechnicalRecords */}
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        {[
                          { label: 'Grosor', value: initialHairProfile?.thickness ? initialHairProfile.thickness.charAt(0).toUpperCase() + initialHairProfile.thickness.slice(1) : '—', sub: 'Tipo de fibra' },
                          { label: 'Próximo turno', value: '—', sub: 'Pendiente de historial' },
                          { label: 'Frecuencia ideal', value: '—', sub: 'Pendiente de historial' },
                        ].map((metric, i) => (
                          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[1rem] p-4 flex flex-col hover:border-[#f1c97d]/30 hover:bg-white/[0.04] transition-all duration-300 cursor-default group/metric">
                            <span className="text-[9px] uppercase tracking-[.1em] text-[#7a766e] mb-2.5">{metric.label}</span>
                            <span className="text-[15px] font-medium text-[#f5f0e8] mb-1 group-hover/metric:text-[#f1c97d] transition-colors">{metric.value}</span>
                            <span className="text-[10px] text-[#7a766e]">{metric.sub}</span>
                          </div>
                        ))}
                      </div>

                      {/* Evolución — placeholder estático */}
                      <div className="border-t border-white/8 pt-8 mb-8 flex flex-col">
                        <span className="text-[10px] font-label uppercase tracking-[.15em] text-[#7a766e] mb-6">Evolución — últimos 6 meses</span>
                        <div className="flex items-end justify-between px-2 h-[120px] gap-2">
                          {STATIC_EVOLUTION.map((evo, i) => {
                            const isLast = i === STATIC_EVOLUTION.length - 1;
                            return (
                              <div key={evo.month} className="relative flex flex-col items-center group/bar w-[32px]">
                                <div className="absolute -top-7 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-[#1a160f] border border-[#f1c97d]/30 text-[#f1c97d] text-[10px] px-2 py-0.5 rounded shadow-lg z-20">{evo.score}%</div>
                                <div className={`w-[16px] h-[90px] rounded-full relative overflow-hidden flex flex-col justify-end ${isLast ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-white/[0.03]'}`}>
                                  <div className={`w-full rounded-full ${isLast ? 'bg-gradient-to-t from-emerald-500/80 to-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.4)]' : i === STATIC_EVOLUTION.length - 2 ? 'bg-gradient-to-t from-white/10 to-[#f1c97d]/60' : 'bg-gradient-to-t from-white/10 to-white/40'}`} style={{ height: `${evo.score}%` }} />
                                </div>
                                <span className={`text-[10px] font-label uppercase tracking-widest mt-3 ${isLast ? 'text-emerald-400 font-bold' : 'text-[#7a766e]'}`}>{evo.month}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Alertas reales */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-[#121212]/60 backdrop-blur-md rounded-[1rem] p-3.5 flex items-start gap-3 border border-amber-500/10 relative overflow-hidden group/alert">
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover/alert:opacity-100 transition-opacity duration-500" />
                          <div className="w-[36px] h-[36px] flex items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 flex-shrink-0 relative z-10">
                            <AlertTriangle className="text-amber-400" size={18} strokeWidth={2} />
                          </div>
                          <div className="flex flex-col relative z-10 pt-0.5">
                            <span className="text-[12px] font-medium text-[#f5f0e8] mb-0.5">Alergia registrada</span>
                            {hairAllergy ? (
                              <span className="text-[10px] text-[#7a766e] leading-snug">{hairAllergy} <br /><span className="italic opacity-70">Tu estilista lo sabe</span></span>
                            ) : (
                              <span className="text-[10px] text-[#7a766e] italic">Sin alergias registradas</span>
                            )}
                          </div>
                        </div>
                        <div className="bg-[#121212]/60 backdrop-blur-md rounded-[1rem] p-3.5 flex items-start gap-3 border border-blue-500/10 relative overflow-hidden group/goal">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover/goal:opacity-100 transition-opacity duration-500" />
                          <div className="w-[36px] h-[36px] flex items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 flex-shrink-0 relative z-10">
                            <Target className="text-blue-400" size={18} strokeWidth={2} />
                          </div>
                          <div className="flex flex-col relative z-10 pt-0.5">
                            <span className="text-[12px] font-medium text-[#f5f0e8] mb-0.5">Objetivo activo</span>
                            <span className="text-[10px] text-[#7a766e] leading-snug line-clamp-2">{hairGoal ?? 'No especificado'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Recomendación estilista */}
                      <div className="bg-gradient-to-r from-white/[0.04] to-transparent rounded-[1.25rem] p-5 flex items-center justify-between gap-4 border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-label tracking-widest text-[#f1c97d] mb-1.5 flex items-center gap-2">
                            Recomendación de tu estilista <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                          </span>
                          <span className="text-[13px] text-[#7a766e] italic font-headline leading-relaxed">
                            {initialHairProfile
                              ? '"Completá tu historial con tu estilista para ver sus recomendaciones."'
                              : '"Creá tu ficha capilar para que tu estilista pueda personalizarte el tratamiento."'}
                          </span>
                        </div>
                      </div>

                      {/* ── Formulario de edición ─────────────────────────── */}
                      <div className="mt-8 border-t border-white/5 pt-8">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.4em] font-label font-bold mb-1">
                              Tu cabello
                            </p>
                            <h3 className="font-headline text-xl text-[#f5f0e8] italic">
                              Expediente Capilar
                            </h3>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[#f1c97d] font-headline text-2xl italic">
                              {hairFormScore}%
                            </span>
                            <span className="text-[10px] text-[#7a766e] font-label">
                              {hairFormLabel}
                            </span>
                          </div>
                        </div>

                        {/* Selector grid — Tipo / Grosor / Estado */}
                        <div className="grid grid-cols-3 gap-3 mb-5">

                          {/* Tipo */}
                          <div>
                            <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.25em] font-label font-bold mb-2">
                              Tipo
                            </p>
                            <div className="flex flex-col gap-1.5">
                              {['liso', 'ondulado', 'rizado', 'afro'].map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => setHairForm(f => ({ ...f, type: opt }))}
                                  className={`px-3 py-2 rounded-xl text-[11px] font-label font-medium
                                    text-left transition-all duration-200 capitalize cursor-pointer
                                    ${hairForm.type === opt
                                      ? 'bg-[#f1c97d]/10 border border-[#f1c97d]/30 text-[#f1c97d]'
                                      : 'bg-white/[0.03] border border-white/[0.06] text-[#7a766e] hover:text-[#a09a8e]'
                                    }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Grosor */}
                          <div>
                            <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.25em] font-label font-bold mb-2">
                              Grosor
                            </p>
                            <div className="flex flex-col gap-1.5">
                              {['fino', 'normal', 'grueso'].map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => setHairForm(f => ({ ...f, thickness: opt }))}
                                  className={`px-3 py-2 rounded-xl text-[11px] font-label font-medium
                                    text-left transition-all duration-200 capitalize cursor-pointer
                                    ${hairForm.thickness === opt
                                      ? 'bg-[#f1c97d]/10 border border-[#f1c97d]/30 text-[#f1c97d]'
                                      : 'bg-white/[0.03] border border-white/[0.06] text-[#7a766e] hover:text-[#a09a8e]'
                                    }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Estado */}
                          <div>
                            <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.25em] font-label font-bold mb-2">
                              Estado
                            </p>
                            <div className="flex flex-col gap-1.5">
                              {['sano', 'procesado', 'dañado', 'muy-dañado'].map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => setHairForm(f => ({ ...f, condition: opt }))}
                                  className={`px-3 py-2 rounded-xl text-[11px] font-label font-medium
                                    text-left transition-all duration-200 capitalize cursor-pointer
                                    ${hairForm.condition === opt
                                      ? 'bg-[#f1c97d]/10 border border-[#f1c97d]/30 text-[#f1c97d]'
                                      : 'bg-white/[0.03] border border-white/[0.06] text-[#7a766e] hover:text-[#a09a8e]'
                                    }`}
                                >
                                  {opt.replace('-', ' ')}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Alergias */}
                        <div className="mb-4">
                          <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.25em] font-label font-bold mb-2">
                            Alergias o sensibilidades
                          </p>
                          <input
                            type="text"
                            value={hairForm.allergies}
                            onChange={e => setHairForm(f => ({ ...f, allergies: e.target.value }))}
                            placeholder="Ej: amonio, parafenilendiamina..."
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
                              px-4 py-3 text-[13px] text-[#f5f0e8] font-label placeholder:text-[#7a766e]
                              focus:border-[#f1c97d]/40 focus:bg-white/[0.06] outline-none
                              transition-all duration-200"
                          />
                          <p className="text-[10px] text-[#7a766e] mt-1.5 font-label">
                            Separadas por coma si hay más de una
                          </p>
                        </div>

                        {/* Objetivo capilar */}
                        <div className="mb-6">
                          <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.25em] font-label font-bold mb-2">
                            Mi objetivo capilar
                          </p>
                          <textarea
                            value={hairForm.goal}
                            onChange={e => setHairForm(f => ({ ...f, goal: e.target.value }))}
                            placeholder="Ej: Quiero llegar al rubio platino sin romper mi cabello..."
                            rows={3}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
                              px-4 py-3 text-[13px] text-[#f5f0e8] font-label placeholder:text-[#7a766e]
                              focus:border-[#f1c97d]/40 focus:bg-white/[0.06] outline-none
                              transition-all duration-200 resize-none"
                          />
                        </div>

                        {/* Error */}
                        {hairError && (
                          <p className="text-[12px] text-red-400 mb-4 font-label">{hairError}</p>
                        )}

                        {/* Botón guardar */}
                        <button
                          onClick={handleSaveHairProfile}
                          disabled={hairSaving}
                          className={`w-full py-3.5 rounded-full font-label font-bold text-[12px]
                            uppercase tracking-widest transition-all duration-200 cursor-pointer
                            ${hairSaved
                              ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                              : hairSaving
                                ? 'bg-[#f1c97d]/40 text-[#09090b]/60 cursor-not-allowed'
                                : 'bg-[#f1c97d] text-[#09090b] hover:bg-[#f1c97d]/90 active:scale-[0.98]'
                            }`}
                        >
                          {hairSaved
                            ? '✓ Guardado'
                            : hairSaving
                              ? 'Guardando...'
                              : 'Guardar perfil capilar'
                          }
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 3: Preferencias */}
                  <div className="relative isolate overflow-hidden rounded-[2.5rem] p-10 border border-white/10">
                    <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
                    <div className="mb-10">
                      <p className="text-[9px] font-label uppercase tracking-[0.3em] text-[#f1c97d] mb-2">LOGÍSTICA Y ESTILO</p>
                      <h3 className="text-3xl font-body font-light text-[#f5f0e8]">Preferencias</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-10 mb-10 pb-10 border-b border-white/5">
                      <div>
                        <p className="text-[9px] font-label uppercase tracking-[0.2em] text-[#7a766e] mb-6">Barrio de preferencia</p>
                        <div className="relative">
                          <input
                            type="text"
                            value={preferredZone}
                            onChange={(e) => {
                              setPreferredZone(e.target.value);
                              schedulePreferenceSave(e.target.value, config);
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f5f0e8] focus:outline-none focus:border-[#f1c97d]/30 transition-all font-body"
                          />
                          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#7a766e] text-lg">map</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-label uppercase tracking-[0.2em] text-[#7a766e] mb-6">Horarios habituales</p>
                        <div className="flex gap-2">
                          {(['Mañana', 'Tarde', 'Noche'] as const).map((slot) => (
                            <button
                              key={slot}
                              onClick={() => {
                                const newCfg = { ...config, preferredTime: slot };
                                setConfig(newCfg);
                                schedulePreferenceSave(preferredZone, newCfg);
                              }}
                              className={`flex-1 py-3 rounded-xl border text-[9px] font-label uppercase tracking-widest transition-all cursor-pointer ${config.preferredTime === slot ? 'bg-[#f1c97d]/10 border-[#f1c97d]/30 text-[#f1c97d]' : 'bg-white/5 border-white/10 text-[#7a766e] hover:border-white/20'}`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                      <div>
                        <p className="text-sm font-body text-[#f5f0e8]">Notificaciones vía WhatsApp</p>
                        <p className="text-[9px] font-label text-[#7a766e] uppercase mt-1 tracking-widest">Confirmaciones 24hs antes del turno</p>
                      </div>
                      <div
                        className={`w-12 h-6 ${config.whatsappNotif ? 'bg-[#f1c97d]/20 border-[#f1c97d]/40' : 'bg-white/5 border-white/10'} rounded-full relative transition-all duration-300 border cursor-pointer`}
                        onClick={() => {
                          const newCfg = { ...config, whatsappNotif: !config.whatsappNotif };
                          setConfig(newCfg);
                          schedulePreferenceSave(preferredZone, newCfg);
                        }}
                      >
                        <div className={`absolute top-1 w-3.5 h-3.5 rounded-full transition-all duration-300 ${config.whatsappNotif ? 'right-1 bg-[#f1c97d]' : 'left-1 bg-[#7a766e]'}`} />
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 4: Seguridad */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="relative isolate overflow-hidden rounded-[2rem] p-8 border border-white/10">
                      <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
                      <h4 className="text-lg font-body font-light text-[#f5f0e8] mb-6">Seguridad</h4>
                      <div className="space-y-4">
                        <button className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] font-label tracking-widest uppercase text-[#7a766e] hover:text-[#f1c97d] hover:bg-white/5 transition-all text-left group cursor-pointer">
                          Cambiar contraseña
                          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-[#f1c97d]/5 border border-[#f1c97d]/10 rounded-xl text-[10px] font-label tracking-widest uppercase text-[#f1c97d] hover:bg-[#f1c97d]/10 transition-all text-left cursor-pointer group">
                          <div>
                            <p className="mb-1">Exportar historial</p>
                            <p className="text-[7px] text-[#f1c97d]/60 font-medium">Generar PDF técnico</p>
                          </div>
                          <span className="material-symbols-outlined text-[18px]">download</span>
                        </button>
                      </div>
                    </div>
                    <div className="relative isolate overflow-hidden rounded-[2rem] p-8 border border-white/10">
                      <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
                      <h4 className="text-lg font-headline italic text-red-400 mb-6">Zona de riesgo</h4>
                      <p className="text-[10px] text-[#7a766e] uppercase tracking-widest leading-relaxed mb-6 font-label">
                        Si eliminás tu cuenta, perderás tu historial capilar y preferencias de forma irreversible.
                      </p>
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full py-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-xl text-[10px] font-label tracking-[0.2em] font-bold uppercase text-red-400 transition-all cursor-pointer"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── EXPLORAR ──────────────────────────────────────────────────────── */}
          {activeTab === 'explorar' && <ExplorarTab />}

          {/* Editorial */}
          <section className="mt-32 pb-12">
            <div className="grid grid-cols-12 gap-10 items-center">
              <div className="col-span-6">
                <p className="text-3xl font-headline italic text-[#f1c97d] leading-tight text-pretty">
                  "La belleza comienza en el momento en que decidís ser vos misma."
                </p>
                <div className="mt-6 flex items-center gap-5">
                  <div className="h-[1px] w-16 bg-[#f1c97d]/30" />
                  <p className="text-[8px] font-label uppercase tracking-[0.4em] text-[#7a766e]">Editorial Ouleeh / SS24</p>
                </div>
              </div>
              <div className="col-span-6">
                <div className="relative rounded-[2.5rem] overflow-hidden group aspect-[16/10]">
                  <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80" alt="Salon Editorial" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050504] via-transparent to-transparent opacity-60" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <button className="fixed bottom-10 right-10 w-14 h-14 liquid-glass-floating rounded-full flex items-center justify-center text-[#f1c97d] group transition-all duration-500 hover:scale-110 hover:shadow-[0_0_30px_rgba(241,201,125,0.3)] z-50">
        <span className="material-symbols-outlined text-[28px] transition-transform duration-500 group-hover:rotate-90">add</span>
      </button>
    </div>
  );
}
