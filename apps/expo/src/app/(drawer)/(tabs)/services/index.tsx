import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";

import { api } from "@/utils/api";

export default function Services() {
  const { data, isLoading, refetch } = api.service.all.useQuery();
  const deleteClient = api.service.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const handleDelete = (id: string) => {
    Alert.alert(
      "Excluir Cliente",
      "Tem certeza que deseja excluir este cliente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => deleteClient.mutate({ serviceId: id }),
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator className="size-4" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 p-4 pt-8">
      <FlashList
        data={data}
        estimatedItemSize={80}
        ItemSeparatorComponent={() => <View className="h-8" />}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between rounded-2xl bg-white p-4">
            <Image
              src={item.image ?? ""}
              style={{ width: 50, height: 50, borderRadius: 25 }}
            />

            <View className="ml-4 flex-1">
              <Text className="text-xl font-semibold">{item.name}</Text>

              {item.description && (
                <Text className="text-gray-500">{item.description}</Text>
              )}

              <Text className="text-gray-400">
                Temp. estimado: {item.estimatedTime}
              </Text>

              <Text className="text-gray-500">{item.price}</Text>
            </View>

            <TouchableOpacity
              className="ml-4 rounded-xl bg-red-500 p-2"
              onPress={() => handleDelete(item.id)}
            >
              <Feather name="trash" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
