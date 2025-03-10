import { Tabs } from "expo-router";

export default function AppLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="clients"
        options={{
          tabBarLabel: "Clientes",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          tabBarLabel: "Serviços",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarLabel: "Agenda",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="employees"
        options={{
          tabBarLabel: "Funcionários",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
