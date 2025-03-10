import { Alert, Pressable, Text, TouchableOpacity, View } from "react-native";
import { Link, Stack, useNavigation } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { format } from "date-fns";

import { api } from "@/utils/api";

export default function Clients() {
  const navigation = useNavigation();

  const { data, isLoading, refetch } = api.clientR.all.useQuery();
  const deleteClient = api.clientR.delete.useMutation({
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
          onPress: () => deleteClient.mutate({ clientId: id }),
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg font-semibold">Carregando...</Text>
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
            <View>
              <Text className="text-xl font-semibold">{item.name}</Text>

              {item.phone && (
                <Text className="text-gray-500">📞 {item.phone}</Text>
              )}

              {item.birthDate && (
                <Text className="text-gray-400">
                  🎂 Nasc: {format(new Date(item.birthDate), "dd/MM/yyyy")}
                </Text>
              )}

              {item.email && (
                <Text className="text-gray-500">✉️ {item.email}</Text>
              )}

              {item.address && (
                <Text className="text-gray-500">📍 {item.address}</Text>
              )}

              {item.cpf && (
                <Text className="text-gray-500">🆔 CPF: {item.cpf}</Text>
              )}
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
