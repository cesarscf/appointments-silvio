import { Pressable } from "react-native";
import { Link, Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { DrawerToggleButton } from "@react-navigation/drawer";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Serviços",
          headerLeft: () => <DrawerToggleButton />,
          headerRight: () => (
            <Link href="/(drawer)/(tabs)/services/new" asChild>
              <Pressable>
                <Feather name="plus" size={24} color="blue" />
              </Pressable>
            </Link>
          ),
        }}
      />
      <Stack.Screen name="new" options={{ title: "Adicionar serviço" }} />
      <Stack.Screen name="[id]" options={{ title: "Edit serviço" }} />
    </Stack>
  );
}
