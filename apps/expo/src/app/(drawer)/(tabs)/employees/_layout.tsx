import { Stack } from "expo-router";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { primaryColor } from "@/lib/colors";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Profissionais",
          headerLeft: () => <DrawerToggleButton tintColor="#001240" />,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Detalhes",
          headerTintColor: primaryColor,
        }}
      />
    </Stack>
  );
}
