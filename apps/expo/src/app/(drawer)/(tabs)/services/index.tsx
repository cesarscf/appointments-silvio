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
import { primaryColor } from "@/lib/colors";

import { LoadingScreen } from "@/components/loading-screen";
import { formatPrice } from "@/utils";
import { api } from "@/utils/api";

export default function Services() {
  const router = useRouter();

  const { data, isLoading, refetch } = api.service.listServices.useQuery();
  const deleteClient = api.service.deleteService.useMutation({
    onSuccess: () => refetch(),
  });

  const handleDelete = (id: string) => {
    Alert.alert(
      "Excluir Serviço",
      "Tem certeza que deseja excluir este serviço?",
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
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-gray-100 p-4 pt-8">
      <FlashList
        data={data}
        estimatedItemSize={80}
        ItemSeparatorComponent={() => <View className="h-8" />}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-10">
            <Feather name="scissors" size={64} color={primaryColor} />
            <Text className="mt-4 text-lg" style={{ color: primaryColor }}>
              Nenhum serviço cadastrado
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Feather name="scissors" size={24} color={primaryColor} />
              </View>
            )}

            <View className="ml-4 flex-1">
              <Text
                className="text-xl font-semibold"
                style={{ color: primaryColor }}
              >
                {item.name}
              </Text>
              <Text className="text-gray-400">
                Temp. estimado: {item.duration} min
              </Text>
              <Text className="text-gray-500">{formatPrice(item.price)}</Text>
            </View>

            <TouchableOpacity
              className="ml-4 rounded-xl p-2"
              onPress={() => handleEdit(item.id)}
            >
              <Feather name="edit" size={20} color={primaryColor} />
            </TouchableOpacity>

            <TouchableOpacity
              className="ml-2 rounded-xl p-2"
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
