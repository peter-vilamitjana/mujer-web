'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUp, Users, Scissors } from "lucide-react";
import { PopularServicesChart } from "@/components/charts/PopularServicesChart";
import { db } from "@/lib/firebase";
import VolumenTiempoReal from "@/components/VolumenTiempoReal";
import IngresosSemanalesCard from "@/components/IngresosSemanalesCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MonthlyVolumeChart } from "@/components/charts/MonthlyVolumeChart";
import { WeeklyTurnosChart } from "@/components/charts/WeeklyTurnosChart";
import { useUser } from "@/contexts/UserContext";

const mockDashboardData = {
  ingresosSemana: {
    total: 1250000,
    tendencia: 12,
  },
  turnosHoy: 18,
  totalClientes: 257,
  live: {
    clientasAhora: 2,
    turnosUltimaHora: 3,
  },
  turnosSemana: [
    { dia: 'Mar', cantidad: 8 },
    { dia: 'Mié', cantidad: 12 },
    { dia: 'Jue', cantidad: 15 },
    { dia: 'Vie', cantidad: 22 },
    { dia: 'Sáb', cantidad: 25 },
  ],
  volumenMensual: [
    { mes: 'anterior', total: 180 },
    { mes: 'actual', total: 205 },
  ],
  serviciosTop: [
    { nombre: 'Alisado', porcentaje: 38, deltaPct: 3.2 },
    { nombre: 'Mechas', porcentaje: 25, deltaPct: -1.5 },
    { nombre: 'Color', porcentaje: 18, deltaPct: 0 },
    { nombre: 'Botox Capilar', porcentaje: 12, deltaPct: 5.8 },
    { nombre: 'Reflejos', porcentaje: 7, deltaPct: -10.1 },
  ],
  horaPico: [
    { hora: '09:00', turnos: 2 },
    { hora: '10:00', turnos: 5 },
    { hora: '11:00', turnos: 8 },
    { hora: '12:00', turnos: 6 },
    { hora: '13:00', turnos: 3 },
    { hora: '14:00', turnos: 7 },
    { hora: '15:00', turnos: 12 },
    { hora: '16:00', turnos: 11 },
    { hora: '17:00', turnos: 9 },
    { hora: '18:00', turnos: 10 },
    { hora: '19:00', turnos: 4 },
    { hora: '20:00', turnos: 1 },
  ]
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

export default function DashboardPage() {
  const user = useUser();

  // Basic protection: if no user is loading/found, layout will handle redirect, 
  // but we can show a loader or null here if needed.
  if (!user) return null;

  const {
    turnosHoy,
    totalClientes,
    serviciosTop,
    turnosSemana,
    volumenMensual
  } = mockDashboardData;

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen de la actividad y rendimiento de tu salón.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <IngresosSemanalesCard />

        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center justify-between">
              <span>Turnos de Hoy</span>
            </CardTitle>
            <CardDescription className="text-sm">Total de citas programadas para la jornada.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <p className="text-4xl font-bold">{turnosHoy}</p>
            <Scissors className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center justify-between">
              <span>Total de Clientes</span>
            </CardTitle>
            <CardDescription className="text-sm">Clientes registrados en el sistema.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <p className="text-4xl font-bold">{totalClientes}</p>
            <Users className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

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
              <WeeklyTurnosChart data={mockDashboardData.horaPico.map(h => ({ dia: h.hora.slice(0, 2), cantidad: h.turnos }))} />
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
            <CardDescription>Top 5 más solicitados esta semana.</CardDescription>
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
            <WeeklyTurnosChart data={mockDashboardData.horaPico.map(h => ({ dia: h.hora.slice(0, 2), cantidad: h.turnos }))} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
