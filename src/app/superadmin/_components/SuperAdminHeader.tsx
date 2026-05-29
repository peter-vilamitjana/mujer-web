'use client'

import Link from 'next/link'

export function SuperAdminHeader({ userInitial }: { userInitial: string }) {
  return (
    <header className="sticky top-2 flex justify-between items-center px-6 py-2 z-50 bg-[#0e1511]/60 backdrop-blur-[40px] border-[0.5px] border-[#3c4a42] rounded-xl w-full shadow-none hover:shadow-[0_0_15px_rgba(90,240,179,0.05)] transition-all mb-6">
      <div className="flex items-center gap-4">
        <h1 className="font-sans text-[32px] font-semibold text-[#5af0b3] tracking-tighter">Ouleeh</h1>
        <div className="hidden md:flex items-center px-4 py-1.5 bg-white/5 rounded-full border border-white/10 ml-4">
          <span className="material-symbols-outlined text-[18px] text-[#bbcac0] mr-2">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-[14px] w-64 p-0 placeholder:text-[#bbcac0]/50 text-[#dde4dd] outline-none" 
            placeholder="Search system nodes..." 
            type="text" 
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="material-symbols-outlined p-2 rounded-full hover:bg-white/10 text-[#bbcac0] transition-colors cursor-pointer">
          notifications
        </button>
        <Link href="/superadmin/sistema" className="material-symbols-outlined p-2 rounded-full hover:bg-white/10 text-[#bbcac0] transition-colors cursor-pointer inline-flex items-center justify-center">
          settings
        </Link>
        <div className="h-8 w-8 rounded-full bg-[#5af0b3]/10 border border-[#5af0b3]/30 flex items-center justify-center text-[#5af0b3] text-[12px] font-bold ml-2 cursor-default shrink-0">
          {userInitial}
        </div>
      </div>
    </header>
  )
}
