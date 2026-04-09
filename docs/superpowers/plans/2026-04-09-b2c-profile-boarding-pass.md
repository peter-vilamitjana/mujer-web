# B2C Client Profile & Boarding Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a premium "Rich Dark" profile page for B2C clients with sticky sidebar navigation and "boarding pass" styled appointment views.

**Architecture:** A main page layout using a sticky sidebar for navigation and a scrollable main area for appointment tickets. Components are separated into focused units in the marketplace component directory.

**Tech Stack:** Next.js (App Router), Tailwind CSS, Lucide React, Framer Motion.

---

### Task 1: Component - ProfileSidebar

**Files:**
- Create: `src/components/marketplace/profile/ProfileSidebar.tsx`

- [ ] **Step 1: Write ProfileSidebar component**
```tsx
import React from 'react';
import { Calendar, Clock, User, Heart, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ProfileSidebarProps {
  user: {
    name: string;
    email: string;
    avatar: string | null;
  };
  activeNav?: string;
}

export function ProfileSidebar({ user, activeNav = 'turnos' }: ProfileSidebarProps) {
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  const navItems = [
    { id: 'turnos', label: 'Panel de Turnos', icon: Calendar, href: '/perfil' },
    { id: 'historial', label: 'Historial de Citas', icon: Clock, href: '/perfil/historial' },
    { id: 'cuenta', label: 'Mi Perfil', icon: User, href: '/perfil/cuenta' },
    { id: 'favoritos', label: 'Favoritos', icon: Heart, href: '/perfil/favoritos' },
  ];

  return (
    <aside className="w-72 bg-zinc-900 border-r border-white/8 flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="p-8">
        <div className="relative w-24 h-24 mb-6">
          <div className="w-full h-full rounded-full border-2 border-white/10 bg-zinc-800 text-white font-vogue text-3xl flex items-center justify-center">
            {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" /> : initials}
          </div>
          <div className="w-4 h-4 bg-emerald-400 border-2 border-zinc-900 rounded-full absolute bottom-1 right-1" />
        </div>
        <div>
          <span className="text-[9px] tracking-[0.4em] font-bold text-emerald-400 uppercase mb-1 block">BIENVENIDA</span>
          <h2 className="text-xl font-semibold text-white">{user.name}</h2>
          <p className="text-xs text-zinc-500 mt-1">{user.email}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeNav === item.id 
                ? "bg-emerald-400/10 text-emerald-400" 
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </a>
        ))}
      </nav>

      <div className="mt-auto p-8 border-t border-white/5">
        <button 
          onClick={() => alert('Cerrando sesión...')}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/marketplace/profile/ProfileSidebar.tsx
git commit -m "feat: add ProfileSidebar component"
```

---

### Task 2: Component - AppointmentTicket

**Files:**
- Create: `src/components/marketplace/profile/AppointmentTicket.tsx`

- [ ] **Step 1: Write AppointmentTicket component**
```tsx
import React from 'react';
import { Scissors, Sparkles, Hand, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Appointment {
  id: string;
  salonType: string;
  salonName: string;
  serviceIcon: string;
  date: string;
  fullDate: string;
  staffName: string;
  serviceName: string;
  time: string;
  location: string;
  checkInCode: string;
  status: string;
}

const ICON_MAP: Record<string, any> = {
  scissors: Scissors,
  sparkles: Sparkles,
  hand: Hand,
};

export function AppointmentTicket({ appointment }: { appointment: Appointment }) {
  const Icon = ICON_MAP[appointment.serviceIcon] || Scissors;

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="relative flex bg-[#1A1A1A] rounded-[24px] overflow-hidden shadow-2xl border border-white/5 group cursor-pointer"
      style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 0)',
        backgroundSize: '16px 16px'
      }}
    >
      {/* Notches */}
      <div className="absolute left-[-14px] top-1/2 -translate-y-1/2 w-7 h-7 bg-zinc-950 rounded-full z-10" />
      <div className="absolute right-[210px] top-1/2 -translate-y-1/2 w-7 h-7 bg-zinc-950 rounded-full z-10" />

      {/* Main Info */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-start mb-10">
          <div>
            <span className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase block mb-1">{appointment.salonType}</span>
            <h3 className="text-2xl font-black text-white tracking-tight">{appointment.salonName}</h3>
          </div>
          <div className="text-right">
            <Icon className="w-6 h-6 text-emerald-400 mb-1 ml-auto" />
            <span className="text-2xl font-black text-white">{appointment.date}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 pt-6 border-t border-white/8">
          <div>
            <span className="text-[9px] text-zinc-500 font-bold uppercase mb-1 block">Con:</span>
            <span className="text-sm font-bold text-white">{appointment.staffName}</span>
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 font-bold uppercase mb-1 block">Servicio:</span>
            <span className="text-sm font-bold text-white">{appointment.serviceName}</span>
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 font-bold uppercase mb-1 block">Hora:</span>
            <span className="text-sm font-bold text-white">{appointment.time}</span>
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 font-bold uppercase mb-1 block">Ubicación:</span>
            <span className="flex items-center gap-1 text-sm font-bold text-white">
              {appointment.location}
            </span>
          </div>
        </div>
      </div>

      {/* QR Section */}
      <div className="w-56 bg-white/[0.03] p-8 border-l-2 border-dashed border-white/10 flex flex-col items-center justify-center">
        <span className="text-[8px] text-zinc-500 font-bold tracking-wide uppercase text-center leading-tight mb-3">
          Código de Check-in
        </span>
        
        <div className="bg-white p-3 rounded-xl overflow-hidden">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <rect width="96" height="96" fill="white"/>
            <rect x="8" y="8" width="30" height="30" fill="black"/>
            <rect x="12" y="12" width="22" height="22" fill="white"/>
            <rect x="16" y="16" width="14" height="14" fill="black"/>
            <rect x="58" y="8" width="30" height="30" fill="black"/>
            <rect x="62" y="12" width="22" height="22" fill="white"/>
            <rect x="66" y="16" width="14" height="14" fill="black"/>
            <rect x="8" y="58" width="30" height="30" fill="black"/>
            <rect x="12" y="62" width="22" height="22" fill="white"/>
            <rect x="16" y="66" width="14" height="14" fill="black"/>
            <rect x="42" y="8" width="6" height="6" fill="black"/>
            <rect x="50" y="8" width="6" height="6" fill="black"/>
            <rect x="42" y="16" width="6" height="6" fill="black"/>
            <rect x="50" y="24" width="6" height="6" fill="black"/>
            <rect x="42" y="42" width="6" height="6" fill="black"/>
            <rect x="50" y="42" width="6" height="6" fill="black"/>
            <rect x="58" y="42" width="6" height="6" fill="black"/>
            <rect x="66" y="42" width="6" height="6" fill="black"/>
            <rect x="42" y="50" width="6" height="6" fill="black"/>
            <rect x="58" y="50" width="6" height="6" fill="black"/>
            <rect x="74" y="50" width="6" height="6" fill="black"/>
            <rect x="42" y="58" width="6" height="6" fill="black"/>
            <rect x="50" y="58" width="6" height="6" fill="black"/>
            <rect x="66" y="58" width="6" height="6" fill="black"/>
            <rect x="74" y="66" width="6" height="6" fill="black"/>
            <rect x="82" y="58" width="6" height="6" fill="black"/>
          </svg>
        </div>
        
        <span className="text-[10px] font-mono text-zinc-500 mt-3">
          {appointment.checkInCode}
        </span>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/marketplace/profile/AppointmentTicket.tsx
git commit -m "feat: add AppointmentTicket component"
```

