import { ActivityIndicator, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { AddClientForm } from "@/components/forms/add-customer-form";
import { EditCustomerForm } from "@/components/forms/edit-customer-form";
import { api } from "@/utils/api";

export default function EditCustomer() {
  const { id } = useLocalSearchParams();

  const { data, isLoading } = api.service.getServiceById.useQuery({
    id: id as string,
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator className="size-4" />
      </View>
    );
  }

  if (!data) return null;

  return (
    <View className="flex-1 p-6">
      <Text className="mb-4 text-xl font-bold text-gray-800">
        Editar cliente
      </Text>
      {/* <EditCustomerForm customer={data} /> */}
    </View>
  );
}
