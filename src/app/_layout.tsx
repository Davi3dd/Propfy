import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Stack, useRouter, useSegments, type Href } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { ToastProvider } from "../components/Toast";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

function Splash() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

function RootNavigation() {
  const { user, initializing } = useAuth();
  const { colors } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;

    const dentroDoAppProtegido = segments[0] === "(tabs)";

    if (!user && dentroDoAppProtegido) {
      router.replace("/login");
    } else if (user && !dentroDoAppProtegido) {
      router.replace("/" as Href);
    }
  }, [user, initializing, segments]);

  if (initializing) return <Splash />;

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}

function AppContent() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) return <Splash />;

  return (
    <AuthProvider>
      <ToastProvider>
        <RootNavigation />
      </ToastProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
