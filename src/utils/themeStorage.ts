import { Platform } from "react-native";
import type { ColorScheme } from "../theme";

const KEY = "propfy-theme-scheme";

/** Persistência simples da preferência de tema. Só web tem storage duradouro (localStorage); no nativo fica só em memória durante a sessão. */
export function getStoredScheme(): ColorScheme | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  const valor = window.localStorage.getItem(KEY);
  return valor === "light" || valor === "dark" ? valor : null;
}

export function setStoredScheme(scheme: ColorScheme) {
  if (Platform.OS !== "web" || typeof window === "undefined") return;
  window.localStorage.setItem(KEY, scheme);
}
