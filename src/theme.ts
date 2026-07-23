import { Platform, type ViewStyle } from "react-native";

/**
 * Design system do Propfy — tokens centralizados de cor, tipografia,
 * espaçamento, raio e sombra. Mantém o visual consistente e evita
 * repetição de valores mágicos pelas telas.
 *
 * As cores variam por tema (claro/escuro) — use o hook `useTheme()`
 * para consumi-las de forma reativa. O restante dos tokens não muda.
 */

export interface ColorPalette {
  bg: string;
  surface: string;
  primary: string;
  primarySoft: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  danger: string;
  dangerBg: string;
  success: string;
  white: string;
  blue: string;
  green: string;
  purple: string;
  orange: string;
}

export type ColorScheme = "light" | "dark";

const light: ColorPalette = {
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
  blue: "#3B82F6",
  green: "#10B981",
  purple: "#8B5CF6",
  orange: "#F59E0B",
};

const dark: ColorPalette = {
  bg: "#0E1016",
  surface: "#171A23",
  primary: "#5B6EF5",
  primarySoft: "#3A3F63",
  textPrimary: "#F2F3F7",
  textSecondary: "#A7ACC0",
  textMuted: "#6B7086",
  border: "#262A38",
  danger: "#F87171",
  dangerBg: "#3B1D1F",
  success: "#34D399",
  white: "#FFFFFF",
  blue: "#60A5FA",
  green: "#34D399",
  purple: "#A78BFA",
  orange: "#FBBF24",
};

export const palettes: Record<ColorScheme, ColorPalette> = { light, dark };

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
    web: { boxShadow: "0 6px 16px rgba(0, 0, 0, 0.16)" } as ViewStyle,
    default: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.16,
      shadowRadius: 14,
      elevation: 3,
    },
  }) as ViewStyle,
  soft: Platform.select<ViewStyle>({
    web: { boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" } as ViewStyle,
    default: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
  }) as ViewStyle,
} as const;
