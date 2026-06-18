import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="explore" options={{ title: "Imóveis" }} />
      <Tabs.Screen name="visitas" options={{ title: "Visitas" }} />
    </Tabs>
  );
}
