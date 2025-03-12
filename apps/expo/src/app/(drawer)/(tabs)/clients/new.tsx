import React from "react";
import { Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";

import AddClientForm from "@/components/forms/add-client-form";

export default function NewClient() {
  const [selectedLanguage, setSelectedLanguage] = React.useState();

  return (
    <View className="flex-1 p-6">
      <Text className="mb-4 text-xl font-bold text-gray-800">
        Adicione um novo cliente
      </Text>
      <AddClientForm />
    </View>
  );
}
