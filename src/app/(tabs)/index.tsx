import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { auth, db } from "../../services/firebase";
import { font, radius, shadow, spacing, type ColorPalette } from "../../theme";
import type { Contrato, Visita } from "../../types";
import { calcularAlertas } from "../../utils/contratos";

interface CardDashboard {
  titulo: string;
  valor: number;
  icone: keyof typeof Ionicons.glyphMap;
  cor: string;
}

interface ItemAtencao {
  id: string;
  icone: keyof typeof Ionicons.glyphMap;
  titulo: string;
  descricao: string;
  cor: string;
  rota: Href;
  prioridade: number;
}

function dataHojeStr(): string {
  const h = new Date();
  return `${String(h.getDate()).padStart(2, "0")}/${String(h.getMonth() + 1).padStart(2, "0")}/${h.getFullYear()}`;
}

export default function DashboardScreen() {
  const { colors, scheme, toggleScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [totalImoveis, setTotalImoveis] = useState(0);
  const [totalVisitas, setTotalVisitas] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalContratos, setTotalContratos] = useState(0);
  const [atencao, setAtencao] = useState<ItemAtencao[]>([]);
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

          const itens: ItemAtencao[] = [];

          // Contratos com alertas urgentes (vencimento/renovação/reajuste)
          contratos.docs.forEach((d) => {
            const c = { id: d.id, ...d.data() } as Contrato;
            calcularAlertas(c.dataInicio, c.dataVencimento, colors).forEach((a, i) => {
              if (a.nivel === "urgente" || a.nivel === "atencao") {
                itens.push({
                  id: `c-${d.id}-${i}`,
                  icone: "document-text",
                  titulo: c.cliente,
                  descricao: a.texto,
                  cor: a.cor,
                  rota: "/contratos",
                  prioridade: a.nivel === "urgente" ? 0 : 1,
                });
              }
            });
          });

          // Visitas agendadas para hoje
          const hoje = dataHojeStr();
          visitas.docs.forEach((d) => {
            const v = { id: d.id, ...d.data() } as Visita;
            if (v.data === hoje) {
              itens.push({
                id: `v-${d.id}`,
                icone: "calendar",
                titulo: v.cliente,
                descricao: `Visita hoje às ${v.horario}`,
                cor: colors.blue,
                rota: "/visitas",
                prioridade: 2,
              });
            }
          });

          itens.sort((a, b) => a.prioridade - b.prioridade);
          setAtencao(itens);
        } catch {
          if (ativo) setErro("Erro ao carregar dados. Verifique a conexão.");
        } finally {
          if (ativo) setCarregando(false);
        }
      }

      carregarTotais();
      return () => { ativo = false; };
    }, [colors]),
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
        <View style={styles.acoesHeader}>
          <Pressable onPress={toggleScheme} hitSlop={12} style={styles.sairBtn}>
            <Ionicons
              name={scheme === "dark" ? "sunny-outline" : "moon-outline"}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
          <Pressable onPress={() => signOut(auth)} hitSlop={12} style={styles.sairBtn}>
            <Ionicons name="log-out-outline" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
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
        <>
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

          <Text style={styles.secaoTitulo}>Precisa de atenção</Text>
          {atencao.length === 0 ? (
            <View style={styles.tudoEmDia}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.tudoEmDiaTexto}>Tudo em dia por aqui.</Text>
            </View>
          ) : (
            atencao.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.atencaoCard, pressed && styles.atencaoCardPressed]}
                onPress={() => router.push(item.rota)}
              >
                <View style={[styles.atencaoIcone, { backgroundColor: item.cor + "18" }]}>
                  <Ionicons name={item.icone} size={18} color={item.cor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.atencaoTitulo}>{item.titulo}</Text>
                  <Text style={[styles.atencaoDesc, { color: item.cor }]}>{item.descricao}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xl },
    brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    acoesHeader: { flexDirection: "row", gap: spacing.sm },
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
    secaoTitulo: { fontFamily: font.semibold, fontSize: 16, color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md },
    tudoEmDia: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      ...shadow.soft,
    },
    tudoEmDiaTexto: { fontFamily: font.regular, fontSize: 14, color: colors.textSecondary },
    atencaoCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadow.soft,
    },
    atencaoCardPressed: { opacity: 0.7 },
    atencaoIcone: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    atencaoTitulo: { fontFamily: font.semibold, fontSize: 15, color: colors.textPrimary },
    atencaoDesc: { fontFamily: font.regular, fontSize: 13, marginTop: 1 },
  });
