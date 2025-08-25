'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUp, BarChart, Calendar, PieChart, Users } from "lucide-react";
import { WeeklyTurnosChart } from "@/components/charts/WeeklyTurnosChart";
import { MonthlyVolumeChart } from "@/components/charts/MonthlyVolumeChart";
import { PopularServicesChart } from "@/components/charts/PopularServicesChart";

// Mock data based on the requested structure
const mockDashboardData = {
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
    { name: 'Otros', value: 17, fill: 'hsl(var(--primary) / 0.4)' },
  ],
  clientes: { nuevas: 32, recurrentes: 68 },
  ingresosSemana: {
    total: 1250000,
    tendencia: 12,
  },
  turnosHoy: 18,
  totalClientes: 257,
};

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

export default function DashboardPage() {
  const { 
    turnosSemana, 
    volumenMensual, 
    serviciosTop, 
    clientes,
    ingresosSemana,
    turnosHoy,
    totalClientes
  } = mockDashboardData;
  
  const totalTurnosSemana = turnosSemana.reduce((acc, day) => acc + day.cantidad, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de la actividad y rendimiento de tu salón.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Widget: Turnos de Hoy */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <span>Turnos de Hoy</span>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{turnosHoy}</p>
            <p className="text-sm text-muted-foreground">Turnos programados para la jornada.</p>
          </CardContent>
        </Card>

        {/* Widget: Total Clientes */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <span>Total de Clientes</span>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalClientes}</p>
            <p className="text-sm text-muted-foreground">Clientes registrados en el sistema.</p>
          </CardContent>
        </Card>

        {/* Widget: Ingresos Estimados */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <span>Ingresos Semanales</span>
              <span className="text-green-500 flex items-center text-sm font-bold">
                  <ArrowUp className="h-4 w-4"/> {ingresosSemana.tendencia}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{formatCurrency(ingresosSemana.total)}</p>
            <p className="text-sm text-muted-foreground">Ingresos brutos estimados de la semana.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Widget: Turnos de la Semana */}
        <Card className="lg:col-span-1 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Turnos de la Semana</CardTitle>
            <CardDescription>Total semana: {totalTurnosSemana} turnos</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <WeeklyTurnosChart data={turnosSemana} />
          </CardContent>
        </Card>
        
        {/* Widget: Servicios Populares */}
        <Card className="lg:col-span-1 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Servicios Populares</CardTitle>
            <CardDescription>Distribución de los servicios más solicitados.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <PopularServicesChart data={serviciosTop} />
          </CardContent>
        </Card>
      </div>
      
       <div className="grid gap-6">
        {/* Widget: Volumen Mensual */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Volumen Mensual</CardTitle>
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
