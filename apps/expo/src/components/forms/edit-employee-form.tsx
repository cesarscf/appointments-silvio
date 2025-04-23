import type { z } from "better-auth";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { applyPhoneMask } from "@acme/utils";
import { UpdateEmployee, updateEmployeeSchema } from "@acme/validators";

import { api } from "@/utils/api";

type Inputs = z.infer<typeof updateEmployeeSchema>;

export function EditEmployeeForm({ employee }: { employee: any }) {
  console.log(employee);
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
      void utils.employee.getEmployeeById.invalidate({
        id: employee.id,
      });
      void utils.establishment.getOnboardingCheck.invalidate();
    },
  });

  // Handle form submission
  const onSubmit = async (data: UpdateEmployee) => {
    console.log(data);

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
    <View className="flex-1 gap-y-4 pb-8">
      <View className="gap-4">
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700">Nome</Text>
              <TextInput
                className="mt-1 rounded-lg border border-gray-300 bg-gray-50 p-4 focus:border-blue-500"
                value={field.value}
                onChangeText={field.onChange}
              />
              {fieldState.error && (
                <Text className="text-xs text-red-500">
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
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700">Email</Text>
              <TextInput
                className="mt-1 rounded-lg border border-gray-300 bg-gray-50 p-4 focus:border-blue-500"
                value={field.value}
                onChangeText={field.onChange}
              />
              {fieldState.error && (
                <Text className="text-xs text-red-500">
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
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700">
                Telefone
              </Text>
              <TextInput
                className="mt-1 rounded-lg border border-gray-300 bg-gray-50 p-4 focus:border-blue-500"
                value={field.value}
                onChangeText={field.onChange}
              />
              {fieldState.error && (
                <Text className="text-xs text-red-500">
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
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700">
                Endereço
              </Text>
              <TextInput
                className="mt-1 rounded-lg border border-gray-300 bg-gray-50 p-4 focus:border-blue-500"
                value={field.value}
                onChangeText={field.onChange}
              />
              {fieldState.error && (
                <Text className="text-xs text-red-500">
                  {fieldState.error.message}
                </Text>
              )}
            </View>
          )}
        />

        <TouchableOpacity
          onPress={pickImage}
          className="rounded-lg border border-gray-300 bg-white p-4"
        >
          <Text className="text-center text-blue-500">Selecionar imagem</Text>
        </TouchableOpacity>

        {/* Preview da imagem (se houver) */}
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
        className="flex flex-row items-center justify-center rounded-lg bg-blue-600 p-4"
      >
        {updateEmployee.isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="font-semibold text-white">Salvar Alterações</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
