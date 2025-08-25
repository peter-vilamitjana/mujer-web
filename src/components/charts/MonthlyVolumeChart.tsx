'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';

interface MonthlyVolumeChartProps {
    data: { mes: string; total: number }[];
}

const chartData = [
    { name: 'Mes Anterior', total: 180 },
    { name: 'Mes Actual', total: 205 },
];


export function MonthlyVolumeChart({ data }: any) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={100} barSize={60}>
                 <XAxis 
                    dataKey="name"
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
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    <Bar dataKey="total" fill="hsl(var(--primary))" />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
