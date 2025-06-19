import { primaryColor } from "@/lib/colors";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, headerTintColor: primaryColor }}
      />
    </Stack>
  );
}
