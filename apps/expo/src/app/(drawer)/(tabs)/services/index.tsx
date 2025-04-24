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
    return <LoadingScreen />;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f3f4f6",
        padding: 16,
        paddingTop: 32,
      }}
    >
      <FlashList
        data={data}
        estimatedItemSize={80}
        ItemSeparatorComponent={() => <View style={{ height: 32 }} />}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 16,
              backgroundColor: "white",
              padding: 16,
            }}
          >
            <Image
              src={item.image ?? ""}
              style={{ width: 50, height: 50, borderRadius: 25 }}
            />

            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: "600" }}>
                {item.name}
              </Text>

              <Text style={{ color: "#9ca3af" }}>
                Temp. estimado: {item.duration} min
              </Text>

              <Text style={{ color: "#6b7280" }}>
                {formatPrice(item.price)}
              </Text>
            </View>

            <TouchableOpacity
              style={{ marginLeft: 16, borderRadius: 12, padding: 8 }}
              onPress={() => handleEdit(item.id)}
            >
              <Feather name="edit" size={20} color="#3B82F6" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginLeft: 16, borderRadius: 12, padding: 8 }}
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
