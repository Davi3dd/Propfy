import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { font, radius, shadow, spacing, type ColorPalette } from "../theme";
import { SearchBar } from "./SearchBar";

export interface SelectOption {
  label: string;
  subtitulo?: string;
}

interface Props {
  placeholder: string;
  value: string;
  onChange: (label: string) => void;
  options: SelectOption[];
  vazioTexto?: string;
}

export function SelectField({ placeholder, value, onChange, options, vazioTexto }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, busca]);

  const fechar = () => {
    setAberto(false);
    setBusca("");
  };

  return (
    <>
      <Pressable style={styles.campo} onPress={() => setAberto(true)}>
        <Text style={[styles.texto, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal visible={aberto} transparent animationType="fade" onRequestClose={fechar}>
        <Pressable style={styles.overlay} onPress={fechar}>
          <Pressable style={styles.painel} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.painelTitulo}>{placeholder}</Text>
            <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar..." />
            {options.length === 0 ? (
              <Text style={styles.vazio}>{vazioTexto ?? "Nenhum item cadastrado."}</Text>
            ) : (
              <FlatList
                data={filtradas}
                keyExtractor={(item) => item.label}
                style={{ maxHeight: 320 }}
                ListEmptyComponent={<Text style={styles.vazio}>Nenhum resultado.</Text>}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [styles.opcao, pressed && styles.opcaoPressed]}
                    onPress={() => {
                      onChange(item.label);
                      fechar();
                    }}
                  >
                    <Text style={styles.opcaoTexto}>{item.label}</Text>
                    {item.subtitulo ? <Text style={styles.opcaoSubtitulo}>{item.subtitulo}</Text> : null}
                  </Pressable>
                )}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
  campo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 13,
    marginBottom: spacing.md,
  },
  texto: { fontSize: 14, fontFamily: font.regular, color: colors.textPrimary, flex: 1 },
  placeholder: { color: colors.textMuted },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(26,26,46,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  painel: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  painelTitulo: { fontFamily: font.semibold, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.md },
  vazio: { color: colors.textMuted, fontFamily: font.regular, fontSize: 13, textAlign: "center", paddingVertical: spacing.lg },
  opcao: { paddingVertical: 12, paddingHorizontal: spacing.sm, borderRadius: radius.sm },
  opcaoPressed: { backgroundColor: colors.bg },
  opcaoTexto: { fontFamily: font.semibold, fontSize: 14, color: colors.textPrimary },
  opcaoSubtitulo: { fontFamily: font.regular, fontSize: 12, color: colors.textSecondary, marginTop: 1 },
});
