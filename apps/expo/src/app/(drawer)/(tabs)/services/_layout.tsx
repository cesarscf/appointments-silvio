import { Pressable } from "react-native";
import { Link, Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { primaryColor } from "@/lib/colors";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Serviços",
          headerLeft: () => <DrawerToggleButton tintColor="#001240" />,
          headerRight: () => (
            <Link href="/(drawer)/(tabs)/services/new" asChild>
              <Pressable>
                <Feather name="plus" size={24} color="#001240" />
              </Pressable>
            </Link>
          ),
        }}
      />
      <Stack.Screen
        name="new"
        options={{ title: "Adicionar serviço", headerTintColor: primaryColor }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: "Editar serviço", headerTintColor: primaryColor }}
      />
    </Stack>
  );
}
