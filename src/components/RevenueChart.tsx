import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface RevenueChartProps {
  data: { month: string; omsattning: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="month"
          stroke="var(--color-text-muted)"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: "var(--color-border)" }}
        />
        <YAxis
          stroke="var(--color-text-muted)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
        />
        <Tooltip
          cursor={{ fill: "var(--color-surface-elevated)" }}
          contentStyle={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border-strong)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--color-text-primary)",
          }}
          formatter={(value: any) => {
            if (typeof value !== "number") return "";
            return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" }).format(value);
          }}
        />
        <Bar dataKey="omsattning" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}