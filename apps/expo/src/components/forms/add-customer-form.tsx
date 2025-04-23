import type { z } from "better-auth";
import React from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { Controller, useForm } from "react-hook-form";

import { createCustomerSchema } from "@acme/validators";

import { api } from "@/utils/api";

type Inputs = z.infer<typeof createCustomerSchema>;

export function AddClientForm() {
  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm<Inputs>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      birthDate: undefined,
      email: "",
      cpf: "",
      address: "",
    },
  });

  const createMutation = api.customer.createCustomer.useMutation({
    async onSuccess() {
      await utils.customer.listCustomers.invalidate();
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
          name="phoneNumber"
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
          name="birthDate"
          render={({ field }) => {
            const [displayValue, setDisplayValue] = React.useState(
              field.value ? format(field.value, "dd/MM/yyyy") : "",
            );

            React.useEffect(() => {
              setDisplayValue(
                field.value ? format(field.value, "dd/MM/yyyy") : "",
              );
            }, [field.value]);

            return (
              <View className="flex flex-col">
                <Text className="text-sm font-medium text-gray-700">
                  Data de Nascimento
                </Text>
                <TextInput
                  className="mt-1 rounded-lg border border-gray-300 bg-gray-50 p-4 focus:border-blue-500"
                  placeholder="DD/MM/AAAA"
                  value={displayValue}
                  onChangeText={(text) => {
                    const rawValue = text.replace(/\D/g, "");
                    let formattedValue = "";

                    // Aplica a máscara
                    if (rawValue.length > 0) {
                      formattedValue = rawValue
                        .slice(0, 8)
                        .replace(/^(\d{2})/, "$1/")
                        .replace(/^(\d{2}\/\d{2})/, "$1/")
                        .slice(0, 10);
                    }

                    setDisplayValue(formattedValue);

                    if (formattedValue.length === 10) {
                      try {
                        const date = parse(
                          formattedValue,
                          "dd/MM/yyyy",
                          new Date(),
                        );
                        if (!isNaN(date.getTime())) {
                          field.onChange(date);
                        }
                      } catch {
                        field.onChange(new Date("invalid"));
                      }
                    }
                  }}
                />
              </View>
            );
          }}
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
