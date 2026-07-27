'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createInvitation } from '@/actions/invitations.actions';
import type { Staff } from '@/lib/schema';
import type { StaffAccessState } from '@/actions/invitations.actions';

function buildWhatsAppShare(staffName: string, staffPhone: string | undefined, tenantName: string, url: string) {
  const message =
    `Hola ${staffName}! 👋\n\n` +
    `Te habilité tu acceso a *${tenantName}* en Ouleeh.\n\n` +
    `Entrá acá para activarlo:\n${url}\n\n` +
    `El link vence en 7 días.`;

  const phone = staffPhone?.replace(/\D/g, '');
  return phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export default function StaffAccessModal({
  staff,
  tenantId,
  tenantName,
  pendingInvite,
  onClose,
  onChanged,
}: {
  staff: Staff;
  tenantId: string;
  tenantName: string;
  pendingInvite: StaffAccessState['pendingInvite'];
  onClose: () => void;
  onChanged: () => void;
}) {
  const hasFreshInvite = !!pendingInvite && !pendingInvite.expired;

  const [role, setRole] = useState<'employee' | 'admin'>(pendingInvite?.role ?? 'employee');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(hasFreshInvite ? pendingInvite!.url : null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    const result = await createInvitation(tenantId, staff.id, role);
    setGenerating(false);
    if (!result.success || !result.url) {
      setError(result.error ?? 'No se pudo generar el link.');
      return;
    }
    setUrl(result.url);
    onChanged();
  }

  async function handleCopy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md rounded-[24px] border border-white/[0.08] bg-[#0d0d0d] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-[#7a766e] hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
        </button>

        {!url ? (
          <>
            <h2 className="font-playfair text-xl font-bold italic text-[#f5f0e8] mb-1">Habilitar acceso</h2>
            <p className="text-[#7a766e] text-sm mb-6">{staff.name}</p>

            <p className="text-[10px] font-bold text-[#7a766e] uppercase tracking-widest mb-3">¿Qué puede hacer?</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole('employee')}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  role === 'employee'
                    ? 'bg-violet-500/[0.10] border-violet-400/30'
                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                <p className={`text-[13px] font-bold mb-1 ${role === 'employee' ? 'text-violet-300' : 'text-[#f5f0e8]'}`}>Profesional</p>
                <p className="text-[11px] text-[#7a766e] leading-tight">Ve agenda y cobra</p>
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  role === 'admin'
                    ? 'bg-violet-500/[0.10] border-violet-400/30'
                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                <p className={`text-[13px] font-bold mb-1 ${role === 'admin' ? 'text-violet-300' : 'text-[#f5f0e8]'}`}>Admin</p>
                <p className="text-[11px] text-[#7a766e] leading-tight">Todo, más caja y comisiones</p>
              </button>
            </div>

            {error && <p className="text-rose-400 text-[11px] mb-4">{error}</p>}

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white font-bold text-[12px] uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {generating ? (
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>
              ) : (
                'Generar link de acceso'
              )}
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <h2 className="font-playfair text-xl font-bold italic text-[#f5f0e8]">Link generado</h2>
            </div>
            <p className="text-[#7a766e] text-sm mb-6">{staff.name} · {role === 'admin' ? 'Admin' : 'Profesional'}</p>

            <div className="flex gap-2 mb-4">
              <input
                readOnly
                value={url}
                onClick={e => e.currentTarget.select()}
                className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[12px] text-[#f5f0e8] font-mono truncate focus:outline-none"
              />
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={handleCopy}
                className="shrink-0 w-10 h-10 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className={`material-symbols-outlined ${copied ? 'text-emerald-400' : 'text-[#f5f0e8]'}`} style={{ fontSize: '16px' }}>
                  {copied ? 'check' : 'content_copy'}
                </span>
              </motion.button>
            </div>

            <a
              href={buildWhatsAppShare(staff.name, staff.phone, tenantName, url)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[12px] uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>chat</span>
              Enviar por WhatsApp
            </a>

            <p className="text-center text-[10px] text-[#7a766e] mt-4">Vence en 7 días</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
