import { Button, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Redirect, router, Stack, Tabs } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { AntDesign, Feather } from "@expo/vector-icons";
import { DrawerToggleButton } from "@react-navigation/drawer";

import { authClient } from "@/utils/auth";

export default function AppLayout() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Text>Loading...</Text>;
  }

  if (session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerLeft: () => <DrawerToggleButton />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
        }}
      />
    </Tabs>
  );
}
