import "@bacons/text-decoder/install";

import { Slot, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";

import { TRPCProvider } from "@/utils/api";

import "../styles.css";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <TRPCProvider>

      <Slot
        screenOptions={{
          contentStyle: {
            backgroundColor: colorScheme == "dark" ? "#0a0a0b" : "#FFFFFF",
          },
        }}
      />

      <StatusBar />
    </TRPCProvider>
  );
}
