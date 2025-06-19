"use client";

import { DollarSign, TrendingUp, Users, Calendar, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

const chartConfig = {
  revenue: {
    label: "Faturamento",
    color: "#8b5cf6", // Purple
  },
  pix: {
    label: "PIX",
    color: "#06b6d4", // Cyan
  },
  card: {
    label: "Cartão",
    color: "#f59e0b", // Amber
  },
  cash: {
    label: "Dinheiro",
    color: "#10b981", // Emerald
  },
  package: {
    label: "Pacote",
    color: "#ec4899", // Pink
  },
  other: {
    label: "Outros",
    color: "#ef4444", // Red
  },
};

const COLORS = [
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#ef4444", // Red
  "#ec4899", // Pink
  "#6366f1", // Indigo
  "#84cc16", // Lime
];

const SERVICE_COLORS = [
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
];

function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-3 w-40" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton({ height = "300px" }: { height?: string }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Carregando dados...</p>
      </div>
    </div>
  );
}

export function DashboardMetrics() {
  const { data: totalRevenue, isLoading: loadingTotal } =
    api.metrics.totalRevenue.useQuery();
  const { data: monthlyRevenue, isLoading: loadingMonthly } =
    api.metrics.monthlyRevenue.useQuery();
  const { data: revenueByPaymentType, isLoading: loadingPaymentType } =
    api.metrics.revenueByPaymentType.useQuery();
  const { data: revenueByService, isLoading: loadingService } =
    api.metrics.revenueByService.useQuery();
  const { data: revenueByEmployee, isLoading: loadingEmployee } =
    api.metrics.revenueByEmployee.useQuery();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Preparar dados para os gráficos
  const paymentTypeData = revenueByPaymentType
    ? Object.entries(revenueByPaymentType).map(([name, value], index) => ({
        name:
          name === "pix"
            ? "PIX"
            : name === "card"
              ? "Cartão"
              : name === "cash"
                ? "Dinheiro"
                : name === "package"
                  ? "Pacote"
                  : "Outros",
        value,
        fill: COLORS[index % COLORS.length],
        percentage: Math.round(
          (value /
            Object.values(revenueByPaymentType).reduce((a, b) => a + b, 0)) *
            100,
        ),
      }))
    : [];

  const serviceData = revenueByService
    ? Object.entries(revenueByService).map(([name, value], index) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        fullName: name,
        value,
        fill: SERVICE_COLORS[index % SERVICE_COLORS.length],
      }))
    : [];

  const employeeData = revenueByEmployee
    ? Object.entries(revenueByEmployee).map(([name, value], index) => ({
        name: name.length > 12 ? name.substring(0, 12) + "..." : name,
        fullName: name,
        value,
        fill: `hsl(${(index * 60) % 360}, 70%, 50%)`,
      }))
    : [];

  // Dados para gráfico radial dos funcionários
  const employeeRadialData = employeeData.map((item, index) => ({
    ...item,
    fill: `hsl(${(index * 120) % 360}, 65%, 55%)`,
  }));

  return (
    <>
      {/* Cards de métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loadingTotal ? (
          <MetricCardSkeleton />
        ) : (
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Faturamento Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Todos os agendamentos concluídos
              </p>
            </CardContent>
          </Card>
        )}

        {loadingMonthly ? (
          <MetricCardSkeleton />
        ) : (
          <Card className="border-l-4 border-l-cyan-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Faturamento Mensal
              </CardTitle>
              <Calendar className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">
                {formatCurrency(monthlyRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Mês atual</p>
            </CardContent>
          </Card>
        )}

        {loadingService ? (
          <MetricCardSkeleton />
        ) : (
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Serviço</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {serviceData[0]?.fullName || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {serviceData[0]
                  ? formatCurrency(serviceData[0].value)
                  : "Sem dados"}
              </p>
            </CardContent>
          </Card>
        )}

        {loadingEmployee ? (
          <MetricCardSkeleton />
        ) : (
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Top Funcionário
              </CardTitle>
              <Users className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {employeeData[0]?.fullName || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {employeeData[0]
                  ? formatCurrency(employeeData[0].value)
                  : "Sem dados"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
              Faturamento por Forma de Pagamento
            </CardTitle>
            <CardDescription>
              Distribuição do faturamento por método de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPaymentType ? (
              <ChartSkeleton />
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0]?.payload;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    {data.name}
                                  </span>
                                  <span className="font-bold text-muted-foreground">
                                    {formatCurrency(data.value)}
                                  </span>
                                  <span className="text-[0.70rem] text-muted-foreground">
                                    {data.percentage}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              Top 5 Serviços
            </CardTitle>
            <CardDescription>Serviços com maior faturamento</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingService ? (
              <ChartSkeleton />
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={serviceData}>
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = serviceData.find(
                            (item) => item.name === label,
                          );
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <div className="grid grid-cols-1 gap-2">
                                <span className="text-sm font-medium">
                                  {data?.fullName}
                                </span>
                                <span className="font-bold text-[#001240]">
                                  {formatCurrency(payload[0]?.value as number)}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              Top 3 Profissionais
            </CardTitle>
            <CardDescription>
              Profissionais com maior faturamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingEmployee ? (
              <ChartSkeleton />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="20%"
                      outerRadius="90%"
                      data={employeeRadialData}
                    >
                      <RadialBar
                        // minAngle={}
                        label={{
                          position: "insideStart",
                          fill: "#fff",
                          fontSize: 12,
                        }}
                        background
                        // clockWise
                        dataKey="value"
                      />
                      <Legend
                        iconSize={10}
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ fontSize: "12px" }}
                      />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0]?.payload;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-md">
                                <div className="grid grid-cols-1 gap-2">
                                  <span className="text-sm font-medium">
                                    {data.fullName}
                                  </span>
                                  <span
                                    className="font-bold"
                                    style={{ color: data.fill }}
                                  >
                                    {formatCurrency(data.value)}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={employeeData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: "#10b981", strokeWidth: 2 }}
                      />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = employeeData.find(
                              (item) => item.name === label,
                            );
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-md">
                                <div className="grid grid-cols-1 gap-2">
                                  <span className="text-sm font-medium">
                                    {data?.fullName}
                                  </span>
                                  <span className="font-bold text-emerald-600">
                                    {formatCurrency(
                                      payload[0]?.value as number,
                                    )}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
