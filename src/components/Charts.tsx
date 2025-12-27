"use client"

import { Pie, PieChart } from "recharts"

import {
    Card,
    CardContent
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A dynamically rendered pie chart with custom label"

// 1. Define the base Chart Configuration
// This is outside the component as it's static structure
const chartConfig = {
    count: {
        label: "Count",
    },
    Entry: {
        label: "Entry",
        color: "var(--chart-1)", // Assuming these colors are defined in your CSS/theme
    },
    Seized: {
        label: "Seized",
        color: "var(--chart-2)",
    },
    // Add other relevant categories if needed, even if they are zero
    Return: {
        label: "Total Return",
        color: "var(--chart-3)",
    },
    // ...
} satisfies ChartConfig

/**
 * Transforms the raw breakdown data into the format required by Recharts.
 * Filters out categories with a count of 0 for a cleaner pie chart.
 */
const transformData = (breakdown: any) => {
    if (!breakdown) return [];

    const rawData = [
        { category: "Entry", count: breakdown.entry, colorKey: "Entry" },
        // Use 'siezed' as per your data object's key
        { category: "Seized", count: breakdown.siezed, colorKey: "Seized" },
        { category: "Return", count: breakdown.totalReturn, colorKey: "Return" },
        { category: "Wine", count: breakdown.totalWine?._sum?.wine, colorKey: "Return" },
        // You can add more categories here if you want them reflected in the chartConfig
    ];

    // Filter out slices with a count of 0 to prevent issues and keep the chart clean
    return rawData
        .filter(item => item.count && item.count > 0)
        .map(item => ({
            ...item,
            // Assign the color from the static chartConfig based on the category name
            //@ts-ignore
            fill: chartConfig[item.colorKey]?.color || "var(--chart-5)",
        }));
};


export function PiChart({ data }: {
    data: any
}) {

    // Safely extract the breakdown object
    const breakdown = data?.breakdown || {};

    // 2. Dynamic Data Transformation
    const chartData = transformData(breakdown);

    const totalEntries = breakdown.totalEntries || 0;

    return (
        <Card className="flex flex-col glass-effect">
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto    max-h-[250px] px-0"
                >
                    <PieChart>
                        {/* Tooltip uses 'category' as the name key */}
                        <ChartTooltip
                            content={<ChartTooltipContent nameKey="category" hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="count" // Key for the slice size
                            labelLine={false}
                            label={({ payload, ...props }) => {
                                return (
                                    <text
                                        className="text-xl  text-blue-100"
                                        cx={props.cx}
                                        cy={props.cy}
                                        x={props.x}
                                        y={props.y}
                                        textAnchor={props.textAnchor}
                                        dominantBaseline={props.dominantBaseline}
                                        fill="#bedbff"
                                    >
                                        {/* Display the count value on the slice */}
                                        {payload.count}
                                    </text>
                                )
                            }}
                            nameKey="category" // Key for the slice name (used by tooltip)
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
