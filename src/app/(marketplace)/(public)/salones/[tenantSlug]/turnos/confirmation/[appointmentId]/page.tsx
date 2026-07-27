import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSalonBySlug } from '@/lib/services/marketplace.service';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  params: Promise<{ tenantSlug: string; appointmentId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BookConfirmationPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params;
  const sp = await searchParams;

  const salon = await getSalonBySlug(tenantSlug);
  if (!salon) notFound();

  const serviceNames = String(sp.service ?? '');
  const staffName = String(sp.staff ?? '');
  const dateISO = String(sp.date ?? '');
  const time = String(sp.time ?? '');
  const isGuest = sp.isGuest === 'true';
  const guestName = String(sp.guestName ?? '');
  const guestEmail = String(sp.guestEmail ?? '');

  const appointmentDate = dateISO ? parseISO(dateISO) : new Date();
  const validDate = isFinite(appointmentDate.getTime());
  const formattedDate = validDate
    ? format(appointmentDate, "EEEE d 'de' MMMM", { locale: es })
    : '';

  const calendarUrl = (() => {
    const parts = time.split(':').map(Number);
    const h = parts[0];
    const m = parts[1] ?? 0;
    if (!dateISO || !isFinite(h) || !isFinite(m)) return '#';
    const start = new Date(appointmentDate);
    start.setHours(h, m, 0, 0);
    if (!isFinite(start.getTime())) return '#';
    const end = new Date(start.getTime() + 60 * 60000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const title = encodeURIComponent(`Turno en ${salon.name}`);
    const details = encodeURIComponent(serviceNames);
    const location = encodeURIComponent(salon.address ?? '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&details=${details}&location=${location}`;
  })();

  const whatsappShareUrl = (() => {
    const msg = encodeURIComponent(
      `¡Reservé mi turno en ${salon.name}! 📅 ${formattedDate} a las ${time} — ${serviceNames}`
    );
    return `https://wa.me/?text=${msg}`;
  })();

  const mapsUrl = salon.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.address)}`
    : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-surface">
      <div className="w-full max-w-md space-y-6">

        {/* ── Success icon ── */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="font-vogue text-2xl text-on-surface tracking-tight">¡Turno confirmado!</h1>
          <p className="font-sans text-on-surface-secondary text-sm">
            Revisá tu WhatsApp, te enviamos los detalles.
          </p>
        </div>

        {/* ── Summary card ── */}
        <div className="rounded-[1.5rem] border border-outline-subtle bg-surface-card p-5 space-y-4">
          <div className="space-y-3 font-sans text-sm">
            <div className="flex justify-between">
              <span className="text-on-surface-secondary">Salón</span>
              <span className="font-medium text-on-surface">{salon.name}</span>
            </div>
            {serviceNames && (
              <div className="flex justify-between">
                <span className="text-on-surface-secondary">Servicio</span>
                <span className="font-medium text-right max-w-[55%] text-on-surface">{serviceNames}</span>
              </div>
            )}
            {staffName && (
              <div className="flex justify-between">
                <span className="text-on-surface-secondary">Profesional</span>
                <span className="font-medium text-on-surface">{staffName}</span>
              </div>
            )}
            <div className="h-px bg-outline-subtle" />
            {dateISO && (
              <div className="flex justify-between">
                <span className="text-on-surface-secondary">Fecha</span>
                <span className="font-medium capitalize text-on-surface">{formattedDate}</span>
              </div>
            )}
            {time && (
              <div className="flex justify-between">
                <span className="text-on-surface-secondary">Hora</span>
                <span className="font-medium text-on-surface">{time} hs</span>
              </div>
            )}
            {salon.address && (
              <div className="flex justify-between">
                <span className="text-on-surface-secondary">Dirección</span>
                {mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-right max-w-[55%] underline underline-offset-2 hover:text-on-surface text-on-surface-secondary"
                  >
                    {salon.address}
                  </a>
                ) : (
                  <span className="font-medium text-right max-w-[55%] text-on-surface">{salon.address}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="space-y-3">
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-outline-subtle bg-surface-card hover:bg-surface-hover font-sans text-sm font-medium text-on-surface transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Agregar a Google Calendar
          </a>
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-success hover:bg-success/90 font-sans text-sm font-medium text-surface transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Compartir por WhatsApp
          </a>
        </div>

        {/* ── Guest: CTA to create account ── */}
        {isGuest && (
          <div className="rounded-[1.5rem] border border-outline-subtle bg-surface-card/50 p-5 text-center space-y-3">
            <p className="font-sans text-sm font-medium text-on-surface">¿Querés gestionar tus turnos fácil?</p>
            <p className="font-sans text-xs text-on-surface-secondary">
              Creá tu cuenta y accedé a tu historial, recordatorios y más.
            </p>
            <Link
              href={`/registro?email=${encodeURIComponent(guestEmail)}&name=${encodeURIComponent(guestName)}`}
              className="inline-flex items-center justify-center w-full h-10 rounded-full border border-outline-subtle text-on-surface hover:bg-surface-hover font-sans text-xs font-bold tracking-widest uppercase transition-colors"
            >
              Crear mi cuenta
            </Link>
          </div>
        )}

        <div className="text-center">
          <Link
            href={`/salones/${tenantSlug}`}
            className="font-sans text-xs text-on-surface-secondary hover:text-on-surface underline underline-offset-2 transition-colors"
          >
            ← Volver al salón
          </Link>
        </div>
      </div>
    </div>
  );
}
