import { Platform, type TextStyle, type ViewStyle } from "react-native";

/**
 * Design system do Propfy — tokens centralizados de cor, tipografia,
 * espaçamento, raio e sombra. Mantém o visual consistente e evita
 * repetição de valores mágicos pelas telas.
 */

export const colors = {
  bg: "#F6F7FB",
  surface: "#FFFFFF",
  primary: "#1A1A2E",
  primarySoft: "#2A2A45",
  textPrimary: "#1A1A2E",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#EEF0F5",
  danger: "#E5484D",
  dangerBg: "#FEECEC",
  success: "#12B76A",
  white: "#FFFFFF",
  // Cores por categoria / seção
  blue: "#3B82F6",
  green: "#10B981",
  purple: "#8B5CF6",
  orange: "#F59E0B",
} as const;

export const font = {
  regular: "Poppins_400Regular",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Sombra suave e multiplataforma (iOS / Android / Web). */
export const shadow = {
  card: Platform.select<ViewStyle>({
    web: { boxShadow: "0 6px 16px rgba(26, 26, 46, 0.06)" } as ViewStyle,
    default: {
      shadowColor: "#1A1A2E",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 14,
      elevation: 3,
    },
  }) as ViewStyle,
  soft: Platform.select<ViewStyle>({
    web: { boxShadow: "0 2px 8px rgba(26, 26, 46, 0.05)" } as ViewStyle,
    default: {
      shadowColor: "#1A1A2E",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
  }) as ViewStyle,
} as const;

/** Escala tipográfica pronta com a família Poppins aplicada. */
export const typography: Record<string, TextStyle> = {
  h1: { fontFamily: font.bold, fontSize: 30, color: colors.textPrimary },
  h2: { fontFamily: font.bold, fontSize: 24, color: colors.textPrimary },
  title: { fontFamily: font.semibold, fontSize: 17, color: colors.textPrimary },
  body: { fontFamily: font.regular, fontSize: 14, color: colors.textSecondary },
  label: { fontFamily: font.semibold, fontSize: 13, color: colors.textSecondary },
  caption: { fontFamily: font.regular, fontSize: 12, color: colors.textMuted },
};
