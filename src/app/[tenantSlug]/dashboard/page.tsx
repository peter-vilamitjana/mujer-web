'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Search, Bell, Settings, LayoutDashboard, LineChart, Package, 
  Network, ShieldCheck, Calendar, Plus, TrendingUp, Clock, 
  ArrowDown, ArrowUp, AlertCircle, Filter, Download, MoreVertical,
  ArrowRight
} from 'lucide-react';

export default function CajaDashboardPage() {
  return (
    <div className="bg-[#09090b] text-white font-inter min-h-screen selection:bg-emerald-500/30 selection:text-white">
      
      {/* Top Navigation Anchor */}
      <header className="sticky top-2 z-50 flex items-center justify-between px-6 py-3 rounded-2xl mx-6 mt-2 w-[calc(100%-3rem)] bg-[#141414]/80 backdrop-blur-[40px] border border-white/[0.06] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-4">
          <span className="font-playfair text-2xl font-bold text-emerald-400 tracking-tight italic">LIQUIDGLASS</span>
          <div className="h-4 w-[1px] bg-white/[0.06] mx-2"></div>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">DASHBOARD</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-white/[0.03] transition-all duration-300 text-zinc-400">
            <Search size={18} />
          </button>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">SYSTEM ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-zinc-400 hover:bg-white/[0.03] transition-all duration-300 rounded-lg">
              <Bell size={18} />
            </button>
            <button className="p-2 text-zinc-400 hover:bg-white/[0.03] transition-all duration-300 rounded-lg">
              <Settings size={18} />
            </button>
            <div className="w-8 h-8 rounded-full border border-emerald-400/30 overflow-hidden ml-2 bg-zinc-800 flex items-center justify-center font-playfair italic text-emerald-400">
              V
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar macOS Dock Style */}
      <aside className="group fixed left-6 top-[80px] bottom-6 w-16 hover:w-64 transition-all duration-500 overflow-hidden bg-[#141414]/80 backdrop-blur-[40px] rounded-2xl border border-white/[0.06] shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-40 flex flex-col py-6">
        <div className="px-4 mb-8 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <LayoutDashboard size={16} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">System</p>
            <p className="text-[10px] text-zinc-500">V2.0.4</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto w-64">
          <Link href="#" className="bg-white/[0.03] text-emerald-400 border-l-2 border-emerald-400 flex items-center gap-4 px-4 py-3 transition-all duration-300 group-hover:translate-x-1">
            <LayoutDashboard size={18} className="shrink-0" />
            <span className="text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Overview</span>
          </Link>
          <Link href="#" className="text-zinc-400 flex items-center gap-4 px-4 py-3 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-300 group-hover:translate-x-1">
            <LineChart size={18} className="shrink-0" />
            <span className="text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Performance</span>
          </Link>
          <Link href="#" className="text-zinc-400 flex items-center gap-4 px-4 py-3 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-300 group-hover:translate-x-1">
            <Package size={18} className="shrink-0" />
            <span className="text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Inventory</span>
          </Link>
          <Link href="#" className="text-zinc-400 flex items-center gap-4 px-4 py-3 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-300 group-hover:translate-x-1">
            <Network size={18} className="shrink-0" />
            <span className="text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Network</span>
          </Link>
          <Link href="#" className="text-zinc-400 flex items-center gap-4 px-4 py-3 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-300 group-hover:translate-x-1">
            <ShieldCheck size={18} className="shrink-0" />
            <span className="text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Security</span>
          </Link>
        </nav>
        
        <div className="mt-auto px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 w-64">
          <button className="w-[calc(100%-2rem)] bg-emerald-500 text-black py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95">
            Upgrade
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="ml-28 md:ml-32 mr-6 pt-8 pb-10 max-w-[1440px] mx-auto transition-all duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 px-2">
          <div>
            <h1 className="font-playfair text-4xl md:text-5xl text-white font-bold tracking-tight italic">Caja Dashboard</h1>
            <p className="text-zinc-400 text-base mt-2">Real-time fiscal monitoring & asset liquidity management.</p>
          </div>
          <div className="flex gap-4 mt-6 md:mt-0">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#141414]/50 backdrop-blur-md rounded-xl border border-white/[0.06] text-white text-[11px] font-bold tracking-widest uppercase hover:bg-white/[0.04] transition-all">
              <Calendar size={16} />
              LAST 7 DAYS
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-black rounded-xl text-[11px] font-bold tracking-widest uppercase hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all active:scale-95">
              <Plus size={16} />
              NEW ENTRY
            </button>
          </div>
        </div>

        {/* Metrics Layered Bento Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          
          {/* Total Income */}
          <div className="relative group h-[220px] rounded-2xl bg-[#141414] backdrop-blur-[40px] border border-white/[0.06] p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-[0.2em]">TOTAL INCOME</span>
              <h3 className="font-playfair text-5xl font-bold text-white mt-3 italic">$241,890.00</h3>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <TrendingUp size={16} />
              <span className="text-sm font-medium">+12.4% vs last month</span>
            </div>
          </div>

          {/* Weekly Comparison */}
          <div className="relative h-[220px] rounded-2xl bg-[#141414] backdrop-blur-[40px] border border-white/[0.06] p-8 flex flex-col justify-between overflow-hidden shadow-2xl group">
            <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
              <img className="w-full h-full object-cover" alt="Data background" src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" />
              <div className="absolute inset-0 bg-[#141414]/60 backdrop-blur-sm"></div>
            </div>
            <div className="relative z-10">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-[0.2em]">WEEKLY PERFORMANCE</span>
              <h3 className="font-playfair text-5xl font-bold text-white mt-3 italic">$34,200</h3>
            </div>
            <div className="relative z-10 flex gap-1.5 items-end h-16">
              <div className="w-2.5 h-[30%] bg-white/[0.1] rounded-full"></div>
              <div className="w-2.5 h-[50%] bg-white/[0.1] rounded-full"></div>
              <div className="w-2.5 h-[80%] bg-emerald-400 rounded-full"></div>
              <div className="w-2.5 h-[40%] bg-white/[0.1] rounded-full"></div>
              <div className="w-2.5 h-[60%] bg-white/[0.1] rounded-full"></div>
            </div>
          </div>

          {/* Pending Collections */}
          <div className="relative h-[220px] rounded-2xl bg-[#141414] backdrop-blur-[40px] border border-white/[0.06] p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-[0.2em]">PENDING COLLECTIONS</span>
              <h3 className="font-playfair text-5xl font-bold text-white mt-3 italic">14 Items</h3>
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <Clock size={16} />
              <span className="text-sm font-medium">Est. Liquid: $12,450</span>
            </div>
          </div>
        </div>

        {/* Dynamic Visualization Area */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          
          {/* Asset Distribution Chart */}
          <div className="xl:col-span-8 h-[440px] rounded-2xl bg-[#141414] backdrop-blur-[40px] border border-white/[0.06] p-8 overflow-hidden relative shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-2xl text-white font-bold font-playfair italic">Revenue Flow</h4>
                <p className="text-zinc-400 text-sm mt-1">Cash vs. Digital Assets distribution.</p>
              </div>
              <div className="flex gap-2 items-center">
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">DIGITAL</span>
                <span className="w-3 h-3 rounded-full bg-white/[0.1] ml-4"></span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">CASH</span>
              </div>
            </div>
            
            <div className="w-full h-full mt-4 flex items-end justify-between gap-4 pb-20">
              {/* Faux Bar Chart translated to React mapping */}
              {[
                { day: 'MON', h1: '60%', h2: '30%', h3: '40%' },
                { day: 'TUE', h1: '75%', h2: '40%', h3: '50%' },
                { day: 'WED', h1: '40%', h2: '20%', h3: '30%' },
                { day: 'THU', h1: '90%', h2: '50%', h3: '60%' },
                { day: 'FRI', h1: '65%', h2: '35%', h3: '45%' },
                { day: 'SAT', h1: '50%', h2: '25%', h3: '35%' },
                { day: 'SUN', h1: '30%', h2: '15%', h3: '20%' },
              ].map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                  <div className="w-full max-w-[48px] bg-[#0d0d0d] rounded-t-xl relative overflow-hidden" style={{ height: item.h1 }}>
                    <div className="absolute bottom-0 w-full bg-emerald-500/20" style={{ height: '100%' }}></div>
                    <div className="absolute bottom-0 w-full bg-emerald-400 transition-all duration-300" style={{ height: item.h2 }}></div>
                    <div className="absolute bottom-0 w-full bg-emerald-300 opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ height: item.h3 }}></div>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Image/Promotion */}
          <div className="xl:col-span-4 h-[440px] rounded-2xl overflow-hidden relative border border-white/[0.06] shadow-2xl group">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60" alt="Office shot" src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">INSIGHT</span>
              <h4 className="text-2xl text-white mt-4 font-playfair italic">Quarterly Review</h4>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">Export your comprehensive financial audit for Q3 2024.</p>
              <button className="mt-6 flex items-center gap-2 text-emerald-400 text-[11px] uppercase tracking-widest font-bold group/btn hover:text-emerald-300 transition-colors">
                DOWNLOAD REPORT
                <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Movements Table */}
        <section>
          <div className="bg-[#141414] backdrop-blur-[40px] rounded-2xl border border-white/[0.06] overflow-hidden shadow-2xl">
            <div className="px-8 py-6 bg-white/[0.02] border-b border-white/[0.06] flex justify-between items-center">
              <h3 className="text-2xl text-white font-bold font-playfair italic">Movimientos del Día</h3>
              <div className="flex gap-4">
                <button className="text-zinc-400 hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-emerald-500/10">
                  <Filter size={18} />
                </button>
                <button className="text-zinc-400 hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-emerald-500/10">
                  <Download size={18} />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold border-b border-white/[0.06]">
                    <th className="px-8 py-5">ID Reference</th>
                    <th className="px-4 py-5">Type</th>
                    <th className="px-4 py-5">Category</th>
                    <th className="px-4 py-5">Status</th>
                    <th className="px-4 py-5 text-right">Amount</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  
                  <tr className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5 font-mono text-zinc-400 text-xs">TXN-49021</td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <ArrowDown size={16} className="text-emerald-400" />
                        Incoming
                      </div>
                    </td>
                    <td className="px-4 py-5 text-zinc-400">Cloud Services</td>
                    <td className="px-4 py-5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-widest uppercase border border-emerald-500/20">COMPLETED</span>
                    </td>
                    <td className="px-4 py-5 text-right font-mono font-medium text-emerald-400">+$1,240.00</td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all p-1">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>

                  <tr className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5 font-mono text-zinc-400 text-xs">TXN-49022</td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <ArrowUp size={16} className="text-amber-400" />
                        Outgoing
                      </div>
                    </td>
                    <td className="px-4 py-5 text-zinc-400">Facility Lease</td>
                    <td className="px-4 py-5">
                      <span className="px-2.5 py-1 rounded-full bg-white/[0.05] text-zinc-400 text-[10px] font-bold tracking-widest uppercase border border-white/[0.1]">PROCESSING</span>
                    </td>
                    <td className="px-4 py-5 text-right font-mono font-medium text-white">-$4,500.00</td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all p-1">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>

                  <tr className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5 font-mono text-zinc-400 text-xs">TXN-49023</td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <ArrowDown size={16} className="text-emerald-400" />
                        Incoming
                      </div>
                    </td>
                    <td className="px-4 py-5 text-zinc-400">Retail Partner</td>
                    <td className="px-4 py-5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-widest uppercase border border-emerald-500/20">COMPLETED</span>
                    </td>
                    <td className="px-4 py-5 text-right font-mono font-medium text-emerald-400">+$890.50</td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all p-1">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5 font-mono text-zinc-400 text-xs">TXN-49024</td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <AlertCircle size={16} className="text-red-400" />
                        Disputed
                      </div>
                    </td>
                    <td className="px-4 py-5 text-zinc-400">Refund Request</td>
                    <td className="px-4 py-5">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold tracking-widest uppercase border border-red-500/20">FLAGGED</span>
                    </td>
                    <td className="px-4 py-5 text-right font-mono font-medium text-red-400">-$210.00</td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all p-1">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Footer Component */}
        <footer className="w-full mt-12 mb-4">
          <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="font-playfair text-xl text-zinc-500 font-bold italic">LIQUIDGLASS</span>
            <div className="flex gap-6">
              <a className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-emerald-400 transition-colors" href="#">Manifesto</a>
              <a className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-emerald-400 transition-colors" href="#">Privacy</a>
              <a className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-emerald-400 transition-colors" href="#">Support</a>
              <a className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-emerald-400 transition-colors" href="#">Contact</a>
            </div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-600">© 2024 LIQUID GLASS ARCHIVE. ALL RIGHTS RESERVED.</p>
          </div>
        </footer>

      </main>
    </div>
  );
}
