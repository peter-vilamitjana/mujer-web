'use client'

import { useState } from 'react'
import { Pencil, Check, Loader2, ExternalLink } from 'lucide-react'
import { DashboardSidebar } from '../_components/DashboardSidebar'

const MOCK_PROFILE = {
  name: 'Sofia R.',
  email: 'sofia.r@email.com',
  phone: '9 11 4567-8901',
  memberSince: 'Marzo 2025',
  salonsVisited: [
    { name: 'Maison de Beauté', slug: 'maison', visits: 3 },
    { name: 'Studio Lumière', slug: 'studio', visits: 1 },
  ],
}

export default function MiPerfilPage() {
  const [profile, setProfile] = useState(MOCK_PROFILE)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleEdit = (field: 'name' | 'phone') => {
    setEditingField(field)
    setTempValue(profile[field])
  }

  const handleConfirmEdit = () => {
    if (editingField) {
      setProfile((prev) => ({ ...prev, [editingField]: tempValue }))
      setEditingField(null)
      setHasChanges(true)
    }
  }

  const handleSaveAll = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setShowSuccess(true)
      setHasChanges(false)
      setTimeout(() => setShowSuccess(false), 2000)
    }, 1200)
  }

  const nameInitial = profile.name.charAt(0).toUpperCase()

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
  }

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

          <div className="grid grid-cols-[1fr_1fr] gap-8">

            {/* Left — Personal info */}
            <div>
              {/* Avatar */}
              <div
                className="p-6 rounded-[12px] mb-6 flex items-center gap-5"
                style={{ backgroundColor: '#111010' }}
              >
                {/* Avatar Upload — 100x100, gold border */}
                <div
                  className="w-[100px] h-[100px] rounded-full flex items-center justify-center shrink-0"
                  style={{
                    border: '2px solid #D4AF37',
                    backgroundColor: '#050504',
                    cursor: 'pointer',
                  }}
                >
                  <span className="font-vogue text-4xl" style={{ color: '#D4AF37' }}>
                    {nameInitial}
                  </span>
                </div>
                <div>
                  <p className="text-[#F4F4F5] font-medium text-base">{profile.name}</p>
                  <p className="text-[13px] mt-0.5" style={{ color: '#8A8F98' }}>{profile.email}</p>
                  <p
                    className="text-[11px] uppercase tracking-widest mt-2"
                    style={{ color: '#8A8F98', opacity: 0.6 }}
                  >
                    Clienta desde {profile.memberSince}
                  </p>
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
                      value={editingField === 'name' ? tempValue : profile.name}
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
                    value={profile.email}
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
                        value={editingField === 'phone' ? tempValue : profile.phone}
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
                {hasChanges && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveAll}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-7 py-3 rounded-[6px] text-[14px] font-medium transition-all duration-200 cursor-pointer"
                      style={{
                        width: '120px',
                        height: '44px',
                        backgroundColor: showSuccess ? 'rgba(60,90,69,0.5)' : '#D4AF37',
                        color: showSuccess ? '#F4F4F5' : '#050504',
                        justifyContent: 'center',
                      }}
                    >
                      {isSaving ? (
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

            {/* Right — Preferences + Salones */}
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

              {/* Salones visitados */}
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
                <div className="space-y-2">
                  {profile.salonsVisited.map((salon) => (
                    <a
                      key={salon.slug}
                      href={`/salones/${salon.slug}`}
                      className="flex items-center justify-between px-3 py-3 rounded-lg transition-colors duration-150 group cursor-pointer"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium" style={{ color: '#F4F4F5' }}>
                          {salon.name}
                        </span>
                        <span className="text-[11px]" style={{ color: '#8A8F98' }}>
                          · {salon.visits} {salon.visits === 1 ? 'visita' : 'visitas'}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5" style={{ color: '#8A8F98' }} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
