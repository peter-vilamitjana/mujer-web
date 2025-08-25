'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent, ChartContainer, type ChartConfig } from '@/components/ui/chart';

interface PopularServicesChartProps {
    data: { name: string; value: number; fill: string }[];
}

const chartConfig = {
    value: {
        label: "Servicios",
    },
} satisfies ChartConfig;

export function PopularServicesChart({ data }: PopularServicesChartProps) {
    // Calculate total to convert values to percentages
    const totalValue = data.reduce((acc, entry) => acc + entry.value, 0);
    const chartData = data.map(entry => ({
      ...entry,
      percentage: Math.round((entry.value / totalValue) * 100),
    }));

    return (
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
                <XAxis type="number" hide />
                <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    width={80}
                />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--accent))' }}
                    content={<ChartTooltipContent hideLabel indicator="dot" />}
                 />
                <Bar
                    dataKey="percentage"
                    layout="vertical"
                    radius={[4, 4, 4, 4]}
                    barSize={12}
                    label={{ 
                        position: 'right', 
                        offset: 5,
                        fill: 'hsl(var(--foreground))',
                        fontSize: 12,
                        formatter: (value: number) => `${value}%`
                    }}
                >
                    {chartData.map((entry) => (
                      <cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
       </ChartContainer>
    )
}
