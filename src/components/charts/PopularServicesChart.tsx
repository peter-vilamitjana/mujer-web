'use client';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowDown, ArrowUp } from 'lucide-react';

type ServicioPopular = {
  nombre: string;
  porcentaje: number;
  deltaPct: number;
};

interface PopularServicesChartProps {
    items: ServicioPopular[];
    updatedAt?: Date;
    loading?: boolean;
}

const DeltaIndicator = ({ delta }: { delta: number }) => {
    if (delta === 0) {
      return <span className="text-muted-foreground text-xs font-semibold w-12 text-right">= 0%</span>;
    }
  
    const isPositive = delta > 0;
    const color = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-500';
    const Icon = isPositive ? ArrowUp : ArrowDown;
  
    return (
      <div className={cn("flex items-center justify-end gap-1 font-semibold text-xs w-12", color)}>
        <Icon className="h-3 w-3" />
        <span>{isPositive && '+'}{delta.toFixed(0)}%</span>
      </div>
    );
};

export function PopularServicesChart({ items, updatedAt, loading }: PopularServicesChartProps) {
    if (loading) {
        return (
            <div className="space-y-4 px-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
        )
    }
    
    if (!items || items.length === 0) {
        return <p className="text-center text-muted-foreground text-sm py-8">Sin datos esta semana.</p>;
    }

    const top5Data = [...items].sort((a, b) => b.porcentaje - a.porcentaje).slice(0, 5);

    const getAriaLabel = (item: ServicioPopular) => {
        const deltaDesc = item.deltaPct > 0 
            ? `sube ${item.deltaPct.toFixed(1)} por ciento`
            : item.deltaPct < 0 
            ? `baja ${Math.abs(item.deltaPct).toFixed(1)} por ciento`
            : 'sin cambios';
        return `${item.nombre}, ${item.porcentaje.toFixed(0)} por ciento, ${deltaDesc} respecto a la semana anterior.`;
    }

    return (
      <div className="h-full w-full flex flex-col justify-center gap-2 px-2">
        <div role="list" className="space-y-3">
          {top5Data.map((service) => (
              <div 
                key={service.nombre} 
                role="listitem"
                aria-label={getAriaLabel(service)}
                className="grid grid-cols-[1fr_50px_48px] items-center gap-4 text-sm"
              >
                  <div className="flex flex-col text-left">
                     <p className="font-semibold text-base text-foreground truncate">{service.nombre}</p>
                     <Progress 
                        value={service.porcentaje} 
                        className="h-2 mt-1 rounded-full bg-muted dark:bg-white/10" 
                        indicatorClassName="progress-gradient rounded-full" 
                    />
                  </div>
                  <div className="text-right">
                    <span className="font-bold tabular-nums text-foreground">{Math.round(service.porcentaje)}%</span>
                  </div>
                  <DeltaIndicator delta={service.deltaPct} />
              </div>
          ))}
        </div>
         {updatedAt && 
            <p className="text-xs text-muted-foreground text-center pt-4">
                Rango: mar–sáb · Actualizado {format(updatedAt, 'HH:mm')}
            </p>
        }
      </div>
    );
}
