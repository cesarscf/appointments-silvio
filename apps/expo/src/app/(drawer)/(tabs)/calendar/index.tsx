import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";

import { api } from "@/utils/api";

export default function Index() {
  const { data, isPending } = api.appointment.all.useQuery();

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator className="size-4" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <FlashList
        data={data}
        estimatedItemSize={80}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <View className="mb-4 rounded-lg rounded-md border border-zinc-200 bg-white p-4">
            <Text className="text-xl font-semibold text-black">
              Cliente: {item.client.name}
            </Text>
            <Text className="text-base text-gray-600">
              Data: {item.date.toString()}
            </Text>
            <Text className="text-base text-gray-600">
              Status: {item.status}
            </Text>
            <Text className="text-base text-gray-600">
              Check-in: {item.checkIn ? "Sim" : "Não"}
            </Text>
            <Text className="text-base text-gray-600">
              Serviço: {item.service.name}
            </Text>
            <Text className="text-base text-gray-600">
              Funcionário: {item.employee.name}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
