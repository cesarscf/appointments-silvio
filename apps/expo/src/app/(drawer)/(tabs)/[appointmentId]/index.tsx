import { LoadingScreen } from "@/components/loading-screen";
import { api } from "@/utils/api";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { applyPhoneMask } from "@acme/utils";
import { formatPrice } from "@/utils";

export default function AppointmentDetails() {
  const { appointmentId } = useLocalSearchParams();
  const utils = api.useUtils();

  const { data, isLoading } = api.appointment.byId.useQuery({
    id: appointmentId as string,
  });

  //   const { mutate: checkIn } = api.appointment.checkIn.useMutation({
  //     onSuccess: () => {
  //       utils.appointment.invalidate();
  //     },
  //   });

  const handleCheckIn = () => {
    // checkIn({ id: appointmentId as string });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!data) return null;

  const statusStyles = {
    scheduled: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-800",
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      {/* Cabeçalho */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">
          Detalhes do Agendamento
        </Text>
        <Text className="text-gray-600 capitalize">
          {format(new Date(data.startTime), "EEEE, dd 'de' MMMM 'de' yyyy", {
            locale: ptBR,
          })}
        </Text>
      </View>

      {/* Card de informações */}
      <View className="bg-white rounded-lg shadow-sm p-5 mb-4">
        {/* Horário */}
        <View className="mb-5">
          <Text className="text-gray-600 font-medium mb-1">Horário</Text>
          <Text className="text-lg text-gray-900">
            {format(new Date(data.startTime), "HH:mm")} -{" "}
            {format(new Date(data.endTime), "HH:mm")}
          </Text>
        </View>

        {/* Cliente */}
        <View className="mb-5">
          <Text className="text-gray-600 font-medium mb-1">Cliente</Text>
          <Text className="text-lg text-gray-900">{data.customer.name}</Text>
          <Text className="text-gray-500 mt-1">
            {applyPhoneMask(data.customer.phoneNumber)}
          </Text>
        </View>

        {/* Serviço */}
        <View className="mb-5">
          <Text className="text-gray-600 font-medium mb-1">Serviço</Text>
          <Text className="text-lg text-gray-900">{data.service.name}</Text>
          <Text className="text-emerald-600 font-bold mt-1">
            {formatPrice(data.service.price)}
          </Text>
        </View>

        {/* Profissional */}
        <View className="mb-5">
          <Text className="text-gray-600 font-medium mb-1">Profissional</Text>
          <Text className="text-lg text-gray-900">{data.employee.name}</Text>
        </View>

        {/* Status */}
        <View className="mb-5">
          <Text className="text-gray-600 font-medium mb-1">Status</Text>
          <View
            className={`px-3 py-1 rounded-md ${statusStyles[data.status]} self-start`}
          >
            <Text>
              {data.status === "completed"
                ? "Concluído"
                : data.status === "canceled"
                  ? "Cancelado"
                  : "Agendado"}
            </Text>
          </View>
          {data.checkin && (
            <Text className="text-gray-500 text-sm mt-2">
              Check-in realizado às {format(new Date(data.checkinAt!), "HH:mm")}
            </Text>
          )}
        </View>

        {/* Botão de Check-in */}
        {!data.checkin && data.status === "scheduled" && (
          <TouchableOpacity
            className="bg-blue-500 py-3 rounded-lg mt-2"
            onPress={handleCheckIn}
          >
            <Text className="text-white font-bold text-center">
              Realizar Check-in
            </Text>
          </TouchableOpacity>
        )}

        {/* Observações */}
        {data.paymentNote && (
          <View className="mt-4">
            <Text className="text-gray-600 font-medium mb-1">Observações</Text>
            <Text className="text-gray-900">{data.paymentNote}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
