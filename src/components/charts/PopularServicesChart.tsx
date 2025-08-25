'use client';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { ChartTooltipContent, ChartContainer, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';

interface PopularServicesChartProps {
    data: { name: string; value: number; fill: string }[];
}

const chartConfig = {
    value: {
        label: "Servicios",
    },
    alisado: {
        label: "Alisado",
    },
    mechas: {
        label: "Mechas",
    },
    color: {
        label: "Color",
    },
    otros: {
        label: "Otros",
    },
} satisfies ChartConfig;

export function PopularServicesChart({ data }: PopularServicesChartProps) {
    return (
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Tooltip
                    cursor={{ fill: 'hsl(var(--accent))' }}
                    content={<ChartTooltipContent hideLabel nameKey="name" />}
                />
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    strokeWidth={2}
                    stroke="hsl(var(--background))"
                >
                   {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    verticalAlign="bottom"
                    height={48}
                />
            </PieChart>
        </ResponsiveContainer>
       </ChartContainer>
    )
}
