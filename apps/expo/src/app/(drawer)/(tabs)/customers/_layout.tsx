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
          title: "Clientes",
          headerLeft: () => <DrawerToggleButton tintColor={primaryColor} />,
          headerRight: () => (
            <Link href="/(drawer)/(tabs)/customers/new" asChild>
              <Pressable>
                <Feather name="plus" size={24} color={primaryColor} />
              </Pressable>
            </Link>
          ),
          headerTintColor: primaryColor,
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: "Adicionar cliente",
          headerTintColor: primaryColor,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Editar cliente",
          headerTintColor: primaryColor,
        }}
      />
    </Stack>
  );
}
