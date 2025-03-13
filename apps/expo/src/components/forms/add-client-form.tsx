import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { z } from "better-auth";
import { Controller, useForm } from "react-hook-form";

import { createClientSchema } from "@acme/validators";

import { api } from "@/utils/api";

type Inputs = z.infer<typeof createClientSchema>;

export function AddClientForm() {
  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm<Inputs>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: "",
      phone: "",
      birthday: new Date(),
      email: "",
      cpf: "",
      address: "",
    },
  });

  const createMutation = api.clientR.create.useMutation({
    async onSuccess() {
      await utils.clientR.all.invalidate();
      router.back();
    },
  });

  function onSubmit(inputs: Inputs) {
    createMutation.mutate(inputs);
  }

  return (
    <View className="flex-1 justify-between">
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
                keyboardType="phone-pad"
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
          render={({ field }) => (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700">Email</Text>
              <TextInput
                className="mt-1 rounded-lg border border-gray-300 bg-gray-50 p-4 focus:border-blue-500"
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="email-address"
              />
            </View>
          )}
        />
        <Controller
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700">CPF</Text>
              <TextInput
                className="mt-1 rounded-lg border border-gray-300 bg-gray-50 p-4 focus:border-blue-500"
                value={field.value}
                onChangeText={field.onChange}
              />
            </View>
          )}
        />
        <Controller
          control={form.control}
          name="address"
          render={({ field }) => (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700">
                Endereço
              </Text>
              <TextInput
                className="mt-1 rounded-lg border border-gray-300 bg-gray-50 p-4 focus:border-blue-500"
                value={field.value}
                onChangeText={field.onChange}
              />
            </View>
          )}
        />
        <Controller
          control={form.control}
          name="birthday"
          render={({ field }) => (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700">
                Data de Nascimento
              </Text>
              <DateTimePicker
                value={field.value}
                mode="date"
                display="default"
                locale="pt-BR"
                onChange={(_, selectedDate) => {
                  if (selectedDate) field.onChange(selectedDate);
                }}
                style={{
                  marginTop: 8,
                  padding: 10,
                  borderRadius: 8,
                  borderColor: "#ccc",
                  borderWidth: 1,
                  backgroundColor: "#f8f8f8",
                }}
              />
            </View>
          )}
        />
      </View>

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
