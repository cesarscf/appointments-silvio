import { Text, View } from "react-native";

import { AddClientForm } from "@/components/forms/add-client-form";

export default function NewClient() {
  return (
    <View className="flex-1 p-6">
      <Text className="mb-4 text-xl font-bold text-gray-800">
        Adicione um novo cliente
      </Text>
      <AddClientForm />
    </View>
  );
}
