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
          title: "Agenda",
          headerLeft: () => <DrawerToggleButton />,
        }}
      />
    </Stack>
  );
}
