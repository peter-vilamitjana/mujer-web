'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { createTenantWithAdmin, checkSlugAvailableOnboarding } from '@/actions/onboarding.actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Building2,
  Clock,
  Users,
  Rocket,
} from 'lucide-react';

const STORAGE_KEY = 'mujerapp_onboarding_v1';

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

const DEFAULT_HOURS = Object.fromEntries(
  DAYS.map((d) => [d.key, { open: '09:00', close: '18:00', isOpen: d.key !== 'sunday' }])
);

const SUGGESTED_SERVICES = [
  { name: 'Corte de cabello', price: 5000, duration: 45 },
  { name: 'Coloración completa', price: 15000, duration: 120 },
  { name: 'Mechas', price: 18000, duration: 150 },
  { name: 'Keratina', price: 20000, duration: 180 },
  { name: 'Peinado', price: 4000, duration: 30 },
];

const CATEGORIES = ['Peluquería', 'Estética', 'Uñas', 'Maquillaje', 'Spa', 'Barbería', 'Otro'];

interface WizardData {
  salonName: string;
  address: string;
  phone: string;
  slug: string;
  category: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  businessHours: typeof DEFAULT_HOURS;
  staffEmail: string;
}

const INITIAL_DATA: WizardData = {
  salonName: '',
  address: '',
  phone: '',
  slug: '',
  category: 'Peluquería',
  serviceName: '',
  servicePrice: 0,
  serviceDuration: 60,
  businessHours: DEFAULT_HOURS,
  staffEmail: '',
};

const STEPS = [
  { label: 'Tu salón', icon: Building2 },
  { label: 'Servicios', icon: Scissors },
  { label: 'Horarios', icon: Clock },
  { label: 'Equipo', icon: Users },
  { label: 'Listo', icon: Rocket },
];

