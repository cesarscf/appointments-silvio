import type { z } from "zod";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { loginSchema } from "@acme/validators";

import { authClient } from "@/utils/auth";

type Inputs = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const [error, setError] = React.useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: Inputs) => {
    setError("");

    const { error, data: success } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError(error.message ?? "Credenciais inválidas");
      return;
    }

    router.push("/(drawer)/(tabs)");
  };

  const handleCreateAccount = () => {
    router.push("/sign-up");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 justify-center">
      <Stack.Screen options={{ title: "Login" }} />
      <View className="h-full justify-center p-6">
        <View className="w-full max-w-md mx-auto">
          <View className="mb-8 items-center">
            <Text className="text-3xl font-bold text-[#001240]">Bem-vindo</Text>
            <Text className="text-gray-500">Faça login para continuar</Text>
          </View>

          {error && (
            <View className="mb-4 rounded-lg bg-red-100 p-3">
              <Text className="text-center text-red-600">{error}</Text>
            </View>
          )}

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Email
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="w-full rounded-lg border border-gray-300 bg-white p-4 text-gray-700"
                  placeholder="seu@email.com"
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            {errors.email && (
              <Text className="mt-1 text-sm text-red-500">
                {errors.email.message?.toString()}
              </Text>
            )}
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Senha
            </Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="w-full rounded-lg border border-gray-300 bg-white p-4 text-gray-700"
                  placeholder="••••••••"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.password && (
              <Text className="mt-1 text-sm text-red-500">
                {errors.password.message?.toString()}
              </Text>
            )}
          </View>

          <TouchableOpacity
            className={`w-full rounded-lg bg-[#001240] p-4 ${isSubmitting ? "opacity-70" : ""}`}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text className="text-center font-bold text-white">
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Text>
          </TouchableOpacity>

          <View className="my-6 flex-row items-center">
            <View className="flex-1 border-t border-gray-300" />
            <Text className="px-3 text-gray-500">ou</Text>
            <View className="flex-1 border-t border-gray-300" />
          </View>

          <TouchableOpacity
            className="w-full rounded-lg border border-[#001240] bg-white p-4"
            onPress={handleCreateAccount}
          >
            <Text className="text-center font-bold text-[#001240]">
              Criar conta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
