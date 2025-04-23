import { ScrollView, Text, View } from "react-native";

import { AddServiceForm } from "@/components/forms/add-service-form";

export default function NewService() {
  return (
    <ScrollView>
      <View className="flex-1 p-6">
        <Text className="mb-4 text-xl font-bold text-gray-800">
          Adicionar serviço
        </Text>
        <AddServiceForm />
      </View>
    </ScrollView>
  );
}
