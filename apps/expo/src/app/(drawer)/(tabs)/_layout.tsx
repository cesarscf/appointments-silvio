import { Tabs } from "expo-router";
import { DrawerToggleButton } from "@react-navigation/drawer";

export default function AppLayout() {
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
      <Tabs.Screen
        name="clients"
        options={{
          tabBarLabel: "Clientes",
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          tabBarLabel: "Serviços",
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarLabel: "Agenda",
        }}
      />
      <Tabs.Screen
        name="employees"
        options={{
          tabBarLabel: "Funcionários",
        }}
      />
    </Tabs>
  );
}
