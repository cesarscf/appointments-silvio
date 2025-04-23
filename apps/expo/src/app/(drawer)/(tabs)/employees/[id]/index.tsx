import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

import { EditEmployeeForm } from "@/components/forms/edit-employee-form";
import { api } from "@/utils/api";

const tabs = ["Geral", "Serviços", "Indisponibilidades"];

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("Geral");

  if (!id) throw new Error("Not found!");

  const { data, isPending } = api.employee.getEmployeeById.useQuery(
    { id },
    { enabled: !!id },
  );

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator className="size-4" />
      </View>
    );
  }

  if (!data) throw new Error("Not found!");

  return (
    <View className="flex-1">
      <View className="flex-row border-b border-gray-300 bg-white">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 items-center py-4 ${activeTab === tab ? "border-b-2 border-blue-500" : ""}`}
          >
            <Text
              className={`text-base ${activeTab === tab ? "font-bold text-blue-500" : "text-gray-500"}`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 p-4">
        {activeTab === "Geral" && <EditEmployeeForm employee={data} />}

        {activeTab === "Serviços" && (
          <View>
            <Text className="text-lg font-semibold">Serviços</Text>
            <Text>
              {data?.services?.join(", ") || "Nenhum serviço cadastrado"}
            </Text>
          </View>
        )}

        {activeTab === "Indisponibilidades" && (
          <View>
            <Text className="text-lg font-semibold">Indisponibilidades</Text>
            <Text>
              {data?.unavailabilities?.join(", ") ||
                "Nenhuma indisponibilidade registrada"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
