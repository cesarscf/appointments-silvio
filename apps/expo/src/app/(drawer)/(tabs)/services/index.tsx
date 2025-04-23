import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";

import { api } from "@/utils/api";

export default function Services() {
  const router = useRouter();

  const { data, isLoading, refetch } = api.service.listServices.useQuery();
  const deleteClient = api.service.deleteService.useMutation({
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
          onPress: () => deleteClient.mutate({ id }),
        },
      ],
    );
  };

  const handleEdit = (id: string) => {
    router.push({
      pathname: "/(drawer)/(tabs)/services/[id]",
      params: { id },
    });
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

              <Text className="text-gray-400">
                Temp. estimado: {item.duration}
              </Text>

              <Text className="text-gray-500">{item.price}</Text>
            </View>

            <TouchableOpacity
              className="ml-4 rounded-xl p-2"
              onPress={() => handleEdit(item.id)}
            >
              <Feather name="edit" size={20} color="#3B82F6" />
            </TouchableOpacity>

            <TouchableOpacity
              className="ml-4 rounded-xl p-2"
              onPress={() => handleDelete(item.id)}
            >
              <Feather name="trash" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
