import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { format } from "date-fns";
import { primaryColor } from "@/lib/colors"; // Importe a cor primária

import { api } from "@/utils/api";

export default function Customers() {
  const router = useRouter();
  const { data, isLoading, refetch } = api.customer.listCustomers.useQuery();

  const deleteClient = api.customer.deleteCustomer.useMutation({
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
      pathname: "/(drawer)/(tabs)/customers/[id]",
      params: { id },
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={primaryColor} size="small" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlashList
        data={data}
        estimatedItemSize={100}
        ItemSeparatorComponent={() => <View className="h-px bg-gray-200" />}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between p-6">
            <View className="flex-1">
              <Text
                className="text-base font-medium"
                style={{ color: primaryColor }}
              >
                {item.name}
              </Text>
              {item.phoneNumber && (
                <Text className="text-sm text-gray-500">
                  📞 {item.phoneNumber}
                </Text>
              )}
              {item.birthDate && (
                <Text className="text-sm text-gray-400">
                  🎂 {format(new Date(item.birthDate), "dd/MM/yyyy")}
                </Text>
              )}
              {item.email && (
                <Text className="text-sm text-gray-500">✉️ {item.email}</Text>
              )}
              {item.address && (
                <Text className="text-sm text-gray-500">📍 {item.address}</Text>
              )}
              {item.cpf && (
                <Text className="text-sm text-gray-500">
                  🆔 CPF: {item.cpf}
                </Text>
              )}
            </View>

            <View className="ml-2 flex-col items-center gap-4">
              <TouchableOpacity onPress={() => handleEdit(item.id)}>
                <Feather name="edit" size={20} color={primaryColor} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Feather name="trash" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
