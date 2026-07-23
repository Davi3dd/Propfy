import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { auth, db } from "../../services/firebase";
import { colors, font, radius, shadow, spacing } from "../../theme";

interface CardDashboard {
  titulo: string;
  valor: number;
  icone: keyof typeof Ionicons.glyphMap;
  cor: string;
}

export default function DashboardScreen() {
  const [totalImoveis, setTotalImoveis] = useState(0);
  const [totalVisitas, setTotalVisitas] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalContratos, setTotalContratos] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarTotais() {
        setCarregando(true);
        setErro(null);
        try {
          const [imoveis, visitas, clientes, contratos] = await Promise.all([
            getDocs(collection(db, "imoveis")),
            getDocs(collection(db, "visitas")),
            getDocs(collection(db, "clientes")),
            getDocs(collection(db, "contratos")),
          ]);
          if (!ativo) return;
          setTotalImoveis(imoveis.size);
          setTotalVisitas(visitas.size);
          setTotalClientes(clientes.size);
          setTotalContratos(contratos.size);
        } catch {
          if (ativo) setErro("Erro ao carregar dados. Verifique a conexão.");
        } finally {
          if (ativo) setCarregando(false);
        }
      }

      carregarTotais();
      return () => { ativo = false; };
    }, []),
  );

  const cards: CardDashboard[] = [
    { titulo: "Imóveis", valor: totalImoveis, icone: "home", cor: colors.blue },
    { titulo: "Visitas", valor: totalVisitas, icone: "calendar", cor: colors.green },
    { titulo: "Clientes", valor: totalClientes, icone: "people", cor: colors.purple },
    { titulo: "Contratos", valor: totalContratos, icone: "document-text", cor: colors.orange },
  ];

  const totalGeral = totalImoveis + totalVisitas + totalClientes + totalContratos;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.xl, paddingTop: 64, paddingBottom: 120 }}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoChip}>
            <Ionicons name="business" size={20} color={colors.white} />
          </View>
          <View>
            <Text style={styles.titulo}>Propfy</Text>
            <Text style={styles.subtitulo}>Sua gestão imobiliária</Text>
          </View>
        </View>
        <Pressable onPress={() => signOut(auth)} hitSlop={12} style={styles.sairBtn}>
          <Ionicons name="log-out-outline" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Total de registros</Text>
        <Text style={styles.heroNumero}>{carregando ? "—" : totalGeral}</Text>
        <View style={styles.heroFooter}>
          <Ionicons name="sparkles-outline" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.heroHint}>Visão geral da sua carteira</Text>
        </View>
      </View>

      {erro && (
        <View style={styles.erroContainer}>
          <Ionicons name="cloud-offline-outline" size={16} color={colors.danger} />
          <Text style={styles.erroTexto}>{erro}</Text>
        </View>
      )}

      {carregando ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.grid}>
          {cards.map((card) => (
            <View key={card.titulo} style={styles.card}>
              <View style={[styles.iconContainer, { backgroundColor: card.cor + "18" }]}>
                <Ionicons name={card.icone} size={22} color={card.cor} />
              </View>
              <Text style={styles.cardNumero}>{card.valor}</Text>
              <Text style={styles.cardTexto}>{card.titulo}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xl },
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  logoChip: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: { fontFamily: font.bold, fontSize: 22, color: colors.textPrimary },
  subtitulo: { fontFamily: font.regular, fontSize: 13, color: colors.textSecondary },
  sairBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadow.card,
  },
  heroLabel: { fontFamily: font.regular, fontSize: 13, color: "rgba(255,255,255,0.7)" },
  heroNumero: { fontFamily: font.bold, fontSize: 44, color: colors.white, marginTop: spacing.xs },
  heroFooter: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm },
  heroHint: { fontFamily: font.regular, fontSize: 12, color: "rgba(255,255,255,0.7)" },
  erroContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  erroTexto: { color: colors.danger, fontSize: 13, fontFamily: font.regular, flexShrink: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: "47.5%",
    flexGrow: 1,
    ...shadow.soft,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  cardNumero: { fontFamily: font.bold, fontSize: 28, color: colors.textPrimary },
  cardTexto: { fontFamily: font.regular, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});
