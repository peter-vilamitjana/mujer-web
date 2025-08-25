'use client';
import { Progress } from '@/components/ui/progress';

interface PopularServicesChartProps {
    data: { name: string; value: number; fill: string }[];
}

export function PopularServicesChart({ data }: PopularServicesChartProps) {
    // Sort data descending by value
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    return (
      <div className="h-full w-full flex flex-col justify-center gap-4 px-2">
        {sortedData.map((service, index) => (
            <div key={index} className="grid grid-cols-5 items-center gap-4 text-sm">
                <p className="col-span-2 truncate text-muted-foreground">{service.name}</p>
                <div className="col-span-3 flex items-center gap-2">
                    <Progress value={service.value} className="h-3" indicatorClassName="bg-primary" />
                    <span className="font-semibold tabular-nums w-10 text-right">{service.value}%</span>
                </div>
            </div>
        ))}
      </div>
    );
}
