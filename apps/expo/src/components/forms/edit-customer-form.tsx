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

import { applyPhoneMask } from "@acme/utils";
import { updateCustomerSchema } from "@acme/validators";

import { api } from "@/utils/api";

type Inputs = z.infer<typeof updateCustomerSchema>;

export function EditCustomerForm({
  customer,
}: {
  customer: {
    id: string;
    email: string | null;
    name: string;
    establishmentId: string;
    address: string | null;
    birthDate: Date;
    phoneNumber: string;
    cpf: string | null;
  };
}) {
  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm<Inputs>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      id: customer.id,
      name: customer.name,
      phoneNumber: applyPhoneMask(customer.phoneNumber),
      birthDate: new Date(customer.birthDate),
      email: customer.email ?? "",
      cpf: customer.cpf ?? "",
      address: customer.address ?? "",
    },
  });

  const updateMutation = api.customer.updateCustomer.useMutation({
    async onSuccess() {
      await utils.customer.listCustomers.invalidate();
      router.back();
    },
  });

  function onSubmit(inputs: Inputs) {
    console.log("qweqwe");

    updateMutation.mutate({
      name: inputs.name,
      birthDate: inputs.birthDate,
      address: inputs.address,
      phoneNumber: inputs.phoneNumber ?? "",
      cpf: inputs.cpf ?? "",
      email: inputs.email,
      id: customer.id,
    });
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
                onChangeText={(text) => field.onChange(applyPhoneMask(text))}
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
          render={({ field, fieldState }) => (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700">Email</Text>
              <TextInput
                className="mt-1 rounded-lg border border-gray-300 bg-gray-50 p-4 focus:border-blue-500"
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="email-address"
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
          name="cpf"
          render={({ field, fieldState }) => (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700">CPF</Text>
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
        <Controller
          control={form.control}
          name="birthDate"
          render={({ field, fieldState }) => {
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
                {fieldState.error && (
                  <Text className="text-xs text-red-500">
                    {fieldState.error.message}
                  </Text>
                )}
              </View>
            );
          }}
        />
      </View>

      <TouchableOpacity
        onPress={form.handleSubmit(onSubmit)}
        disabled={updateMutation.isPending}
        className="mt-4 flex flex-row items-center justify-center rounded-lg bg-blue-600 p-4"
      >
        {updateMutation.isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="font-semibold text-white">Cadastrar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
