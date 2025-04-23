import "@bacons/text-decoder/install";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import ToastManager from "toastify-react-native";

import { TRPCProvider } from "@/utils/api";

import "../styles.css";

import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  const SCREEN_OPTIONS = {
    animation: "ios_from_right",
    contentStyle: {
      backgroundColor: colorScheme == "dark" ? "#0a0a0b" : "#FFFFFF",
    },
  } as const;

  const DRAWER_OPTIONS = {
    headerShown: false,
  } as const;

  return (
    <TRPCProvider>
      <StatusBar />

      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={SCREEN_OPTIONS}>
          <Stack.Screen name="(drawer)" options={DRAWER_OPTIONS} />
          <Stack.Screen name="sign-in" />
        </Stack>
        <ToastManager />
      </GestureHandlerRootView>
    </TRPCProvider>
  );
}
