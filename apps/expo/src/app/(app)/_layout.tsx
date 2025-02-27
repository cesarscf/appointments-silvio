import { Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Redirect, router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { DrawerItem } from "@react-navigation/drawer";

import { authClient } from "@/utils/auth";

export default function AppLayout() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Drawer
      screenOptions={{ headerShown: false }}
      drawerContent={() => <DrawerContent />}
    />
  );
}

export function DrawerContent() {
  return (
    <GestureHandlerRootView style={{ flex: 1, paddingTop: 40 }}>
      <DrawerItem
        label={"Home"}
        onPress={() => {
          router.push("/(app)/(tabs)");
        }}
      />
    </GestureHandlerRootView>
  );
}
