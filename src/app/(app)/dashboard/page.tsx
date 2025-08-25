'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUp, BarChart, Calendar, PieChart, Users, Clock, Star, Activity, Users2 } from "lucide-react";
import { MonthlyVolumeChart } from "@/components/charts/MonthlyVolumeChart";
import { PopularServicesChart } from "@/components/charts/PopularServicesChart";
import { Badge } from "@/components/ui/badge";
import { WeeklyTurnosChart } from "@/components/charts/WeeklyTurnosChart";
import { db } from "@/lib/firebase";
import RealtimeWaveformWidget from "@/components/RealtimeWaveformWidget";


// Mock data based on the requested structure to emulate Apple Health style widgets
const mockDashboardData = {
  ingresosSemana: {
    total: 1250000,
    tendencia: 12,
  },
  turnosHoy: 18,
  totalClientes: 257,
  live: {
    clientasAhora: 5,
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
    { name: 'Alisado', value: 40 },
    { name: 'Mechas', value: 25 },
    { name: 'Color', value: 18 },
    { name: 'Botox Cap.', value: 12 },
    { name: 'Reflejos', value: 5 },
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
  const { 
    ingresosSemana,
    turnosHoy,
    totalClientes,
    volumenMensual, 
    serviciosTop,
    live,
    turnosSemana
  } = mockDashboardData;
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de la actividad y rendimiento de tu salón.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center justify-between text-muted-foreground">
              <span>Turnos de Hoy</span>
              <Calendar className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{turnosHoy}</p>
            <p className="text-xs text-muted-foreground mt-1">Turnos programados para la jornada.</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center justify-between text-muted-foreground">
              <span>Total de Clientes</span>
              <Users className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalClientes}</p>
            <p className="text-xs text-muted-foreground mt-1">Clientes registrados en el sistema.</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center justify-between text-muted-foreground">
              <span>Ingresos Semanales</span>
               <Badge variant="outline" className="text-green-600 border-green-600/50 bg-green-500/10 dark:text-green-400 dark:border-green-400/30 dark:bg-green-500/10">
                  <ArrowUp className="h-3 w-3 mr-1"/> {ingresosSemana.tendencia}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{formatCurrency(ingresosSemana.total)}</p>
            <p className="text-xs text-muted-foreground mt-1">Ingresos brutos estimados de la semana.</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader>
              <CardTitle>Turnos de la Semana</CardTitle>
              <CardDescription>Volumen de trabajo de martes a sábado.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
              <WeeklyTurnosChart data={turnosSemana} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
           <CardHeader>
            <CardTitle>Servicios Populares</CardTitle>
            <CardDescription>Top 5 más solicitados.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-center">
            <PopularServicesChart data={serviciosTop} />
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
             <RealtimeWaveformWidget db={db} sucursalId="main" />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader>
             <CardTitle>Volumen Mensual</CardTitle>
            <CardDescription>Comparación de turnos del mes actual vs. el anterior.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-center">
            <MonthlyVolumeChart data={volumenMensual} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
