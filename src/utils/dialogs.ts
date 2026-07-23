import { Alert, Platform } from "react-native";

/**
 * Confirmação multiplataforma. No mobile usa Alert.alert (com botões);
 * no web usa window.confirm — porque o Alert.alert do react-native-web
 * ignora os botões e nunca chama o onPress.
 */
export function confirmar(
  titulo: string,
  mensagem: string,
  onConfirmar: () => void,
  rotuloConfirmar = "Confirmar",
) {
  if (Platform.OS === "web") {
    const ok = window.confirm(`${titulo}\n\n${mensagem}`);
    if (ok) onConfirmar();
    return;
  }
  Alert.alert(titulo, mensagem, [
    { text: "Cancelar", style: "cancel" },
    { text: rotuloConfirmar, style: "destructive", onPress: onConfirmar },
  ]);
}

/** Aviso simples multiplataforma. */
export function avisar(titulo: string, mensagem: string) {
  if (Platform.OS === "web") {
    window.alert(`${titulo}\n\n${mensagem}`);
    return;
  }
  Alert.alert(titulo, mensagem);
}
