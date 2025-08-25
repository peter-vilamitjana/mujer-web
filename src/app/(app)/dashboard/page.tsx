'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUp, BarChart, Calendar, PieChart, Users, Clock, Star } from "lucide-react";
import { WeeklyTurnosChart } from "@/components/charts/WeeklyTurnosChart";
import { MonthlyVolumeChart } from "@/components/charts/MonthlyVolumeChart";
import { PopularServicesChart } from "@/components/charts/PopularServicesChart";
import { Badge } from "@/components/ui/badge";

// Mock data based on the requested structure to emulate Apple Health style widgets
const mockDashboardData = {
  ingresosSemana: {
    total: 1250000,
    tendencia: 12,
  },
  turnosHoy: 18,
  totalClientes: 257,
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
    { name: 'Alisado', value: 40, fill: 'hsl(var(--primary))' },
    { name: 'Mechas', value: 25, fill: 'hsl(var(--primary) / 0.8)' },
    { name: 'Color', value: 18, fill: 'hsl(var(--primary) / 0.6)' },
    { name: 'Botox Cap.', value: 12, fill: 'hsl(var(--primary) / 0.4)' },
    { name: 'Reflejos', value: 5, fill: 'hsl(var(--primary) / 0.2)' },
  ],
};

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

export default function DashboardPage() {
  const { 
    ingresosSemana,
    turnosHoy,
    totalClientes,
    turnosSemana, 
    volumenMensual, 
    serviciosTop
  } = mockDashboardData;
  
  const totalTurnosSemana = turnosSemana.reduce((acc, day) => acc + day.cantidad, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de la actividad y rendimiento de tu salón.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* KPI: Turnos de Hoy */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
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

        {/* KPI: Total Clientes */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
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

        {/* KPI: Ingresos Semanales */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
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

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Widget: Turnos de la Semana */}
        <Card className="lg:col-span-3 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Turnos de la Semana</CardTitle>
            <CardDescription>Semana actual (mar-sáb). Total: {totalTurnosSemana} turnos</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <WeeklyTurnosChart data={turnosSemana} />
          </CardContent>
        </Card>
        
        {/* Widget: Servicios Populares */}
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Servicios Populares</CardTitle>
            <CardDescription>Ranking de los servicios más solicitados.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-center">
            <PopularServicesChart data={serviciosTop} />
          </CardContent>
        </Card>
      </div>
      
       <div className="grid gap-6">
        {/* Widget: Volumen Mensual */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Volumen de Turnos Mensual</CardTitle>
            <CardDescription>Comparación de turnos del mes actual vs. el anterior.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <MonthlyVolumeChart data={volumenMensual} />
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
