'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  UserSquare2, 
  Wallet, 
  Settings, 
  LogOut,
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ChevronRight,
  Plus,
  CreditCard,
  UserPlus,
  FileText
} from 'lucide-react';

const MOCK_DASHBOARD = {
  salon: {
    name: 'Maison de Beauté',
    slug: 'maison-de-beaute',
    plan: 'premium',
  },
  owner: {
    name: 'Valentina',
    initials: 'V',
  },
  proximoTurno: {
    clientName: 'Martina Soto',
    service: 'Balayage',
    staff: 'Valentina',
    time: '10:30am',
    minutosRestantes: 12,
    status: 'confirmed',
  },
  metricsHoy: {
    ingresos: 14000,
    ocupacionPercent: 80,
    turnosTotal: 10,
    turnosCompletados: 8,
    cancelaciones: 1,
  },
  agendaHoy: [
    { id: 1, time: '09:00', clientName: 'Sofia R.', service: 'Corte de autor', staff: 'Valentina', price: 3500, status: 'done' },
    { id: 2, time: '10:30', clientName: 'Martina Soto', service: 'Balayage', staff: 'Valentina', price: 8500, status: 'active' },
    { id: 3, time: '12:00', clientName: 'Carolina V.', service: 'Manicure gel', staff: 'Ana', price: 2800, status: 'pending' },
    { id: 4, time: '14:00', clientName: 'Laura M.', service: 'Mechas californianas', staff: 'Valentina', price: 12000, status: 'pending' },
    { id: 5, time: '15:30', clientName: 'Sin confirmar', service: 'Keratina', staff: 'Ana', price: 9500, status: 'unconfirmed' },
  ],
  staff: [
    { id: 1, name: 'Valentina', initials: 'V', turnosHoy: 3, active: true },
    { id: 2, name: 'Ana', initials: 'A', turnosHoy: 2, active: true },
    { id: 3, name: 'Marcos', initials: 'M', turnosHoy: 0, active: false },
  ],
  caja: {
    cobrado: 14000,
    pendiente: 24300,
  },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function AdminDashboardPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white font-inter selection:bg-emerald-500/30 selection:text-white">
      
      {/* SIDEBAR ADMIN */}
      <aside className="w-64 bg-[#0d0d0d] border-r border-white/[0.06] sticky top-0 h-screen flex flex-col hidden md:flex">
        {/* Identidad */}
        <div className="p-6 flex flex-col gap-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 text-emerald-400 font-playfair italic text-lg">
                {MOCK_DASHBOARD.owner.initials}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#0d0d0d] rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-0.5">BIENVENIDA</span>
              <span className="text-sm font-semibold text-white leading-tight">{MOCK_DASHBOARD.owner.name}</span>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-6 flex flex-col gap-1 overflow-y-auto">
          <Link href={`/${MOCK_DASHBOARD.salon.slug}/dashboard`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 font-medium transition-colors">
            <LayoutDashboard size={18} />
            <span className="text-sm">Dashboard</span>
          </Link>
          <Link href={`/(admin)/agenda`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-colors">
            <Calendar size={18} />
            <span className="text-sm">Agenda</span>
          </Link>
          <Link href={`/(admin)/clientes`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-colors">
            <Users size={18} />
            <span className="text-sm">Clientes</span>
          </Link>
          <Link href={`/(admin)/servicios`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-colors">
            <Scissors size={18} />
            <span className="text-sm">Servicios</span>
          </Link>
          <Link href={`/(admin)/staff`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-colors">
            <UserSquare2 size={18} />
            <span className="text-sm">Staff</span>
          </Link>
          <Link href={`/(admin)/dashboard`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-colors">
            <Wallet size={18} />
            <span className="text-sm">Caja</span>
          </Link>
          <Link href={`/(admin)/configuracion`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-colors">
            <Settings size={18} />
            <span className="text-sm">Configuración</span>
          </Link>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 mt-auto border-t border-white/[0.06]">
          <div className="flex flex-col gap-4">
            <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-3 flex flex-col gap-1">
               <span className="text-xs font-medium text-white">{MOCK_DASHBOARD.salon.name}</span>
               <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Plan {MOCK_DASHBOARD.salon.plan}</span>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-zinc-500 hover:text-red-400 transition-colors w-full">
              <LogOut size={16} />
              <span className="text-sm">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 pb-12">
        <div className="max-w-4xl mx-auto w-full px-6 md:px-10 pt-10">
          
          {/* 1. HEADER */}
          <header className="flex justify-between items-end mb-10">
            <div>
              <h1 className="font-playfair text-3xl md:text-4xl italic text-white mb-2">Buenos días, {MOCK_DASHBOARD.owner.name}.</h1>
              <p className="text-zinc-500 text-sm">{MOCK_DASHBOARD.salon.name}</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-[#141414] border border-white/[0.06] flex items-center justify-center relative hover:bg-white/[0.03] transition-colors">
              <Bell size={18} className="text-zinc-400" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-[#141414]"></span>
            </button>
          </header>

          {/* 2. HERO TURNO INMINENTE */}
          <div className="mb-8">
            <h2 className="text-[9px] uppercase tracking-[0.4em] text-zinc-600 font-bold mb-3">PRÓXIMO TURNO</h2>
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden relative group">
              {/* Accent line top */}
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400"></div>
              
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-3 mb-2">
                     <span className="text-xs font-mono text-zinc-400 bg-black/30 px-2 py-1 rounded-md border border-white/5">{MOCK_DASHBOARD.proximoTurno.time}</span>
                     <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">CONFIRMADO</span>
                   </div>
                   <h3 className="font-playfair text-3xl text-white">{MOCK_DASHBOARD.proximoTurno.clientName}</h3>
                   <p className="text-zinc-400 text-sm">{MOCK_DASHBOARD.proximoTurno.service} con <span className="text-zinc-300">{MOCK_DASHBOARD.proximoTurno.staff}</span></p>
                </div>
                
                <div className="flex flex-wrap md:flex-nowrap gap-3">
                  <button className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-sm rounded-xl transition-colors">
                    Marcar presente
                  </button>
                  <button className="flex-1 md:flex-none px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-white font-medium text-sm rounded-xl transition-colors">
                    Ver expediente
                  </button>
                  <button className="flex-1 md:flex-none px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-white font-medium text-sm rounded-xl transition-colors">
                    Cobrar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. GRID METRICAS + ACCIONES */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            
            {/* Métricas del día */}
            <div className="col-span-1 md:col-span-7 bg-[#141414] border border-white/[0.06] rounded-2xl p-6 flex flex-col">
              <h2 className="text-[9px] uppercase tracking-[0.4em] text-zinc-600 font-bold mb-6">PULSO DEL NEGOCIO — HOY</h2>
              
              <div className="flex flex-col gap-6 flex-1 justify-center">
                <div className="flex justify-between items-end border-b border-white/[0.06] pb-4">
                  <span className="text-sm text-zinc-400">Ingresos proyectados</span>
                  <span className="font-playfair italic text-3xl text-emerald-400">{formatCurrency(MOCK_DASHBOARD.metricsHoy.ingresos)}</span>
                </div>
                
                <div className="flex flex-col gap-2 border-b border-white/[0.06] pb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Ocupación</span>
                    <span className="text-sm text-white font-medium">{MOCK_DASHBOARD.metricsHoy.ocupacionPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${MOCK_DASHBOARD.metricsHoy.ocupacionPercent}%` }}></div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
                  <span className="text-sm text-zinc-400">Turnos completados</span>
                  <span className="text-sm text-white font-medium">{MOCK_DASHBOARD.metricsHoy.turnosCompletados} / {MOCK_DASHBOARD.metricsHoy.turnosTotal}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Cancelaciones</span>
                  <span className={`text-sm font-medium ${MOCK_DASHBOARD.metricsHoy.cancelaciones > 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                    {MOCK_DASHBOARD.metricsHoy.cancelaciones}
                  </span>
                </div>
              </div>

              <button className="mt-6 w-full flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] rounded-xl text-xs text-zinc-300 font-medium transition-colors">
                Ver reporte completo <ChevronRight size={14} className="text-zinc-500" />
              </button>
            </div>

            {/* Acciones Rápidas */}
            <div className="col-span-1 md:col-span-5 bg-[#141414] border border-white/[0.06] rounded-2xl p-6 flex flex-col">
              <h2 className="text-[9px] uppercase tracking-[0.4em] text-zinc-600 font-bold mb-6">ACCIONES RÁPIDAS</h2>
              
              <div className="flex flex-col gap-2 flex-1">
                <button className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.06] transition-all group w-full text-left">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:bg-emerald-400/10 transition-colors">
                    <Plus size={16} />
                  </div>
                  <span className="text-sm text-zinc-300 group-hover:text-white font-medium flex-1 transition-colors">Agendar turno</span>
                  <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </button>

                <button className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.06] transition-all group w-full text-left">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:bg-emerald-400/10 transition-colors">
                    <CreditCard size={16} />
                  </div>
                  <span className="text-sm text-zinc-300 group-hover:text-white font-medium flex-1 transition-colors">Registrar cobro</span>
                  <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </button>

                <button className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.06] transition-all group w-full text-left">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:bg-emerald-400/10 transition-colors">
                    <UserPlus size={16} />
                  </div>
                  <span className="text-sm text-zinc-300 group-hover:text-white font-medium flex-1 transition-colors">Agregar clienta</span>
                  <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </button>

                <button className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.06] transition-all group w-full text-left">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:bg-emerald-400/10 transition-colors">
                    <FileText size={16} />
                  </div>
                  <span className="text-sm text-zinc-300 group-hover:text-white font-medium flex-1 transition-colors">Ver caja del día</span>
                  <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </button>
              </div>
            </div>

          </div>

          {/* 4. AGENDA DEL DIA */}
          <div className="mb-8 bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/[0.06] flex justify-between items-center">
              <h2 className="text-[9px] uppercase tracking-[0.4em] text-zinc-600 font-bold">AGENDA DE HOY</h2>
              <button className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                Ver agenda completa <ChevronRight size={12} />
              </button>
            </div>
            
            <div className="flex flex-col">
              {MOCK_DASHBOARD.agendaHoy.map((turno, idx) => {
                let statusIcon;
                switch(turno.status) {
                  case 'done': statusIcon = <CheckCircle2 size={16} className="text-emerald-500" />; break;
                  case 'active': statusIcon = <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse ml-1 mr-0.5"></span>; break;
                  case 'pending': statusIcon = <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-500 ml-0.5 mr-0.5"></div>; break;
                  case 'unconfirmed': statusIcon = <AlertCircle size={16} className="text-amber-500" />; break;
                  case 'cancelled': statusIcon = <XCircle size={16} className="text-red-500" />; break;
                }

                return (
                  <div key={turno.id} className="group flex items-center px-6 py-4 hover:bg-white/[0.02] border-b border-white/[0.02] last:border-0 cursor-pointer transition-colors">
                    <div className="w-16 flex-shrink-0 text-zinc-500 font-mono text-sm">{turno.time}</div>
                    <div className="w-8 flex-shrink-0 flex items-center justify-center">{statusIcon}</div>
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                      <div className={`font-medium ${turno.status === 'unconfirmed' ? 'text-zinc-500 italic' : 'text-white'}`}>
                        {turno.clientName}
                      </div>
                      <div className="text-zinc-400 text-sm hidden md:block">{turno.service}</div>
                      <div className="text-zinc-600 text-sm hidden md:block">{turno.staff}</div>
                      <div className="text-right text-zinc-400 text-sm font-mono">{formatCurrency(turno.price)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. STAFF + CAJA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Staff */}
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6">
              <h2 className="text-[9px] uppercase tracking-[0.4em] text-zinc-600 font-bold mb-6">STAFF HOY</h2>
              <div className="flex flex-col gap-4">
                {MOCK_DASHBOARD.staff.map((member) => (
                  <div key={member.id} className="flex items-center justify-between pb-4 border-b border-white/[0.06] last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-playfair italic text-zinc-300">
                        {member.initials}
                      </div>
                      <span className="text-sm font-medium text-white">{member.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-zinc-500">{member.turnosHoy} turnos hoy</span>
                      <div className="flex items-center gap-1.5 min-w-[70px]">
                        <span className={`w-2 h-2 rounded-full ${member.active ? 'bg-emerald-400' : 'bg-zinc-600'}`}></span>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{member.active ? 'Activa' : 'Libre'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Caja */}
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 flex flex-col">
              <h2 className="text-[9px] uppercase tracking-[0.4em] text-zinc-600 font-bold mb-6">CAJA DEL DÍA</h2>
              <div className="flex flex-col gap-4 flex-1 justify-center">
                <div className="flex justify-between items-center pb-4 border-b border-white/[0.06]">
                  <span className="text-sm text-zinc-400">Cobrado</span>
                  <span className="text-sm text-emerald-400 font-mono">{formatCurrency(MOCK_DASHBOARD.caja.cobrado)}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/[0.06]">
                  <span className="text-sm text-zinc-400">Pendiente</span>
                  <span className="text-sm text-zinc-400 font-mono">{formatCurrency(MOCK_DASHBOARD.caja.pendiente)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-zinc-300">Total proyectado</span>
                  <span className="font-playfair italic text-2xl text-white">{formatCurrency(MOCK_DASHBOARD.caja.cobrado + MOCK_DASHBOARD.caja.pendiente)}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

    </div>
  );
}