---

### Task 3: Page - Profile

**Files:**
- Create: `src/app/(marketplace)/perfil/page.tsx`

- [ ] **Step 1: Write Profile page**
```tsx
"use client";

import React from 'react';
import { Bell } from 'lucide-react';
import { ProfileSidebar } from '@/components/marketplace/profile/ProfileSidebar';
import { AppointmentTicket, Appointment } from '@/components/marketplace/profile/AppointmentTicket';

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "appt_001",
    salonType: "SALÓN",
    salonName: "CASA BLANCA",
    serviceIcon: "scissors",
    date: "21/AGO",
    fullDate: "2024/08/21",
    staffName: "Martina Soto",
    serviceName: "Balayage",
    time: "10:30am",
    location: "Silla 1",
    checkInCode: "#MB-2024-CB01",
    status: "confirmed"
  },
  {
    id: "appt_002",
    salonType: "SPA",
    salonName: "AURA WELLNESS",
    serviceIcon: "sparkles",
    date: "23/AGO",
    fullDate: "2024/08/23",
    staffName: "Javier Gomez",
    serviceName: "Facial Premium",
    time: "3:00pm",
    location: "Lounge 4",
    checkInCode: "#MB-2024-AW02",
    status: "confirmed"
  },
  {
    id: "appt_003",
    salonType: "STUDIO",
    salonName: "STUDIO MINIMAL",
    serviceIcon: "hand",
    date: "26/AGO",
    fullDate: "2024/08/26",
    staffName: "Ana Lopez",
    serviceName: "Manicure Gel",
    time: "11:15am",
    location: "Puesto 2",
    checkInCode: "#MB-2024-SM03",
    status: "confirmed"
  }
];

const MOCK_USER = {
  name: "Sofia R.",
  email: "sofia.r@email.com",
  avatar: null,
};

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      {/* Decorative Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] bg-white/[0.03] rounded-full blur-[100px]" />
      </div>

      <ProfileSidebar user={MOCK_USER} activeNav="turnos" />

      <main className="flex-1 relative z-10 px-12 py-12">
        <header className="flex justify-between items-center mb-12">
          <h1 className="font-vogue text-3xl text-white tracking-tight">MujerApp</h1>
          <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
            <Bell className="w-6 h-6" />
            <div className="w-2 h-2 bg-emerald-400 rounded-full absolute top-1.5 right-1.5 border border-zinc-950" />
          </button>
        </header>

        <section className="max-w-4xl">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Mis Próximos Turnos</h2>
            <p className="text-zinc-400 text-sm tracking-wide">Tu agenda de belleza confirmada.</p>
          </div>

          <div className="space-y-6">
            {MOCK_APPOINTMENTS.map((appt) => (
              <AppointmentTicket key={appt.id} appointment={appt} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/\(marketplace\)/perfil/page.tsx
git commit -m "feat: implement profile page"
```

---

### Task 4: Redirect Update

**Files:**
- Modify: `src/app/login/page.tsx`

- [ ] **Step 1: Update redirect logic in login page**
```tsx
// Find where router.push('/explore') is and change to '/perfil'
// For this mock implementation, I'll update the string literal.
```

- [ ] **Step 2: Commit**
```bash
git add src/app/login/page.tsx
git commit -m "fix: update login redirect to profile"
```
