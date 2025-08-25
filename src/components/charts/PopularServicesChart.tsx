'use client';
import { Progress } from '@/components/ui/progress';

interface PopularServicesChartProps {
    data: { name: string; value: number }[];
}

export function PopularServicesChart({ data }: PopularServicesChartProps) {
    // Sort data descending by value
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    const top5Data = sortedData.slice(0, 5);

    return (
      <div className="h-full w-full flex flex-col justify-center gap-4 px-2">
        {top5Data.map((service, index) => (
            <div key={index} className="grid grid-cols-6 items-center gap-4 text-sm">
                <div className="col-span-3">
                   <p className="font-bold text-base text-foreground truncate">{service.name}</p>
                   <Progress value={service.value} className="h-2 mt-1 rounded-full bg-muted" indicatorClassName="bg-gradient-to-r from-primary to-violet-400 rounded-full" />
                </div>
                <div className="col-span-2 text-right">
                  <span className="font-semibold tabular-nums text-muted-foreground">{service.value}%</span>
                </div>
            </div>
        ))}
      </div>
    );
}
