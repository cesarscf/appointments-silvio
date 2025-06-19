import { ScrollView, Text, View } from "react-native";
import { primaryColor } from "@/lib/colors"; // Import the primary color

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
            color: primaryColor,
          }}
        >
          Adicionar serviço
        </Text>
        <AddServiceForm />
      </View>
    </ScrollView>
  );
}
