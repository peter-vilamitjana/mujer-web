'use client';
import React from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { useOcupacionEnVivo } from '@/hooks/useOcupacionEnVivo';
import type { Firestore } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { format, fromUnixTime } from 'date-fns';

type Props = {
  db: Firestore;
  sucursalId: string;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const time = fromUnixTime(label / 1000);
    return (
      <div className="bg-background/80 backdrop-blur-sm p-2 rounded-lg border border-border/50 text-xs shadow-lg">
        <p className="font-bold">{`${payload[0].value} clientas`}</p>
        <p className="text-muted-foreground">{format(time, 'HH:mm:ss')}</p>
      </div>
    );
  }
  return null;
};


export default function VolumenTiempoReal({ db, sucursalId }: Props) {
  const { ocupacionActual, ocupacionUltimaHora, serie, isLoading, isStale } = useOcupacionEnVivo(db, sucursalId);

  const gradientId = React.useMemo(() => `colorUv-${Math.random().toString(36).substring(2, 9)}`, []);

  if (isLoading) {
    return (
      <div className="w-full h-full p-4 flex flex-col justify-center items-center">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-3/4 mt-4" />
        <Skeleton className="h-6 w-1/2 mt-2" />
      </div>
    );
  }
  
  const displayData = serie.length > 1 ? serie : [{t: Date.now() - 1000, v: 0}, {t: Date.now(), v: ocupacionActual}];

  return (
    <div className="p-4 w-full h-full flex flex-col justify-center items-center">
      <div className="w-full h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={displayData}
            margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip content={<CustomTooltip />} />
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" />
            <Area 
                type="stepAfter" 
                dataKey="v" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                fillOpacity={1} 
                fill={`url(#${gradientId})`}
                dot={false} 
                isAnimationActive={false}
            />
             <XAxis dataKey="t" hide />
             <YAxis domain={[0, 'dataMax + 1']} allowDecimals={false} hide />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-4">
        <div className="text-5xl font-extrabold text-primary" style={{ lineHeight: 1 }}>
          {ocupacionActual}
        </div>
        <div className="text-lg font-semibold text-foreground mt-2">
          {ocupacionActual === 1 ? "clienta en este momento" : "clientas en este momento"}
        </div>
        <div className={cn("text-sm text-muted-foreground mt-1", isStale && "text-amber-500 animate-pulse")}>
          Última hora: {ocupacionUltimaHora} turnos {isStale ? " · actualizando…" : ""}
        </div>
      </div>
    </div>
  );
}
