import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="explore" options={{ title: "Imóveis" }} />
      <Tabs.Screen name="visitas" options={{ title: "Visitas" }} />
      <Tabs.Screen name="clientes" options={{ title: "Clientes" }} />
      <Tabs.Screen name="contratos" options={{ title: "Contratos" }} />
    </Tabs>
  );
}
