// src/app/metrics.tsx
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { useState } from "react";
import { useMetrics } from "@/hooks/use-metrics";
import { formatPrice } from "@/utils";

// Função para traduzir os tipos de pagamento
const getPaymentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    credit: "Cartão de Crédito",
    debit: "Cartão de Débito",
    pix: "PIX",
    cash: "Dinheiro",
    transfer: "Transferência Bancária",
    other: "Outro",
  };
  return labels[type.toLowerCase()] || type;
};

export default function MetricsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const {
    totalRevenue,
    monthlyRevenue,
    revenueByPaymentType,
    revenueByService,
    revenueByEmployee,
    refreshAll,
  } = useMetrics();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAll();
    } finally {
      setRefreshing(false);
    }
  };

  if (
    totalRevenue.isLoading ||
    monthlyRevenue.isLoading ||
    revenueByPaymentType.isLoading ||
    revenueByService.isLoading ||
    revenueByEmployee.isLoading
  ) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text className="text-2xl font-bold mb-6">Métricas Financeiras</Text>

        {/* Faturamento Total */}
        <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <Text className="text-lg font-semibold mb-2">Faturamento Total</Text>
          <Text className="text-2xl text-green-600">
            {formatPrice(totalRevenue.data || 0)}
          </Text>
        </View>

        {/* Faturamento Mensal */}
        <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <Text className="text-lg font-semibold mb-2">
            Faturamento deste Mês
          </Text>
          <Text className="text-2xl text-[#001240]">
            {formatPrice(monthlyRevenue.data || 0)}
          </Text>
        </View>

        {/* Faturamento por Forma de Pagamento */}
        <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <Text className="text-lg font-semibold mb-2">
            Faturamento por Forma de Pagamento
          </Text>
          {revenueByPaymentType.data &&
            Object.entries(revenueByPaymentType.data)
              .sort((a, b) => b[1] - a[1]) // Ordena do maior para o menor
              .map(([type, amount]) => (
                <View
                  key={type}
                  className="flex-row justify-between py-2 border-b border-gray-100"
                >
                  <Text>{getPaymentTypeLabel(type)}</Text>
                  <Text>{formatPrice(amount)}</Text>
                </View>
              ))}
        </View>

        {/* Faturamento por Serviço (Top 5) */}
        <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <Text className="text-lg font-semibold mb-2">
            Serviços Mais Rentáveis (Top 5)
          </Text>
          {revenueByService.data &&
            Object.entries(revenueByService.data).map(([service, amount]) => (
              <View
                key={service}
                className="flex-row justify-between py-2 border-b border-gray-100"
              >
                <Text className="capitalize">{service.toLowerCase()}</Text>
                <Text>{formatPrice(amount)}</Text>
              </View>
            ))}
        </View>

        {/* Faturamento por Funcionário (Top 3) */}
        <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <Text className="text-lg font-semibold mb-2">
            Profissionais Mais Rentáveis (Top 3)
          </Text>
          {revenueByEmployee.data &&
            Object.entries(revenueByEmployee.data).map(([employee, amount]) => (
              <View
                key={employee}
                className="flex-row justify-between py-2 border-b border-gray-100"
              >
                <Text>{employee}</Text>
                <Text>{formatPrice(amount)}</Text>
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
