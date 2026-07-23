import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, font, radius, spacing } from "../theme";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  titulo: string;
  subtitulo?: string;
  acaoLabel?: string;
  onAcao?: () => void;
}

export function EmptyState({ icon, titulo, subtitulo, acaoLabel, onAcao }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={32} color={colors.textMuted} />
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
      {acaoLabel && onAcao ? (
        <TouchableOpacity style={styles.botao} onPress={onAcao} activeOpacity={0.85}>
          <Ionicons name="add" size={18} color={colors.white} />
          <Text style={styles.botaoTexto}>{acaoLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  titulo: { fontFamily: font.semibold, fontSize: 16, color: colors.textPrimary, textAlign: "center" },
  subtitulo: {
    fontFamily: font.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    maxWidth: 300,
  },
  botao: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  botaoTexto: { color: colors.white, fontSize: 14, fontFamily: font.semibold },
});
