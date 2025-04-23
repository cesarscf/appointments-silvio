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
  const [selectedService, setSelectedService] = useState<string>("");
  const [newCommission, setNewCommission] = useState("");
  const [editCommission, setEditCommission] = useState("");
  const [editingService, setEditingService] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceMenuVisible, setServiceMenuVisible] = useState(false);

  const apiUtils = api.useUtils();

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
    <ScrollView className="flex-1 p-4">
      <Text className="mb-5 text-xl font-semibold">Novo Serviço</Text>

      <TouchableOpacity
        className="mt-1 rounded-lg border border-gray-300 bg-gray-50 p-4"
        onPress={() => setServiceMenuVisible(!serviceMenuVisible)}
      >
        <Text>
          {selectedService
            ? services.find((s) => s.id === selectedService)?.name
            : "Selecionar serviço"}
        </Text>
      </TouchableOpacity>

      {serviceMenuVisible && (
        <View className="mt-2 rounded-lg border border-gray-300 bg-gray-100 p-2">
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              onPress={() => {
                setSelectedService(service.id);
                setServiceMenuVisible(false);
              }}
            >
              <Text className="px-1 py-2">{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TextInput
        placeholder="Comissão (%)"
        value={newCommission}
        onChangeText={setNewCommission}
        keyboardType="decimal-pad"
        className="mt-2 rounded-lg border border-gray-300 bg-gray-50 p-4"
      />

      <TouchableOpacity
        className="mt-2 items-center justify-center rounded-lg bg-blue-600 p-4"
        onPress={handleAddService}
        disabled={!selectedService}
      >
        {updateMutation.isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="font-semibold text-white">Salvar Alterações</Text>
        )}
      </TouchableOpacity>

      <Text className="mt-6 text-xl font-semibold">Serviços Atribuídos</Text>

      {employeeServices.length === 0 ? (
        <Text className="mt-3 text-center text-gray-500">
          Nenhum serviço atribuído
        </Text>
      ) : (
        employeeServices.map((service) => (
          <View key={service.id} className="border-b border-gray-200 py-3">
            <Text className="font-bold">{service.name}</Text>
            <Text>{parseFloat(service.commission || "0").toFixed(2)}%</Text>
            <View className="mt-2 flex-row gap-3">
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

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-center bg-black/50 p-4">
          <View className="rounded-xl bg-white p-6">
            <Text className="mb-3 text-lg font-bold">Editar Comissão</Text>
            <TextInput
              placeholder="Nova Comissão (%)"
              value={editCommission}
              onChangeText={setEditCommission}
              keyboardType="decimal-pad"
              className="mt-2 rounded-lg border border-gray-300 bg-gray-50 p-4"
            />
            <View className="mt-4 flex-row justify-between">
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
