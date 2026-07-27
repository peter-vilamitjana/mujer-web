'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Calendar,
  Clock,
  Plus,
  XCircle,
  User,
  CheckCircle,
  Ban,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { DashboardAppointment } from '@/lib/services/customer.service';
import type { AppointmentStatus } from '@/lib/schema';
import { cancelAppointment } from '@/actions/customer.actions';

interface ProximoTurnoCardProps {
  appointment: DashboardAppointment;
  onCancel: (id: string) => void;
  isCancelling: boolean;
}

function ProximoTurnoCard({ appointment, onCancel, isCancelling }: ProximoTurnoCardProps) {
  const services = appointment.serviceName.split(',').map((s) => s.trim());
  const [isExpanded, setIsExpanded] = useState(false);

  const displayServices = isExpanded ? services : services.slice(0, 3);
  const hasMoreServices = services.length > 3;

  // Extraer día, mes y hora del dateRaw
  const dateObj = appointment.dateRaw;
  const day = String(dateObj.getDate());
  const month = dateObj.toLocaleDateString('es-AR', { month: 'long' });
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col sm:flex-row sm:items-stretch gap-4">
      <div className="flex flex-col justify-center items-center text-center p-4 rounded-lg bg-black/10 flex-shrink-0 w-full sm:w-28">
        <p className="font-bold text-3xl sm:text-4xl">{day}</p>
        <h3 className="font-semibold text-base sm:text-lg capitalize">{month}</h3>
        <p className="font-mono text-lg sm:text-xl mt-2 sm:mt-3 flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 opacity-80" />
          {time}
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm opacity-90">
            <User className="h-4 w-4" />
            Con {appointment.staffName}
          </p>
          <p className="font-semibold mt-3 mb-1 text-sm">Servicios:</p>
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="space-y-1">
            <ul className="space-y-1 text-xs list-disc list-inside text-white/90">
              {displayServices.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
            {hasMoreServices && (
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-1 text-xs font-semibold text-primary-foreground/80 hover:text-primary-foreground mt-2">
                  {isExpanded ? '– Ver menos' : '+ Ver todos los servicios'}
                  <ChevronDown
                    className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
                  />
                </button>
              </CollapsibleTrigger>
            )}
            <CollapsibleContent />
          </Collapsible>
        </div>
        <div className="pt-3 mt-3 border-t border-white/20 flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/20"
              >
                <XCircle className="h-4 w-4 mr-2" /> Cancelar Turno
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás segura?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. El turno será cancelado permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Volver</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onCancel(appointment.id)}
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Cancelando...' : 'Sí, cancelar turno'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

function getStatusInfo(status: AppointmentStatus) {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return {
        text: 'Pendiente',
        icon: Clock,
        className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      };
    case 'pending_payment':
      return {
        text: 'Pendiente de Seña',
        icon: Clock,
        className: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      };
    case 'completed':
    case 'cobrado':
      return {
        text: 'Realizado',
        icon: CheckCircle,
        className: 'bg-green-500/20 text-green-400 border-green-500/30',
      };
    case 'cancelled':
      return {
        text: 'Cancelado',
        icon: Ban,
        className: 'bg-red-500/20 text-red-400 border-red-500/30',
      };
    case 'no_show':
      return {
        text: 'No se presentó',
        icon: Ban,
        className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      };
    default:
      return {
        text: 'Desconocido',
        icon: Clock,
        className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      };
  }
}

interface CustomerDashboardViewProps {
  appointments: DashboardAppointment[];
  salonName: string;
  tenantSlug: string;
  userName?: string;
}

export function CustomerDashboardView({
  appointments,
  salonName,
  tenantSlug,
  userName,
}: CustomerDashboardViewProps) {
  const [filter, setFilter] = useState('month');
  const [visibleCount, setVisibleCount] = useState(10);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set());

  const upcoming = appointments.filter((a) =>
    ['pending', 'confirmed', 'pending_payment'].includes(a.status) &&
    !cancelledIds.has(a.id)
  );

  const history = useMemo(() => {
    const allPast = appointments.filter((a) =>
      ['cobrado', 'cancelled', 'completed', 'no_show'].includes(a.status)
    );

    if (filter === 'all') return allPast;

    const daysToSubtract = filter === 'week' ? 7 : filter === 'month' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToSubtract);
    cutoff.setHours(0, 0, 0, 0);

    return allPast.filter((a) => a.dateRaw >= cutoff);
  }, [appointments, filter]);

  const visibleHistory = history.slice(0, visibleCount);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const result = await cancelAppointment(id, tenantSlug);
      if (result.success) {
        setCancelledIds((prev) => new Set(prev).add(id));
      } else {
        console.error('[handleCancel] Error:', result.error);
      }
    } catch (err) {
      console.error('[handleCancel] Unexpected error:', err);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight">
            Bienvenida{userName ? `, ${userName}` : ''}
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            Revisá tus próximos turnos y tu historial de visitas en {salonName}.
          </p>
        </div>
        <Link href={`/salones/${tenantSlug}/turnos`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Agendar Turno
          </Button>
        </Link>
      </div>

      {/* Próximos turnos */}
      {upcoming.length > 0 ? (
        <Card className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-2xl shadow-primary/20 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Próximos Turnos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcoming.map((appt) => (
              <ProximoTurnoCard
                key={appt.id}
                appointment={appt}
                onCancel={handleCancel}
                isCancelling={cancellingId === appt.id}
              />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-16 bg-card border-dashed border-border/80 rounded-2xl">
          <CardContent>
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No tenés próximos turnos</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              ¿Lista para tu próxima transformación? Animate a reservar tu cita y viví la
              experiencia Ouleeh.
            </p>
            <Button asChild className="mt-6">
              <Link href={`/salones/${tenantSlug}/turnos`}>Agendar un turno</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Historial */}
      <Card className="bg-card shadow-lg dark:shadow-none border dark:border-border/50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Historial de Visitas</CardTitle>
          <CardDescription>Aquí podés ver todos tus turnos anteriores.</CardDescription>
        </CardHeader>
        <Tabs
          value={filter}
          onValueChange={(value) => {
            setFilter(value);
            setVisibleCount(10);
          }}
          className="w-full px-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="week">Última semana</TabsTrigger>
            <TabsTrigger value="month">Último mes</TabsTrigger>
            <TabsTrigger value="quarter">Últimos 3 meses</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>
        </Tabs>
        <CardContent className="pt-6" aria-live="polite">
          {visibleHistory.length > 0 ? (
            <div className="space-y-4">
              {visibleHistory.map((appt) => {
                const statusInfo = getStatusInfo(appt.status);
                const dateStr = appt.dateRaw.toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                });
                return (
                  <Card
                    key={appt.id}
                    className="bg-muted/40 dark:bg-muted/10 border dark:border-border/50 rounded-xl"
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold capitalize text-base">{dateStr}</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {appt.serviceName
                            .split(',')
                            .map((s, i) => (
                              <li key={i}>{s.trim()}</li>
                            ))}
                        </ul>
                      </div>
                      <Badge
                        variant="outline"
                        className={`gap-2 text-xs font-bold ${statusInfo.className}`}
                      >
                        <statusInfo.icon className="h-3.5 w-3.5" />
                        <span>{statusInfo.text}</span>
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
              {history.length > visibleCount && (
                <div className="text-center pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => setVisibleCount((prev) => prev + 10)}
                  >
                    Ver más visitas
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center pt-4">
                Los valores finales de cada visita se ajustaron según diagnóstico en el local.
              </p>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay visitas en este período.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
