'use client';
import { useState, useEffect } from "react";
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import type { Cliente } from "@/lib/types";
import NewClientForm from "@/components/NewClientForm";
import { useTenant } from "@/contexts/TenantContext";
import { useUser } from "@/contexts/UserContext";

const AVATAR_COLORS = ['#a78bfa', '#34d399', '#fbbf24', '#fb923c', '#f472b6', '#60a5fa'];
const avatarColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { tenantId } = useTenant();
  const user = useUser();
  const userRole = user?.rol ?? 'clienta';

  useEffect(() => {
    if (!tenantId) return;
    const clientesQuery = query(collection(db, 'tenants', tenantId, 'customers'), orderBy('firstName'));
    const unsub = onSnapshot(
      clientesQuery,
      (snapshot) => {
        setClientes(snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nombre: data.firstName || data.nombre,
            apellido: data.lastName || data.apellido,
            email: data.email,
            telefono: data.phone || data.telefono,
            ultimaVisita: data.lastVisit || data.ultimaVisita,
            fechaRegistro: data.createdAt || data.fechaRegistro,
          } as Cliente;
        }));
        setLoading(false);
      },
      (error) => { console.error(error); setLoading(false); }
    );
    return () => unsub();
  }, [tenantId]);

  const filteredClientes = clientes.filter(c => {
    const full = `${c.nombre || ''} ${c.apellido || ''}`.toLowerCase();
    const email = (c.email || '').toLowerCase();
    const phone = (c.telefono || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return full.includes(q) || email.includes(q) || phone.includes(q);
  });

  const now = new Date();
  const newThisMonth = clientes.filter(c => {
    try {
      const d: Date = (c.fechaRegistro as any)?.toDate?.() ?? new Date(c.fechaRegistro as any);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } catch { return false; }
  }).length;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-playfair text-[32px] font-bold italic text-[#f5f0e8] leading-tight">Clientes</h1>
          <p className="text-[#7a766e] text-[13px] mt-1">Historial y gestión de tus clientas</p>
        </div>
        {userRole === 'admin' && <NewClientForm />}
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: 'group',          label: 'Total',          value: loading ? '–' : String(clientes.length),                        color: '#a78bfa' },
          { icon: 'calendar_today', label: 'Nuevas este mes', value: loading ? '–' : String(newThisMonth),                          color: '#34d399' },
          { icon: 'history',        label: 'Con historial',  value: loading ? '–' : String(clientes.filter(c => c.ultimaVisita).length), color: '#fbbf24' },
        ].map(stat => (
          <div key={stat.label} className="relative isolate rounded-2xl border border-white/[0.07] p-4 overflow-hidden">
            <div className="absolute inset-0 bg-white/[0.02] -z-10" />
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5"
              style={{ background: `${stat.color}18` }}>
              <span className="material-symbols-outlined"
                style={{ fontSize: '16px', color: stat.color, fontVariationSettings: "'FILL' 1" }}>
                {stat.icon}
              </span>
            </div>
            <p className="text-[26px] font-bold text-[#f5f0e8] leading-none font-mono">{stat.value}</p>
            <p className="text-[9px] text-[#7a766e] font-label uppercase tracking-widest font-bold mt-1.5 leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#7a766e] pointer-events-none"
          style={{ fontSize: '18px' }}>search</span>
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-11 pr-10 py-3 text-[14px] text-[#f5f0e8] placeholder-[#7a766e] focus:outline-none focus:border-violet-500/40 transition-all"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7a766e] hover:text-[#f5f0e8] transition-colors cursor-pointer">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
          </button>
        )}
      </div>

      {/* ── Results count ── */}
      {!loading && searchTerm && (
        <p className="text-[10px] text-[#7a766e] font-label uppercase tracking-widest -mt-2">
          {filteredClientes.length} resultado{filteredClientes.length !== 1 ? 's' : ''} para &ldquo;{searchTerm}&rdquo;
        </p>
      )}

      {/* ── Loading skeletons ── */}
      {loading && (
        <div className="flex flex-col gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[72px] rounded-2xl border border-white/[0.05] animate-pulse"
              style={{ background: `rgba(255,255,255,${0.018 + i * 0.002})` }} />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && filteredClientes.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#7a766e]" style={{ fontSize: '28px' }}>person_search</span>
          </div>
          <div>
            <p className="text-[#f5f0e8] font-semibold text-[15px]">
              {searchTerm ? 'Sin resultados' : 'Aún no hay clientas'}
            </p>
            <p className="text-[13px] text-[#7a766e] mt-1.5 max-w-xs mx-auto leading-relaxed">
              {searchTerm
                ? `No encontramos clientas con "${searchTerm}". Probá con otro término.`
                : 'Registrá tu primera clienta con el botón de arriba.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Client table ── */}
      {!loading && filteredClientes.length > 0 && (
        <div className="relative isolate rounded-2xl border border-white/[0.07] overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.01] -z-10" />

          {/* Column headers */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-5 py-3 border-b border-white/[0.06]">
            <div className="col-span-5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label">Clienta</span>
            </div>
            <div className="col-span-3">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label">Contacto</span>
            </div>
            <div className="col-span-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label">Última visita</span>
            </div>
            <div className="col-span-2 text-right">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label">Acción</span>
            </div>
          </div>

          {/* Rows */}
          {filteredClientes.map((cliente, idx) => {
            const color = avatarColor(cliente.nombre || '');
            const initials = `${(cliente.nombre || '')[0] ?? ''}${(cliente.apellido || '')[0] ?? ''}`.toUpperCase();
            let lastVisit: string | null = null;
            try {
              if (cliente.ultimaVisita) {
                const d: Date = (cliente.ultimaVisita as any).toDate?.() ?? new Date(cliente.ultimaVisita as any);
                lastVisit = format(d, "d MMM yyyy", { locale: es });
              }
            } catch { /* ignore */ }

            return (
              <div key={cliente.id}
                className={`flex sm:grid sm:grid-cols-12 gap-3 sm:gap-2 items-center px-5 py-4 transition-all hover:bg-white/[0.025] group cursor-pointer${idx < filteredClientes.length - 1 ? ' border-b border-white/[0.04]' : ''}`}>

                {/* Avatar + name */}
                <div className="flex items-center gap-3 flex-1 sm:col-span-5 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `${color}20`, color, border: `1.5px solid ${color}35` }}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#f5f0e8] truncate">
                      {cliente.nombre} {cliente.apellido}
                    </p>
                    <p className="text-[11px] text-[#7a766e] truncate sm:hidden">
                      {cliente.email || cliente.telefono}
                    </p>
                  </div>
                </div>

                {/* Contact — desktop */}
                <div className="hidden sm:block col-span-3 min-w-0">
                  <p className="text-[12px] text-[#7a766e] truncate">{cliente.email || '—'}</p>
                  <p className="text-[11px] text-[#7a766e]/60 truncate mt-0.5">{cliente.telefono || '—'}</p>
                </div>

                {/* Last visit — desktop */}
                <div className="hidden sm:flex col-span-2 items-center">
                  {lastVisit
                    ? <span className="text-[12px] text-[#7a766e]">{lastVisit}</span>
                    : <span className="text-[11px] text-[#7a766e]/40 italic">Sin visitas</span>}
                </div>

                {/* Action */}
                <div className="sm:col-span-2 flex justify-end shrink-0">
                  <Link href={`/clientes/${cliente.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-violet-500/[0.10] hover:border-violet-500/30 text-[#7a766e] hover:text-violet-300 transition-all text-[11px] font-bold uppercase tracking-wide cursor-pointer whitespace-nowrap">
                    Ver ficha
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>chevron_right</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
