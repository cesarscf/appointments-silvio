import { useState } from "react";
import {
  ActivityIndicator,
  Button,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";

import { api } from "@/utils/api";

interface Service {
  id: string;
  name: string;
}

interface EmployeeServiceManagerProps {
  employeeId: string;
  employeeServices: {
    id: string;
    name: string;
    price: string;
    commission: string;
  }[];
  services: Service[];
}

export function EmployeeServiceManager({
  employeeId,
  services,
  employeeServices,
}: EmployeeServiceManagerProps) {
  // State management
  const [selectedService, setSelectedService] = useState<string>("");
  const [newCommission, setNewCommission] = useState("");
  const [editCommission, setEditCommission] = useState("");
  const [editingService, setEditingService] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceMenuVisible, setServiceMenuVisible] = useState(false);

  // API utilities
  const apiUtils = api.useUtils();

  // Mutations
  const deleteMutation = api.employee.deleteEmployeeService.useMutation({
    onSuccess: () => {
      void apiUtils.employee.getEmployeeById.invalidate();
      Toast.success("Serviço removido com sucesso.");
    },
    onError() {
      Toast.error("Erro ao remover o serviço. Tente novamente.");
    },
  });

  const createMutation = api.employee.addServiceToEmployee.useMutation({
    onSuccess: () => {
      Toast.success("Serviço atribuído com sucesso.");
      setSelectedService("");
      setNewCommission("");
      void apiUtils.employee.getEmployeeById.invalidate();
    },
    onError() {
      Toast.error(
        "Erro ao atribuir serviço. Verifique os dados e tente novamente.",
      );
    },
  });

  const updateMutation = api.employee.updateEmployeeCommission.useMutation({
    onSuccess: () => {
      Toast.success("Comissão atualizada com sucesso.");
      setEditingService(null);
      setEditCommission("");
      setModalVisible(false);
      void apiUtils.employee.getEmployeeById.invalidate();
    },
    onError() {
      Toast.error("Erro ao atualizar comissão. Por favor, tente novamente.");
    },
  });

  // Handlers
  const handleAddService = () => {
    if (!selectedService) return;
    createMutation.mutate({
      employeeId,
      serviceId: selectedService,
      commission: newCommission || "0.00",
    });
  };

  const handleUpdateCommission = () => {
    if (!editingService || !editCommission) return;
    updateMutation.mutate({
      employeeId,
      serviceId: editingService,
      commission: editCommission,
    });
  };

  const handleDeleteService = (serviceId: string) => {
    deleteMutation.mutate({
      employeeId,
      serviceId,
    });
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {/* New Service Section */}
      <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 20 }}>
        Novo Serviço
      </Text>

      {/* Service Selection */}
      <TouchableOpacity
        style={{
          marginTop: 4,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#d1d5db",
          backgroundColor: "#f9fafb",
          padding: 16,
        }}
        onPress={() => setServiceMenuVisible(!serviceMenuVisible)}
      >
        <Text>
          {selectedService
            ? services.find((s) => s.id === selectedService)?.name
            : "Selecionar serviço"}
        </Text>
      </TouchableOpacity>

      {serviceMenuVisible && (
        <View
          style={{
            marginTop: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#d1d5db",
            backgroundColor: "#f3f4f6",
            padding: 8,
          }}
        >
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              onPress={() => {
                setSelectedService(service.id);
                setServiceMenuVisible(false);
              }}
            >
              <Text style={{ paddingHorizontal: 4, paddingVertical: 8 }}>
                {service.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Commission Input */}
      <TextInput
        placeholder="Comissão (%)"
        value={newCommission}
        onChangeText={setNewCommission}
        keyboardType="decimal-pad"
        style={{
          marginTop: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#d1d5db",
          backgroundColor: "#f9fafb",
          padding: 16,
        }}
      />

      {/* Save Button */}
      <TouchableOpacity
        style={{
          marginTop: 8,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          backgroundColor: "#2563eb",
          padding: 16,
        }}
        onPress={handleAddService}
        disabled={!selectedService}
      >
        {updateMutation.isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ fontWeight: "600", color: "white" }}>
            Salvar Alterações
          </Text>
        )}
      </TouchableOpacity>

      {/* Assigned Services Section */}
      <Text style={{ marginTop: 24, fontSize: 20, fontWeight: "600" }}>
        Serviços Atribuídos
      </Text>

      {employeeServices.length === 0 ? (
        <Text style={{ marginTop: 12, textAlign: "center", color: "#6b7280" }}>
          Nenhum serviço atribuído
        </Text>
      ) : (
        employeeServices.map((service) => (
          <View
            key={service.id}
            style={{
              borderBottomWidth: 1,
              borderColor: "#e5e7eb",
              paddingVertical: 12,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>{service.name}</Text>
            <Text>{parseFloat(service.commission || "0").toFixed(2)}%</Text>
            <View style={{ marginTop: 8, flexDirection: "row", gap: 12 }}>
              <Button
                title="Editar"
                onPress={() => {
                  setEditCommission(service.commission);
                  setEditingService(service.id);
                  setModalVisible(true);
                }}
              />
              <Button
                title="Remover"
                onPress={() => handleDeleteService(service.id)}
                color="red"
              />
            </View>
          </View>
        ))
      )}

      {/* Edit Commission Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: 16,
          }}
        >
          <View
            style={{
              borderRadius: 12,
              backgroundColor: "white",
              padding: 24,
            }}
          >
            <Text
              style={{ marginBottom: 12, fontSize: 18, fontWeight: "bold" }}
            >
              Editar Comissão
            </Text>
            <TextInput
              placeholder="Nova Comissão (%)"
              value={editCommission}
              onChangeText={setEditCommission}
              keyboardType="decimal-pad"
              style={{
                marginTop: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#d1d5db",
                backgroundColor: "#f9fafb",
                padding: 16,
              }}
            />
            <View
              style={{
                marginTop: 16,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Button
                title="Cancelar"
                onPress={() => {
                  setModalVisible(false);
                  setEditingService(null);
                  setEditCommission("");
                }}
              />
              <Button title="Salvar" onPress={handleUpdateCommission} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
