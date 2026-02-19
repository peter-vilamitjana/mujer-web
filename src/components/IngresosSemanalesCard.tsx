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

interface IngresosSemanalesCardProps {
  total: number;
  tendencia?: number;
}

export default function IngresosSemanalesCard({ total, tendencia = 0 }: IngresosSemanalesCardProps) {
  const getDeltaBadge = () => {
    if (tendencia === 0) {
      return (
        <Badge variant="secondary" className="text-xs font-bold">
          = 0% vs semana anterior
        </Badge>
      );
    }
    const isPositive = tendencia > 0;
    const colorClass = isPositive ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    const Icon = isPositive ? ArrowUp : ArrowDown;

    return (
      <Badge className={`gap-1 ${colorClass}`}>
        <Icon className="h-3 w-3" />
        {isPositive && '+'}{tendencia.toFixed(1)}% vs semana anterior
      </Badge>
    );
  };

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
            {formatCurrency(total)}
          </div>
          <div className="mt-1">
            {getDeltaBadge()}
          </div>
        </div>

        <div className="h-24 my-4 flex items-center justify-center text-muted-foreground text-xs opacity-50 border border-dashed rounded-md bg-muted/20">
          <span className="italic">Detalle de ingresos próximamente</span>
        </div>
      </CardContent>
    </Card>
  )
}
