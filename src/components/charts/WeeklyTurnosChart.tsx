'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';

interface WeeklyTurnosChartProps {
    data: { dia: string; cantidad: number }[];
}

export function WeeklyTurnosChart({ data }: WeeklyTurnosChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis 
                    dataKey="dia" 
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
                    tickFormatter={(value) => `${value}`}
                 />
                <Tooltip 
                    cursor={{ fill: 'hsl(var(--accent))' }}
                    content={<ChartTooltipContent indicator="dot" />}
                 />
                <Bar dataKey="cantidad" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}
