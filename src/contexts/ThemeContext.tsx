import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { palettes, type ColorPalette, type ColorScheme } from "../theme";
import { getStoredScheme, setStoredScheme } from "../utils/themeStorage";

interface ThemeContextValue {
  scheme: ColorScheme;
  colors: ColorPalette;
  toggleScheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const sistemaScheme = useColorScheme();
  const [override, setOverride] = useState<ColorScheme | null>(() => getStoredScheme());

  const scheme: ColorScheme = override ?? (sistemaScheme === "dark" ? "dark" : "light");

  const toggleScheme = () => {
    const novo: ColorScheme = scheme === "dark" ? "light" : "dark";
    setOverride(novo);
    setStoredScheme(novo);
  };

  const value = useMemo(
    () => ({ scheme, colors: palettes[scheme], toggleScheme }),
    [scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme precisa estar dentro de um ThemeProvider");
  return ctx;
}