// ─── Step 1: Datos del salón ─────────────────────────────────────
function Step1({
  data,
  onChange,
  slugStatus,
  onSlugChange,
}: {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
  slugStatus: 'idle' | 'checking' | 'available' | 'taken';
  onSlugChange: (slug: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="salonName">Nombre del salón *</Label>
        <Input
          id="salonName"
          placeholder="Ej: Bella Studio"
          value={data.salonName}
          onChange={(e) => {
            const name = e.target.value;
            const autoSlug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            onChange({ salonName: name, slug: autoSlug });
            onSlugChange(autoSlug);
          }}
        />
      </div>

      <div className="space-y-1">
        <Label>Categoría</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onChange({ category: cat })}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                data.category === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="address">Dirección *</Label>
        <Input
          id="address"
          placeholder="Av. Corrientes 1234, CABA"
          value={data.address}
          onChange={(e) => onChange({ address: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone">Teléfono / WhatsApp *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+54 9 11 1234-5678"
          value={data.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="slug">URL del salón</Label>
        <div className="relative">
          <div className="flex items-center border rounded-md overflow-hidden">
            <span className="px-3 py-2 bg-muted text-muted-foreground text-sm border-r whitespace-nowrap">
              mujerapp.com/salones/
            </span>
            <Input
              id="slug"
              className="border-0 rounded-none focus-visible:ring-0"
              placeholder="bella-studio"
              value={data.slug}
              onChange={(e) => {
                const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                onChange({ slug: v });
                onSlugChange(v);
              }}
            />
            <div className="px-3">
              {slugStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              {slugStatus === 'available' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              {slugStatus === 'taken' && <XCircle className="h-4 w-4 text-destructive" />}
            </div>
          </div>
        </div>
        {slugStatus === 'taken' && <p className="text-xs text-destructive">Ese nombre ya está en uso.</p>}
        {slugStatus === 'available' && <p className="text-xs text-green-600">Disponible.</p>}
      </div>
    </div>
  );
}

// ─── Step 2: Primer servicio ──────────────────────────────────────
function Step2({ data, onChange }: { data: WizardData; onChange: (patch: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Agregá al menos un servicio para que tus clientas puedan reservar. Podés añadir más desde el dashboard.
      </p>

      <div className="space-y-2">
        <p className="text-sm font-medium">Sugerencias rápidas</p>
        <div className="grid grid-cols-1 gap-2">
          {SUGGESTED_SERVICES.map((svc) => (
            <button
              key={svc.name}
              type="button"
              onClick={() => onChange({ serviceName: svc.name, servicePrice: svc.price, serviceDuration: svc.duration })}
              className={`flex items-center justify-between p-3 border rounded-lg text-sm text-left transition-colors ${
                data.serviceName === svc.name
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <span className="font-medium">{svc.name}</span>
              <span className="text-muted-foreground">{svc.duration} min</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 space-y-3 border-t">
        <p className="text-sm font-medium">O ingresá uno personalizado</p>
        <div className="space-y-1">
          <Label>Nombre del servicio</Label>
          <Input
            placeholder="Ej: Baño de color"
            value={data.serviceName}
            onChange={(e) => onChange({ serviceName: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Precio (ARS)</Label>
            <Input
              type="number"
              min={0}
              placeholder="5000"
              value={data.servicePrice || ''}
              onChange={(e) => onChange({ servicePrice: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <Label>Duración (min)</Label>
            <Input
              type="number"
              min={1}
              placeholder="60"
              value={data.serviceDuration || ''}
              onChange={(e) => onChange({ serviceDuration: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Horarios ─────────────────────────────────────────────
function Step3({ data, onChange }: { data: WizardData; onChange: (patch: Partial<WizardData>) => void }) {
  const updateDay = (day: string, field: string, value: string | boolean) => {
    onChange({
      businessHours: {
        ...data.businessHours,
        [day]: { ...data.businessHours[day], [field]: value },
      },
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Configurá los horarios de atención de tu salón.
      </p>
      {DAYS.map((day) => {
        const s = data.businessHours[day.key] ?? { open: '09:00', close: '18:00', isOpen: true };
        return (
          <div key={day.key} className="flex items-center gap-3 p-2 border rounded-lg">
            <Switch
              checked={s.isOpen}
              onCheckedChange={(v) => updateDay(day.key, 'isOpen', v)}
            />
            <span className="w-24 text-sm font-medium">{day.label}</span>
            {s.isOpen ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="time"
                  value={s.open}
                  onChange={(e) => updateDay(day.key, 'open', e.target.value)}
                  className="h-8 text-sm"
                />
                <span className="text-muted-foreground text-xs">–</span>
                <Input
                  type="time"
                  value={s.close}
                  onChange={(e) => updateDay(day.key, 'close', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            ) : (
              <span className="text-sm text-muted-foreground italic">Cerrado</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 4: Invitar staff ────────────────────────────────────────
function Step4({ data, onChange }: { data: WizardData; onChange: (patch: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        ¿Querés invitar a alguien a tu equipo? Podés hacerlo ahora o más tarde desde el dashboard.
      </p>
      <div className="space-y-1">
        <Label htmlFor="staffEmail">Email del profesional <span className="text-muted-foreground">(opcional)</span></Label>
        <Input
          id="staffEmail"
          type="email"
          placeholder="profesional@email.com"
          value={data.staffEmail}
          onChange={(e) => onChange({ staffEmail: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Recibirá un email para unirse a tu equipo.
        </p>
      </div>

      <div className="rounded-lg border border-dashed p-4 text-center space-y-1">
        <p className="text-sm font-medium">Podés saltar este paso</p>
        <p className="text-xs text-muted-foreground">
          Gestioná tu equipo desde <span className="font-medium">Dashboard → Equipo</span> en cualquier momento.
        </p>
      </div>
    </div>
  );
}

// ─── Step 5: Confirmación ─────────────────────────────────────────
function Step5({ data }: { data: WizardData }) {
  const openDays = DAYS.filter((d) => data.businessHours[d.key]?.isOpen).map((d) => d.label);
  const formatPrice = (p: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(p);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Revisá los datos antes de crear tu salón.</p>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between border-b pb-2">
          <span className="text-muted-foreground">Nombre</span>
          <span className="font-medium">{data.salonName}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-muted-foreground">Categoría</span>
          <span className="font-medium">{data.category}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-muted-foreground">URL</span>
          <span className="font-medium text-primary">/{data.slug}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-muted-foreground">Dirección</span>
          <span className="font-medium text-right max-w-[60%]">{data.address}</span>
        </div>
        {data.serviceName && (
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Primer servicio</span>
            <span className="font-medium">{data.serviceName} · {formatPrice(data.servicePrice)}</span>
          </div>
        )}
        <div className="flex justify-between pb-2">
          <span className="text-muted-foreground">Días de atención</span>
          <span className="font-medium text-right max-w-[60%]">{openDays.join(', ')}</span>
        </div>
      </div>

      <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center space-y-1">
        <Rocket className="h-8 w-8 text-primary mx-auto" />
        <p className="font-semibold">¡Todo listo para crear tu salón!</p>
        <p className="text-xs text-muted-foreground">Al confirmar, podrás acceder a tu dashboard de inmediato.</p>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────
export default function RegisterSalonPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugTimer, setSlugTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData((prev) => ({ ...prev, ...parsed }));
        if (parsed.step) setStep(parsed.step);
      }
    } catch { /* ignore */ }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, step }));
    } catch { /* ignore */ }
  }, [data, step]);

  const onChange = useCallback((patch: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSlugChange = useCallback((slug: string) => {
    if (slugTimer) clearTimeout(slugTimer);
    if (!slug || slug.length < 3) { setSlugStatus('idle'); return; }
    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      const available = await checkSlugAvailableOnboarding(slug);
      setSlugStatus(available ? 'available' : 'taken');
    }, 600);
    setSlugTimer(timer);
  }, [slugTimer]);

  const canAdvance = (): boolean => {
    if (step === 1) return !!(data.salonName && data.address && data.phone && data.slug && slugStatus !== 'taken' && slugStatus !== 'checking');
    if (step === 2) return !!(data.serviceName && data.servicePrice > 0);
    if (step === 3) return Object.values(data.businessHours).some((h) => h.isOpen);
    return true;
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, 5));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await createTenantWithAdmin({
        salonName: data.salonName,
        address: data.address,
        phone: data.phone,
        slug: data.slug,
        category: data.category,
        serviceName: data.serviceName,
        servicePrice: data.servicePrice,
        serviceDuration: data.serviceDuration,
        businessHours: data.businessHours,
        staffEmail: data.staffEmail || undefined,
      });

      if (result.success) {
        localStorage.removeItem(STORAGE_KEY);
        router.push(`/${data.slug}/dashboard`);
      } else {
        setError(result.error ?? 'Error desconocido.');
      }
    });
  };

  // ── Google login gate ──────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold">Registrá tu salón</CardTitle>
            <CardDescription>Primero iniciá sesión para continuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full py-6"
              disabled={isLoginLoading}
              onClick={async () => {
                setIsLoginLoading(true);
                await signIn('google', { callbackUrl: '/business/register' });
              }}
            >
              {isLoginLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 488 512" fill="currentColor">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                </svg>
              )}
              Continuar con Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Wizard ─────────────────────────────────────────────────────
  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Configurá tu salón</h1>
          <p className="text-muted-foreground text-sm">Paso {step} de {STEPS.length}</p>
        </div>

        {/* Progress bar */}
        <Progress value={progressPct} className="h-2" />

        {/* Step indicators */}
        <div className="flex justify-between">
          {STEPS.map((s, idx) => {
            const n = idx + 1;
            const Icon = s.icon;
            const done = n < step;
            const active = n === step;
            return (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full border-2 transition-colors ${
                  done ? 'bg-primary border-primary text-primary-foreground' :
                  active ? 'border-primary text-primary' :
                  'border-muted-foreground/30 text-muted-foreground/50'
                }`}>
                  {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`text-xs hidden sm:block ${active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{STEPS[step - 1].label}</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <Step1 data={data} onChange={onChange} slugStatus={slugStatus} onSlugChange={handleSlugChange} />
            )}
            {step === 2 && <Step2 data={data} onChange={onChange} />}
            {step === 3 && <Step3 data={data} onChange={onChange} />}
            {step === 4 && <Step4 data={data} onChange={onChange} />}
            {step === 5 && <Step5 data={data} />}

            {error && (
              <p className="mt-4 text-sm text-destructive font-medium">{error}</p>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack} disabled={isPending}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
              )}
              {step < 5 ? (
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleNext}
                  disabled={!canAdvance()}
                >
                  {step === 4 ? 'Revisar y confirmar' : 'Siguiente'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isPending}
                >
                  {isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando tu salón...</>
                  ) : (
                    <><Rocket className="mr-2 h-4 w-4" />Crear mi salón</>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Session info */}
        <p className="text-center text-xs text-muted-foreground">
          Registrando como <span className="font-medium">{session.user?.email}</span>
        </p>
      </div>
    </div>
  );
}
