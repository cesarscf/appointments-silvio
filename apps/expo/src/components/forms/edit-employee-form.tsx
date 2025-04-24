import type { z } from "better-auth";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { applyPhoneMask } from "@acme/utils";
import { UpdateEmployee, updateEmployeeSchema } from "@acme/validators";

import { api } from "@/utils/api";

type Inputs = z.infer<typeof updateEmployeeSchema>;

export function EditEmployeeForm({ employee }: { employee: any }) {
  const form = useForm<UpdateEmployee>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      email: employee.email ?? "",
      name: employee.name,
      phone: applyPhoneMask(employee.phone) ?? "",
      address: employee.address ?? "",
      active: employee.active,
      image: employee.image ?? "",
    },
  });

  const utils = api.useUtils();
  const updateEmployee = api.employee.updateEmployee.useMutation({
    onSuccess: () => {
      void utils.employee.getEmployeeById.invalidate({ id: employee.id });
      void utils.establishment.getOnboardingCheck.invalidate();
    },
  });

  const onSubmit = async (data: UpdateEmployee) => {
    try {
      await updateEmployee.mutateAsync({
        id: employee.id,
        address: data.address ?? "",
        email: data.email ?? "",
        name: data.name ?? "",
        phone: data.phone ?? "",
        active: data.active,
        image: data.image ?? "",
      });
    } catch (error) {
      console.error("Failed to update employee:", error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const base64 = result.assets[0]!.base64;
      if (base64) {
        form.setValue("image", `data:image/jpeg;base64,${base64}`);
      }
    }
  };

  return (
    <View style={{ flex: 1, gap: 16, paddingBottom: 32 }}>
      {/* Form Fields */}
      <View style={{ gap: 16 }}>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}
              >
                Nome
              </Text>
              <TextInput
                style={{
                  marginTop: 4,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  backgroundColor: "#f9fafb",
                  padding: 16,
                }}
                value={field.value}
                onChangeText={field.onChange}
              />
              {fieldState.error && (
                <Text style={{ fontSize: 12, color: "#ef4444" }}>
                  {fieldState.error.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}
              >
                Email
              </Text>
              <TextInput
                style={{
                  marginTop: 4,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  backgroundColor: "#f9fafb",
                  padding: 16,
                }}
                value={field.value}
                onChangeText={field.onChange}
              />
              {fieldState.error && (
                <Text style={{ fontSize: 12, color: "#ef4444" }}>
                  {fieldState.error.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}
              >
                Telefone
              </Text>
              <TextInput
                style={{
                  marginTop: 4,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  backgroundColor: "#f9fafb",
                  padding: 16,
                }}
                value={field.value}
                onChangeText={field.onChange}
              />
              {fieldState.error && (
                <Text style={{ fontSize: 12, color: "#ef4444" }}>
                  {fieldState.error.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={form.control}
          name="address"
          render={({ field, fieldState }) => (
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}
              >
                Endereço
              </Text>
              <TextInput
                style={{
                  marginTop: 4,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  backgroundColor: "#f9fafb",
                  padding: 16,
                }}
                value={field.value}
                onChangeText={field.onChange}
              />
              {fieldState.error && (
                <Text style={{ fontSize: 12, color: "#ef4444" }}>
                  {fieldState.error.message}
                </Text>
              )}
            </View>
          )}
        />

        {/* Image Picker */}
        <TouchableOpacity
          onPress={pickImage}
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#d1d5db",
            backgroundColor: "white",
            padding: 16,
          }}
        >
          <Text style={{ textAlign: "center", color: "#3b82f6" }}>
            Selecionar imagem
          </Text>
        </TouchableOpacity>

        {form.watch("image") !== "" && (
          <Image
            source={{ uri: form.watch("image") }}
            style={{
              width: "100%",
              height: 200,
              borderRadius: 12,
              marginTop: 8,
            }}
            resizeMode="cover"
          />
        )}
      </View>

      <TouchableOpacity
        onPress={form.handleSubmit(onSubmit)}
        disabled={updateEmployee.isPending}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          backgroundColor: "#2563eb",
          padding: 16,
        }}
      >
        {updateEmployee.isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ fontWeight: "600", color: "white" }}>
            Salvar Alterações
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
