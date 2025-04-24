import { ScrollView, Text, View } from "react-native";

import { AddServiceForm } from "@/components/forms/add-service-form";

export default function NewService() {
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
          Adicionar serviço
        </Text>
        <AddServiceForm />
      </View>
    </ScrollView>
  );
}
