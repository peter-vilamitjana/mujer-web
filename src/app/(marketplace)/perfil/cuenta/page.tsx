'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { Pencil, Check, Loader2, ExternalLink } from 'lucide-react';
import { DashboardSidebar } from '../_components/DashboardSidebar';
import { getMyProfile, updateMyProfile } from '@/actions/profile.actions';

export default function MiPerfilPage() {
  const { data: session } = useSession();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getMyProfile().then((profile) => {
      if (profile) {
        setDisplayName(profile.displayName);
        setEmail(profile.email);
        setPhone(profile.phone);
        setMemberSince(profile.createdAt);
        setPhotoURL(profile.photoURL);
      } else if (session?.user) {
        setDisplayName(session.user.name ?? '');
        setEmail(session.user.email ?? '');
        setPhotoURL(session.user.image ?? null);
      }
      setIsLoading(false);
    });
  }, [session]);

  const handleEdit = (field: 'name' | 'phone') => {
    setEditingField(field);
    setTempValue(field === 'name' ? displayName : phone);
  };

  const handleConfirmEdit = () => {
    if (editingField === 'name') setDisplayName(tempValue);
    if (editingField === 'phone') setPhone(tempValue);
    setEditingField(null);
    setHasChanges(true);
    setSaveError(null);
  };

  const handleSaveAll = () => {
    setSaveError(null);
    startTransition(async () => {
      const result = await updateMyProfile({ displayName, phone });
      if (result.success) {
        setHasChanges(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        setSaveError(result.error ?? 'Error al guardar.');
      }
    });
  };

  const nameInitial = displayName.charAt(0).toUpperCase() || '?';

  const inputBase: React.CSSProperties = {
    height: '48px',
    backgroundColor: '#050504',
    border: '1px solid #8A8F98',
    borderRadius: '6px',
    color: '#F4F4F5',
    fontSize: '14px',
    padding: '0 40px 0 14px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#050504' }}>
      <DashboardSidebar />

      <main className="flex-1 min-w-0 px-12 py-10">
        <div className="max-w-[780px]">

          {/* Header */}
          <header className="mb-10">
            <p className="text-[10px] uppercase tracking-[0.4em] font-medium mb-2" style={{ color: '#8A8F98' }}>
              CONFIGURACIÓN
            </p>
            <h2 className="font-vogue text-[32px] font-semibold leading-none" style={{ color: '#F4F4F5' }}>
              Mi Perfil
            </h2>
            <div className="mt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }} />
          </header>

          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8A8F98' }} />
            </div>
          ) : (
            <div className="grid grid-cols-[1fr_1fr] gap-8">

              {/* Left — Personal info */}
              <div>
                {/* Avatar */}
                <div
                  className="p-6 rounded-[12px] mb-6 flex items-center gap-5"
                  style={{ backgroundColor: '#111010' }}
                >
                  <div
                    className="w-[100px] h-[100px] rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                    style={{ border: '2px solid #D4AF37', backgroundColor: '#050504' }}
                  >
                    {photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-vogue text-4xl" style={{ color: '#D4AF37' }}>
                        {nameInitial}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[#F4F4F5] font-medium text-base">{displayName}</p>
                    <p className="text-[13px] mt-0.5" style={{ color: '#8A8F98' }}>{email}</p>
                    {memberSince && (
                      <p
                        className="text-[11px] uppercase tracking-widest mt-2"
                        style={{ color: '#8A8F98', opacity: 0.6 }}
                      >
                        Clienta desde {memberSince}
                      </p>
                    )}
                  </div>
                </div>

                {/* Form */}
                <div
                  className="p-6 rounded-[12px] space-y-6"
                  style={{ backgroundColor: '#111010' }}
                >
                  <p
                    className="text-[10px] uppercase tracking-[0.2em] font-medium"
                    style={{ color: '#8A8F98' }}
                  >
                    Información Personal
                  </p>

                  {/* Nombre */}
                  <div className="space-y-2">
                    <label
                      className="block text-[12px] uppercase tracking-wider font-medium"
                      style={{ color: '#8A8F98' }}
                    >
                      Nombre completo
                    </label>
                    <div className="relative">
                      <input
                        value={editingField === 'name' ? tempValue : displayName}
                        readOnly={editingField !== 'name'}
                        onChange={(e) => setTempValue(e.target.value)}
                        style={{
                          ...inputBase,
                          borderColor: editingField === 'name' ? '#D4AF37' : '#8A8F98',
                          opacity: editingField === 'name' ? 1 : 0.7,
                        }}
                      />
                      {editingField === 'name' ? (
                        <button
                          onClick={handleConfirmEdit}
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                          style={{ color: '#D4AF37' }}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit('name')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                          style={{ color: '#8A8F98' }}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Email (read-only) */}
                  <div className="space-y-2">
                    <label
                      className="block text-[12px] uppercase tracking-wider font-medium"
                      style={{ color: '#8A8F98' }}
                    >
                      Email
                    </label>
                    <input
                      value={email}
                      readOnly
                      style={{ ...inputBase, opacity: 0.4, cursor: 'not-allowed' }}
                    />
                    <p className="text-[11px] italic" style={{ color: '#8A8F98', opacity: 0.5 }}>
                      El email no se puede cambiar
                    </p>
                  </div>

                  {/* Celular */}
                  <div className="space-y-2">
                    <label
                      className="block text-[12px] uppercase tracking-wider font-medium"
                      style={{ color: '#8A8F98' }}
                    >
                      Celular / WhatsApp
                    </label>
                    <div
                      className="flex overflow-hidden rounded-[6px]"
                      style={{
                        border: `1px solid ${editingField === 'phone' ? '#D4AF37' : '#8A8F98'}`,
                      }}
                    >
                      <div
                        className="flex items-center px-3 shrink-0 text-sm"
                        style={{
                          backgroundColor: '#050504',
                          borderRight: '1px solid #8A8F98',
                          color: '#8A8F98',
                          height: '48px',
                        }}
                      >
                        +54
                      </div>
                      <div className="relative flex-1">
                        <input
                          value={editingField === 'phone' ? tempValue : phone}
                          readOnly={editingField !== 'phone'}
                          onChange={(e) => setTempValue(e.target.value.replace(/[^\d\s]/g, ''))}
                          style={{
                            height: '48px',
                            backgroundColor: '#050504',
                            color: '#F4F4F5',
                            fontSize: '14px',
                            padding: '0 40px 0 14px',
                            width: '100%',
                            outline: 'none',
                            border: 'none',
                            opacity: editingField === 'phone' ? 1 : 0.7,
                          }}
                        />
                        {editingField === 'phone' ? (
                          <button
                            onClick={handleConfirmEdit}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                            style={{ color: '#D4AF37' }}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEdit('phone')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                            style={{ color: '#8A8F98' }}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Save button */}
                  {(hasChanges || saveError) && (
                    <div className="pt-2 flex flex-col items-end gap-2">
                      {saveError && (
                        <p className="text-[12px]" style={{ color: '#E57373' }}>{saveError}</p>
                      )}
                      <button
                        onClick={handleSaveAll}
                        disabled={isPending}
                        className="flex items-center gap-2 px-7 py-3 rounded-[6px] text-[14px] font-medium transition-all duration-200 cursor-pointer"
                        style={{
                          width: '120px',
                          height: '44px',
                          backgroundColor: showSuccess ? 'rgba(60,90,69,0.5)' : '#D4AF37',
                          color: showSuccess ? '#F4F4F5' : '#050504',
                          justifyContent: 'center',
                        }}
                      >
                        {isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : showSuccess ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Guardado</span>
                          </>
                        ) : (
                          'Guardar'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right — Preferences */}
              <div className="space-y-6">
                {/* Notification preferences */}
                <div
                  className="p-6 rounded-[12px]"
                  style={{ backgroundColor: '#111010' }}
                >
                  <p
                    className="text-[10px] uppercase tracking-[0.2em] font-medium mb-5"
                    style={{ color: '#8A8F98' }}
                  >
                    Notificaciones
                  </p>
                  <div className="space-y-4">
                    {[
                      { label: 'Recordatorio de turno (24h antes)', defaultOn: true },
                      { label: 'Confirmación por WhatsApp', defaultOn: true },
                      { label: 'Novedades de salones favoritos', defaultOn: false },
                    ].map(({ label, defaultOn }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-[13px]" style={{ color: '#F4F4F5' }}>{label}</span>
                        <div
                          className="w-9 h-5 rounded-full relative cursor-pointer transition-colors duration-200"
                          style={{ backgroundColor: defaultOn ? '#3C5A45' : 'rgba(255,255,255,0.1)' }}
                        >
                          <div
                            className="absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200"
                            style={{
                              backgroundColor: defaultOn ? '#F4F4F5' : '#8A8F98',
                              left: defaultOn ? '17px' : '2px',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Salones visitados — placeholder hasta tener historial real */}
                <div
                  className="p-6 rounded-[12px]"
                  style={{ backgroundColor: '#111010' }}
                >
                  <p
                    className="text-[10px] uppercase tracking-[0.2em] font-medium mb-5"
                    style={{ color: '#8A8F98' }}
                  >
                    Mis Salones Visitados
                  </p>
                  <p className="text-[13px]" style={{ color: '#8A8F98', opacity: 0.6 }}>
                    Tus salones favoritos aparecerán aquí.
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
