import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

import { EditServiceForm } from "@/components/forms/edit-service-form";
import { api } from "@/utils/api";

export default function EditCustomer() {
  const { id } = useLocalSearchParams();

  const { data, isLoading } = api.service.getServiceByIdWithCategories.useQuery(
    {
      id: id as string,
    },
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator style={{ width: 16, height: 16 }} />
      </View>
    );
  }

  if (!data) return null;

  return (
    <ScrollView>
      <View style={{ flex: 1, padding: 24 }}>
        <Text
          style={{
            marginBottom: 16,
            fontSize: 20,
            fontWeight: "bold",
            color: "#1f2937",
          }}
        >
          Editar cliente
        </Text>
        <EditServiceForm service={data} />
      </View>
    </ScrollView>
  );
}
