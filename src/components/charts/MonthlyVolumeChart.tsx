'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ChartTooltipContent, ChartContainer, type ChartConfig } from '@/components/ui/chart';

interface MonthlyVolumeChartProps {
    data: { mes: string; total: number }[];
}



const chartConfig = {
    total: {
        label: "Turnos",
    },
} satisfies ChartConfig;

export function MonthlyVolumeChart({ data }: MonthlyVolumeChartProps) {
    return (
        <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={20} barSize={60}>
                    <XAxis
                        dataKey="mes"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--accent))' }}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
