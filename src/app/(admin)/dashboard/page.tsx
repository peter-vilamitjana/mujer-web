'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Scissors, Loader2, TrendingUp, Clock } from "lucide-react";
import { PopularServicesChart } from "@/components/charts/PopularServicesChart";
import { db } from "@/lib/firebase";
import VolumenTiempoReal from "@/components/VolumenTiempoReal";
import IngresosSemanalesCard from "@/components/IngresosSemanalesCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MonthlyVolumeChart } from "@/components/charts/MonthlyVolumeChart";
import { WeeklyTurnosChart } from "@/components/charts/WeeklyTurnosChart";
import { useUser } from "@/contexts/UserContext";
import { useMetrics } from "@/hooks/useMetrics";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function DashboardPage() {
  const user = useUser();
  const {
    turnosHoy,
    totalClientes,
    serviciosTop,
    turnosSemana,
    volumenMensual,
    horaPico,
    ingresosSemana,
    ingresosDelMes,
    ocupacion,
    proximosTurnos,
    loading
  } = useMetrics();

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen de la actividad y rendimiento de tu salón.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <IngresosSemanalesCard total={ingresosSemana.total} tendencia={ingresosSemana.tendencia} />

        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-sm">Ingresos del mes</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">
              {ingresosDelMes > 0
                ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(ingresosDelMes)
                : <span className="text-muted-foreground text-base font-normal">Sin datos aún</span>
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Solo turnos completados</p>
            <TrendingUp className="h-5 w-5 text-muted-foreground mt-2" />
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-sm">Turnos de hoy</CardDescription>
            <CardTitle className="text-4xl font-bold">{turnosHoy}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Citas programadas</p>
            <Scissors className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-sm">Total de clientes</CardDescription>
            <CardTitle className="text-4xl font-bold">{totalClientes}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Ocupación: {ocupacion > 0 ? `${ocupacion}%` : 'Sin datos'}
            </p>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Próximos turnos */}
      <Card className="shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Próximos turnos
          </CardTitle>
          <CardDescription>Citas en las próximas 3 horas.</CardDescription>
        </CardHeader>
        <CardContent>
          {proximosTurnos.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Sin turnos en las próximas 3 horas.</p>
          ) : (
            <div className="space-y-2">
              {proximosTurnos.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{t.clientName}</p>
                    <p className="text-xs text-muted-foreground">{t.serviceNames} · {t.staffName}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {format(t.date, 'HH:mm', { locale: es })}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{t.durationMinutes} min</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <Tabs defaultValue="semana">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Volumen de Turnos</CardTitle>
                  <CardDescription>Comparación de la cantidad de turnos.</CardDescription>
                </div>
                <TabsList>
                  <TabsTrigger value="dia">Día</TabsTrigger>
                  <TabsTrigger value="semana">Semana</TabsTrigger>
                  <TabsTrigger value="mes">Mes</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <TabsContent value="dia" className="h-80 w-full p-4">
              {/* Map horaPico to expected format for chart */}
              <WeeklyTurnosChart data={horaPico.map(h => ({ dia: `${h.hora.slice(0, 2)}hs`, cantidad: h.turnos }))} />
            </TabsContent>
            <TabsContent value="semana" className="h-80 w-full p-4">
              <WeeklyTurnosChart data={turnosSemana} />
            </TabsContent>
            <TabsContent value="mes" className="h-80 w-full p-4">
              <MonthlyVolumeChart data={volumenMensual} />
            </TabsContent>
          </Tabs>
        </Card>
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Servicios Populares</CardTitle>
            <CardDescription>Top 5 más solicitados.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-center">
            <PopularServicesChart items={serviciosTop} updatedAt={new Date()} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between rounded-2xl">
          <CardHeader>
            <CardTitle>Volumen en Tiempo Real</CardTitle>
            <CardDescription>Pulso de actividad del salón ahora mismo.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center text-center p-0">
            <VolumenTiempoReal db={db} sucursalId="main" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Hora Pico del Día</CardTitle>
            <CardDescription>Distribución de turnos a lo largo de la jornada.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-center">
            <WeeklyTurnosChart data={horaPico.map(h => ({ dia: `${h.hora.slice(0, 2)}hs`, cantidad: h.turnos }))} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
