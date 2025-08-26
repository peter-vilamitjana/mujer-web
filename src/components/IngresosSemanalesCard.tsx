'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

// Mock data simulating what the hook would return
const mockData = {
  ingresosSemana: 1250000,
  deltaPct: 12.2,
  serie5Pts: [
    { dia: 'Mar', total: 180000 },
    { dia: 'Mié', total: 220000 },
    { dia: 'Jue', total: 250000 },
    { dia: 'Vie', total: 310000 },
    { dia: 'Sáb', total: 290000 },
  ],
  desglose: {
    efectivo: 600000,
    mp: 450000,
    transferencia: 200000,
  },
  updatedAt: new Date(),
  loading: false,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm p-2 rounded-lg border border-border/50 text-xs shadow-lg">
        <p className="font-bold">{`${label}: ${formatCurrency(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

export default function IngresosSemanalesCard() {
  // In a real implementation, this would come from a hook:
  // const { data, loading } = useIngresosSemanales(sucursalId);
  const { ingresosSemana, deltaPct, serie5Pts, desglose, updatedAt, loading } = mockData;

  const getDeltaBadge = () => {
    if (deltaPct === 0) {
      return (
        <Badge variant="secondary" className="text-xs font-bold">
          = 0% vs semana anterior
        </Badge>
      );
    }
    const isPositive = deltaPct > 0;
    const colorClass = isPositive ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    const Icon = isPositive ? ArrowUp : ArrowDown;

    return (
      <Badge className={`gap-1 ${colorClass}`}>
        <Icon className="h-3 w-3" />
        {isPositive && '+'}{deltaPct.toFixed(1)}% vs semana anterior
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-muted-foreground">Ingresos Semanales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-muted-foreground">
          Ingresos Semanales
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div>
            <div className="text-4xl font-bold" aria-live="polite">
                {formatCurrency(ingresosSemana)}
            </div>
            <div className="mt-1">
                {getDeltaBadge()}
            </div>
        </div>

        <div className="h-16 my-4 -mx-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={serie5Pts} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorIngresos)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className='space-y-2'>
            <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="font-mono py-1">Efectivo {formatCurrency(desglose.efectivo)}</Badge>
                <Badge variant="outline" className="font-mono py-1">MP {formatCurrency(desglose.mp)}</Badge>
                <Badge variant="outline" className="font-mono py-1">Transf. {formatCurrency(desglose.transferencia)}</Badge>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
                Rango: mar–sáb · Actualizado {format(updatedAt, 'HH:mm')}
            </p>
        </div>

      </CardContent>
    </Card>
  )
}
