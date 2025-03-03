import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, Stack, useRouter } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

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

    console.log(success);

    if (error) {
      setError(error.message ?? "Credentiasl ivalidade");
      return;
    }

    router.push("/(drawer)/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <Stack.Screen options={{ title: "Login" }} />
      <View className="w-full p-10">
        <Text className="mb-4 text-xl font-bold">Login</Text>

        <View className="mx-auto w-full">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="mb-2 w-full rounded border p-3"
                placeholder="Email"
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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="mb-2 w-full rounded border p-3"
                placeholder="Senha"
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

          <Text className="mt-1 text-sm text-red-500">{error}</Text>

          <TouchableOpacity
            className={`mt-4 w-full rounded bg-blue-500 p-3 ${isSubmitting ? "opacity-50" : ""}`}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text className="text-center font-bold text-white">
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
