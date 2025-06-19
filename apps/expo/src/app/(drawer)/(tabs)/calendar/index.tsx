import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authClient } from "@/utils/auth";
import { api } from "@/utils/api";
import { useState } from "react";
import {
  format,
  startOfToday,
  endOfToday,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { useRouter } from "expo-router";

export default function AppointmentsScreen() {
  const router = useRouter();

  const [period, setPeriod] = useState<"today" | "week">("today");

  const getDateRange = () => {
    const today = new Date();
    return period === "today"
      ? { start: startOfToday(), end: endOfToday() }
      : { start: startOfWeek(today), end: endOfWeek(today) };
  };

  const { start, end } = getDateRange();

  const {
    data: appointments,
    isLoading,
    error,
  } = api.appointment.listAppointmentsByPeriod.useQuery({
    startDate: start,
    endDate: end,
  });

  const handleCheckIn = (id: string) => {
    console.log("Check-in para:", id);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Cabeçalho */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Agendamentos
            </Text>
            <Text className="text-gray-600">Gerencie os atendimentos</Text>
          </View>
          <TouchableOpacity
            className="bg-red-500 px-3 py-1 rounded-md"
            onPress={handleSignOut}
          >
            <Text className="text-white font-medium">Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtros de período */}
      <View className="flex-row mx-4 my-3 bg-gray-200 rounded-lg p-1">
        <TouchableOpacity
          className={`flex-1 py-2 rounded-lg ${period === "today" ? "bg-white shadow-sm" : ""}`}
          onPress={() => setPeriod("today")}
        >
          <Text
            className={`text-center font-medium ${period === "today" ? "text-blue-600" : "text-gray-600"}`}
          >
            Hoje
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2 rounded-lg ${period === "week" ? "bg-white shadow-sm" : ""}`}
          onPress={() => setPeriod("week")}
        >
          <Text
            className={`text-center font-medium ${period === "week" ? "text-blue-600" : "text-gray-600"}`}
          >
            Esta Semana
          </Text>
        </TouchableOpacity>
      </View>

      {/* Indicador de período */}
      <View className="px-4 py-2">
        <Text className="text-gray-500 text-center">
          {format(start, "dd/MM/yyyy")} - {format(end, "dd/MM/yyyy")}
        </Text>
      </View>

      {/* Lista de agendamentos */}
      <View className="h-full px-4">
        {isLoading ? (
          <View className="flex-1 justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : error ? (
          <Text className="text-red-500 text-center py-4">
            Erro ao carregar agendamentos: {error.message}
          </Text>
        ) : appointments?.length === 0 ? (
          <Text className="text-gray-500 text-center py-4">
            Nenhum agendamento neste período
          </Text>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {appointments?.map((appt) => (
              <View
                key={appt.id}
                className="bg-white rounded-lg p-4 mb-3 border border-gray-200 shadow-sm shadow-black/10"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-gray-500 text-sm">
                      {format(new Date(appt.startTime), "dd/MM/yyyy")} -{" "}
                      {format(new Date(appt.startTime), "HH:mm ")} -{" "}
                      {format(new Date(appt.endTime), "HH:mm")}
                    </Text>
                    <Text className="text-lg font-semibold text-gray-800 mt-1">
                      {appt.customer.name}
                    </Text>
                    <Text className="text-gray-600 mt-1">
                      {appt.service.name}
                    </Text>
                    <Text className="text-gray-600 mt-1">
                      {appt.employee.name}
                    </Text>
                  </View>

                  <View className="flex-row gap-2">
                    {appt.status === "scheduled" && (
                      <TouchableOpacity
                        className="bg-green-500 px-3 py-1 rounded-md"
                        onPress={() => handleCheckIn(appt.id)}
                      >
                        <Text className="text-white font-medium">Check-in</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      className="bg-blue-500 px-3 py-1 rounded-md"
                      onPress={() =>
                        router.push({
                          pathname: "/(drawer)/(tabs)/calendar/[appointmentId]",
                          params: { appointmentId: appt.id },
                        })
                      }
                    >
                      <Text className="text-white font-medium">Detalhes</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
