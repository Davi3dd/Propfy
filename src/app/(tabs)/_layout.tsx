import { Ionicons } from "@expo/vector-icons";
import { TabList, TabSlot, Tabs, TabTrigger, type TabTriggerSlotProps } from "expo-router/ui";
import { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { font, radius, spacing, type ColorPalette } from "../../theme";

const DESKTOP_BREAKPOINT = 900;
const SIDEBAR_WIDTH = 240;
const BOTTOM_BAR_HEIGHT = 60;

type RotaTab = {
  name: string;
  href: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconAtivo: keyof typeof Ionicons.glyphMap;
};

const ROTAS: RotaTab[] = [
  { name: "index", href: "/", label: "Dashboard", icon: "grid-outline", iconAtivo: "grid" },
  { name: "explore", href: "/explore", label: "Imóveis", icon: "home-outline", iconAtivo: "home" },
  { name: "visitas", href: "/visitas", label: "Visitas", icon: "calendar-outline", iconAtivo: "calendar" },
  { name: "clientes", href: "/clientes", label: "Clientes", icon: "people-outline", iconAtivo: "people" },
  { name: "contratos", href: "/contratos", label: "Contratos", icon: "document-text-outline", iconAtivo: "document-text" },
];

interface ItemProps extends TabTriggerSlotProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconAtivo: keyof typeof Ionicons.glyphMap;
  label: string;
}

function SidebarItem({ icon, iconAtivo, label, isFocused, ...props }: ItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable {...props} style={StyleSheet.flatten([styles.sideItem, isFocused && styles.sideItemAtivo])}>
      <Ionicons
        name={isFocused ? iconAtivo : icon}
        size={19}
        color={isFocused ? colors.white : colors.textSecondary}
      />
      <Text style={[styles.sideLabel, isFocused && styles.sideLabelAtiva]}>{label}</Text>
    </Pressable>
  );
}

function BottomItem({ icon, iconAtivo, label, isFocused, ...props }: ItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable {...props} style={styles.bottomItem}>
      <Ionicons name={isFocused ? iconAtivo : icon} size={22} color={isFocused ? colors.primary : colors.textMuted} />
      <Text style={[styles.bottomLabel, isFocused && styles.bottomLabelAtiva]}>{label}</Text>
    </Pressable>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = Platform.OS === "web" && width >= DESKTOP_BREAKPOINT;

  if (isDesktop) {
    return (
      <Tabs style={{ flex: 1 }}>
        <TabList asChild>
          <View style={StyleSheet.flatten([styles.sidebar, { paddingTop: insets.top + spacing.xl }])}>
            <View style={styles.brand}>
              <View style={styles.logoChip}>
                <Ionicons name="business" size={18} color={colors.white} />
              </View>
              <Text style={styles.brandTexto}>Propfy</Text>
            </View>
            {ROTAS.map((rota) => (
              <TabTrigger key={rota.name} name={rota.name} href={rota.href as never} asChild>
                <SidebarItem icon={rota.icon} iconAtivo={rota.iconAtivo} label={rota.label} />
              </TabTrigger>
            ))}
          </View>
        </TabList>
        <TabSlot style={{ flex: 1, marginLeft: SIDEBAR_WIDTH }} />
      </Tabs>
    );
  }

  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1, marginBottom: BOTTOM_BAR_HEIGHT + insets.bottom }} />
      <TabList asChild>
        <View
          style={StyleSheet.flatten([
            styles.bottomBar,
            { height: BOTTOM_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom + 8 },
          ])}
        >
          {ROTAS.map((rota) => (
            <TabTrigger key={rota.name} name={rota.name} href={rota.href as never} asChild>
              <BottomItem icon={rota.icon} iconAtivo={rota.iconAtivo} label={rota.label} />
            </TabTrigger>
          ))}
        </View>
      </TabList>
    </Tabs>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    sidebar: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      width: SIDEBAR_WIDTH,
      flexDirection: "column",
      backgroundColor: colors.surface,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      paddingHorizontal: spacing.md,
      gap: 4,
    },
    brand: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.sm, marginBottom: spacing.xl },
    logoChip: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
    brandTexto: { fontFamily: font.bold, fontSize: 18, color: colors.textPrimary },
    sideItem: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: 11, paddingHorizontal: spacing.md, borderRadius: radius.md },
    sideItemAtivo: { backgroundColor: colors.primary },
    sideLabel: { fontFamily: font.semibold, fontSize: 14, color: colors.textSecondary },
    sideLabelAtiva: { color: colors.white },
    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 8,
    },
    bottomItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
    bottomLabel: { fontFamily: font.semibold, fontSize: 11, color: colors.textMuted },
    bottomLabelAtiva: { color: colors.primary },
  });
