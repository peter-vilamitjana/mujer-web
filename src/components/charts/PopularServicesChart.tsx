'use client';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';

interface PopularServicesChartProps {
    data: { name: string; value: number; fill: string }[];
}

export function PopularServicesChart({ data }: PopularServicesChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Tooltip
                    cursor={{ fill: 'hsl(var(--accent))' }}
                    content={<ChartTooltipContent hideLabel />}
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
                <Legend
                    verticalAlign="bottom"
                    height={48}
                    content={({ payload }) => (
                        <ul className="flex justify-center items-center gap-4 mt-4">
                            {payload?.map((entry, index) => (
                                <li key={`item-${index}`} className="flex items-center gap-2 text-sm">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-muted-foreground">{entry.value}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}
