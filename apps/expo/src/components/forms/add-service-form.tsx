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

import { createServiceSchema } from "@acme/validators";

import { api } from "@/utils/api";

type Inputs = z.infer<typeof createServiceSchema>;

export function AddServiceForm() {
  const router = useRouter();
  const utils = api.useUtils();

  const {
    data: categories,
    isLoading,
    refetch,
  } = api.category.listCategories.useQuery();

  const form = useForm<Inputs>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      duration: 30,
      image: "",
      price: "",
      categoryIds: [],
    },
  });

  const createMutation = api.service.createService.useMutation({
    async onSuccess() {
      await utils.service.listServices.invalidate();
      router.back();
    },
  });

  function onSubmit(inputs: Inputs) {
    createMutation.mutate(inputs);
  }

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
    <View className="flex-1 gap-y-4">
      <View className="gap-4">
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700">
                Nome do serviço
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

      {categories && categories.length > 0 && (
        <Controller
          control={form.control}
          name="categoryIds"
          render={({ field: { value, onChange } }) => {
            const toggleCategory = (id: string) => {
              const newValue = value?.includes(id)
                ? value.filter((item: string) => item !== id)
                : [...value!, id];
              onChange(newValue);
            };

            return (
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{ marginBottom: 8, fontWeight: "bold", fontSize: 16 }}
                >
                  Categorias
                </Text>
                {categories &&
                  categories.map((category) => {
                    const isSelected = value?.includes(category.id);
                    return (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => toggleCategory(category.id)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingVertical: 8,
                        }}
                      >
                        <Ionicons
                          name={isSelected ? "checkbox" : "square-outline"}
                          size={24}
                          color={isSelected ? "#007bff" : "#999"}
                          style={{ marginRight: 8 }}
                        />
                        <Text>{category.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            );
          }}
        />
      )}

      <Controller
        control={form.control}
        name="duration"
        render={({ field, fieldState }) => (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700">
              Duração (minutos)
            </Text>
            <TextInput
              className="mt-1 rounded-lg border border-gray-300 bg-gray-50 p-4 focus:border-blue-500"
              value={String(field.value)}
              onChangeText={(text) => field.onChange(Number(text))}
              keyboardType="numeric"
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
        name="price"
        render={({ field, fieldState }) => (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700">Preço</Text>
            <View className="mt-1 flex-row items-center rounded-lg border border-gray-300 bg-gray-50 p-4">
              <Text className="mr-2 text-gray-700">R$</Text>
              <TextInput
                className="flex-1"
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="numeric"
                placeholder="0,00"
              />
            </View>
            {fieldState.error && (
              <Text className="text-xs text-red-500">
                {fieldState.error.message}
              </Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity
        onPress={form.handleSubmit(onSubmit)}
        disabled={createMutation.isPending}
        className="mt-4 flex flex-row items-center justify-center rounded-lg bg-blue-600 p-4"
      >
        {createMutation.isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="font-semibold text-white">Cadastrar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
