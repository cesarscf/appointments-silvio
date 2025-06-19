import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { primaryColor } from "@/lib/colors"; // Import primary color

import { EditEmployeeForm } from "@/components/forms/edit-employee-form";
import { EmployeeServiceManager } from "@/components/forms/manager-employee-form";
import { api } from "@/utils/api";

const TABS = [
  "Geral",
  "Serviços",
  // "Indisponibilidades"
];

export default function EmployeeDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = React.useState("Serviços");

  if (!id) throw new Error("Not found!");

  const { data: employee, isPending } = api.employee.getEmployeeById.useQuery(
    { id },
    { enabled: !!id },
  );
  const { data: services } = api.service.listServices.useQuery();

  if (isPending) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={primaryColor} size="small" />
      </View>
    );
  }

  if (!employee) throw new Error("Not found!");

  const renderTabContent = () => {
    switch (activeTab) {
      case "Geral":
        return <EditEmployeeForm employee={employee} />;
      case "Serviços":
        return (
          <EmployeeServiceManager
            services={services ?? []}
            employeeId={employee.id}
            employeeServices={employee.services}
          />
        );
      // case "Indisponibilidades":
      //   return (
      //     <View style={{ padding: 16 }}>
      //       <Text
      //         style={{
      //           fontSize: 18,
      //           fontWeight: "600",
      //           marginBottom: 8,
      //           color: primaryColor,
      //         }}
      //       >
      //         Indisponibilidades
      //       </Text>
      //       <Text style={{ color: primaryColor }}>
      //         {employee?.unavailabilities?.join(", ") ||
      //           "Nenhuma indisponibilidade registrada"}
      //       </Text>
      //     </View>
      //   );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Tab bar */}
      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderColor: "#d1d5db",
          backgroundColor: "white",
        }}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 16,
              borderBottomWidth: activeTab === tab ? 2 : 0,
              borderColor: activeTab === tab ? primaryColor : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: activeTab === tab ? "bold" : "normal",
                color: activeTab === tab ? primaryColor : "#6b7280",
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}
