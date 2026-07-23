import { Ionicons } from "@expo/vector-icons";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, font, radius, shadow, spacing } from "../theme";

type ToastType = "success" | "error";
interface ToastState {
  message: string;
  type: ToastType;
}

const ToastContext = createContext<(message: string, type?: ToastType) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ message, type });
      opacity.setValue(0);
      translateY.setValue(20);
      const useNative = Platform.OS !== "web";
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: useNative }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: useNative }),
      ]).start();
      timer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: useNative }),
          Animated.timing(translateY, { toValue: 20, duration: 200, useNativeDriver: useNative }),
        ]).start(() => setToast(null));
      }, 2500);
    },
    [opacity, translateY],
  );

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[styles.wrap, { bottom: insets.bottom + 76, opacity, transform: [{ translateY }] }]}
        >
          <View style={styles.toast}>
            <Ionicons
              name={toast.type === "success" ? "checkmark-circle" : "alert-circle"}
              size={18}
              color={toast.type === "success" ? colors.success : colors.danger}
            />
            <Text style={styles.text}>{toast.message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    maxWidth: "88%",
    ...shadow.card,
  },
  text: { color: colors.white, fontSize: 14, fontFamily: font.semibold },
});
