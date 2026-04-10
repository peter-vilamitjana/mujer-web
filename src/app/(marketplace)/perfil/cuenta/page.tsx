'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, Check, Loader2, LogOut, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MOCK_PROFILE = {
  name: "Carolina Müller",
  email: "carolina@email.com",
  phone: "9 11 4567-8901",
  memberSince: "Marzo 2025",
  salonsVisited: [
    { name: "Maison de Beauté", slug: "maison", visits: 3 },
    { name: "Studio Lumière", slug: "studio", visits: 1 }
  ]
};

export default function MiCuentaPage() {
  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleEdit = (field: 'name' | 'phone') => {
    setEditingField(field);
    setTempValue(profile[field as keyof typeof MOCK_PROFILE] as string);
  };

  const handleConfirmEdit = () => {
    if (editingField) {
      setProfile(prev => ({ ...prev, [editingField]: tempValue }));
      setEditingField(null);
      setHasChanges(true);
    }
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setHasChanges(false);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 1500);
  };

  const nameInitial = profile.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 sm:p-12 font-inter">
      <div className="max-w-2xl mx-auto space-y-10">
        {/* Back link */}
        <Link 
          href="/perfil" 
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Volver al Panel</span>
        </Link>

        {/* Header */}
        <h1 className="font-playfair text-3xl tracking-tight">Mi perfil</h1>

        {/* Card Avatar */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 font-playfair text-3xl shadow-[0_0_20px_rgba(52,211,153,0.1)]">
            {nameInitial}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">{profile.name}</h2>
            <p className="text-zinc-400 text-sm">{profile.email}</p>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium">Clienta desde {profile.memberSince}</p>
          </div>
        </div>

        {/* Sección Información Personal */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-bold">Información Personal</h3>
          </div>

          <div className="space-y-6">
            {/* Nombre */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs ml-1 uppercase tracking-wider font-semibold">Nombre completo</Label>
              <div className="relative group">
                <Input 
                  value={editingField === 'name' ? tempValue : profile.name}
                  readOnly={editingField !== 'name'}
                  onChange={(e) => setTempValue(e.target.value)}
                  className={cn(
                    "h-12 rounded-xl transition-all font-inter bg-zinc-900",
                    editingField === 'name' 
                      ? "border-white/30 ring-1 ring-white/10 pr-12" 
                      : "border-white/10 cursor-default focus-visible:ring-0"
                  )}
                />
                {editingField === 'name' ? (
                  <button 
                    onClick={handleConfirmEdit}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition-colors"
                  >
                    <Check size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={() => handleEdit('name')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Email (No editable) */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs ml-1 uppercase tracking-wider font-semibold">Email</Label>
              <div className="relative">
                <Input 
                  value={profile.email}
                  readOnly
                  className="h-12 rounded-xl bg-zinc-900/30 border-white/5 text-zinc-500 cursor-not-allowed font-inter no-ring opacity-60"
                />
              </div>
              <p className="text-zinc-600 text-xs ml-1 italic">El email no se puede cambiar</p>
            </div>

            {/* Celular */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs ml-1 uppercase tracking-wider font-semibold">Celular / WhatsApp</Label>
              <div className={cn(
                "flex items-center bg-zinc-900 border transition-all rounded-xl overflow-hidden",
                editingField === 'phone' ? "border-white/30 ring-1 ring-white/10" : "border-white/10"
              )}>
                <div className="bg-zinc-800 border-r border-white/10 px-4 h-12 flex items-center text-zinc-500 font-inter text-sm select-none">
                  +54
                </div>
                <div className="relative flex-1">
                  <Input 
                    value={editingField === 'phone' ? tempValue : profile.phone}
                    readOnly={editingField !== 'phone'}
                    onChange={(e) => setTempValue(e.target.value.replace(/[^\d\s]/g, ''))}
                    className="border-none h-12 text-white bg-transparent focus-visible:ring-0 font-inter no-ring"
                  />
                  {editingField === 'phone' ? (
                    <button 
                      onClick={handleConfirmEdit}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition-colors"
                    >
                      <Check size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleEdit('phone')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          {hasChanges && (
            <div className="pt-4 flex justify-end">
              <Button 
                onClick={handleSaveAll}
                disabled={isSaving}
                className={cn(
                  "rounded-full px-8 py-6 font-semibold transition-all duration-500",
                  showSuccess 
                    ? "bg-emerald-400/20 text-emerald-400 border border-emerald-400/30" 
                    : "bg-white text-zinc-950 hover:bg-zinc-100"
                )}
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Guardando...</span>
                  </div>
                ) : showSuccess ? (
                  <div className="flex items-center gap-2 animate-in zoom-in-50">
                    <Check className="h-4 w-4" />
                    <span>¡Guardado ✓</span>
                  </div>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Sección Salones Visitados */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 space-y-6">
          <h3 className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-bold">Mis salones visitados</h3>
          <div className="space-y-3">
            {profile.salonsVisited.map((salon) => (
              <Link 
                key={salon.slug}
                href={`/salones/${salon.slug}`}
                className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">{salon.name}</span>
                  <span className="text-zinc-700">•</span>
                  <span className="text-zinc-400 text-sm">{salon.visits} {salon.visits === 1 ? 'visita' : 'visitas'}</span>
                </div>
                <ExternalLink size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 text-center">
          <button className="text-zinc-500 hover:text-red-400 transition-colors text-sm uppercase tracking-widest font-semibold flex items-center gap-2 mx-auto">
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
