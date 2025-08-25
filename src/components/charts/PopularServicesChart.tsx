'use client';
import { Progress } from '@/components/ui/progress';

interface PopularServicesChartProps {
    data: { name: string; value: number; icon: string }[];
}

export function PopularServicesChart({ data }: PopularServicesChartProps) {
    // Sort data descending by value
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    return (
      <div className="h-full w-full flex flex-col justify-center gap-4 px-2">
        {sortedData.map((service, index) => (
            <div key={index} className="grid grid-cols-6 items-center gap-4 text-sm">
                <div className="col-span-1 text-2xl text-center">{service.icon}</div>
                <div className="col-span-3">
                   <p className="font-bold text-base text-foreground truncate">{service.name}</p>
                   <Progress value={service.value} className="h-2 mt-1" indicatorClassName="bg-gradient-to-r from-primary to-violet-400" />
                </div>
                <div className="col-span-2">
                  <span className="font-semibold tabular-nums w-10 text-right text-muted-foreground">{service.value}%</span>
                </div>
            </div>
        ))}
      </div>
    );
}
