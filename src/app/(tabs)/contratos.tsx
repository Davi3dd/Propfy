import { Ionicons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { SearchBar } from "../../components/SearchBar";
import { useToast } from "../../components/Toast";
import { db } from "../../services/firebase";
import { colors, font, radius, shadow, spacing } from "../../theme";
import type { Alerta, Contrato } from "../../types";
import { avisar, confirmar } from "../../utils/dialogs";

const FORM_VAZIO = {
  cliente: "",
  imovel: "",
  valorAluguel: "",
  dataInicio: "",
  dataVencimento: "",
  observacao: "",
};

function parseData(dataStr: string): Date {
  const [dia, mes, ano] = dataStr.split("/");
  return new Date(+ano, +mes - 1, +dia);
}

function diasDiferenca(data: Date): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

function calcularAlertas(dataInicioStr: string, dataVencStr: string): Alerta[] {
  const alertas: Alerta[] = [];

  if (dataVencStr && dataVencStr.length === 10) {
    const vencimento = parseData(dataVencStr);
    const diasVenc = diasDiferenca(vencimento);
    if (diasVenc < 0) {
      alertas.push({ texto: "⛔ Contrato vencido", cor: colors.danger });
    } else if (diasVenc <= 30) {
      alertas.push({ texto: `⚠️ Renovação em ${diasVenc} dias`, cor: colors.danger });
    } else if (diasVenc <= 90) {
      alertas.push({ texto: `🔔 Renovação em ${diasVenc} dias`, cor: colors.orange });
    } else {
      alertas.push({ texto: `✅ Vence em ${diasVenc} dias`, cor: colors.success });
    }
  }

  if (dataInicioStr && dataInicioStr.length === 10) {
    const inicio = parseData(dataInicioStr);
    const hoje = new Date();
    const mesesAtivos =
      (hoje.getFullYear() - inicio.getFullYear()) * 12 +
      (hoje.getMonth() - inicio.getMonth());
    const proximoReajuste = new Date(inicio);
    proximoReajuste.setMonth(inicio.getMonth() + (Math.floor(mesesAtivos / 12) + 1) * 12);
    const diasReajuste = diasDiferenca(proximoReajuste);
    if (diasReajuste <= 30) {
      alertas.push({ texto: `💰 Reajuste em ${diasReajuste} dias`, cor: colors.danger });
    } else if (diasReajuste <= 60) {
      alertas.push({ texto: `💰 Reajuste em ${diasReajuste} dias`, cor: colors.orange });
    }
  }

  return alertas;
}

export default function ContratosScreen() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const salvandoRef = useRef(false);
  const toast = useToast();

  const setField = (campo: keyof typeof FORM_VAZIO, valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const contratosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return contratos;
    return contratos.filter((c) =>
      [c.cliente, c.imovel, c.valorAluguel].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [contratos, busca]);

  const buscarContratos = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const snapshot = await getDocs(collection(db, "contratos"));
      setContratos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Contrato)));
    } catch {
      setErro("Erro ao carregar contratos. Verifique a conexão.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarContratos();
  }, []);

  const formatarValor = (text: string) => {
    const numero = text.replace(/\D/g, "");
    const formatado = numero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setField("valorAluguel", formatado ? `R$ ${formatado}` : "");
  };

  const formatarData = (text: string, campo: "dataInicio" | "dataVencimento") => {
    const n = text.replace(/\D/g, "");
    if (n.length <= 2) return setField(campo, n);
    if (n.length <= 4) return setField(campo, `${n.slice(0, 2)}/${n.slice(2)}`);
    setField(campo, `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4, 8)}`);
  };

  const limparForm = () => {
    setForm(FORM_VAZIO);
    setEditandoId(null);
    setMostrarForm(false);
  };

  const abrirEdicao = (item: Contrato) => {
    setEditandoId(item.id);
    setForm({
      cliente: item.cliente,
      imovel: item.imovel,
      valorAluguel: item.valorAluguel,
      dataInicio: item.dataInicio,
      dataVencimento: item.dataVencimento,
      observacao: item.observacao ?? "",
    });
    setMostrarForm(true);
  };

  const salvar = async () => {
    if (
      !form.cliente.trim() ||
      !form.imovel.trim() ||
      !form.valorAluguel.trim() ||
      !form.dataInicio ||
      !form.dataVencimento
    ) {
      avisar("Campos obrigatórios", "Preencha todos os campos obrigatórios.");
      return;
    }
    if (salvandoRef.current) return;
    salvandoRef.current = true;
    setSalvando(true);
    setErro(null);
    const eraEdicao = editandoId !== null;
    try {
      const dados = {
        cliente: form.cliente.trim(),
        imovel: form.imovel.trim(),
        valorAluguel: form.valorAluguel.trim(),
        dataInicio: form.dataInicio,
        dataVencimento: form.dataVencimento,
        observacao: form.observacao.trim(),
      };
      if (editandoId) {
        await updateDoc(doc(db, "contratos", editandoId), dados);
      } else {
        await addDoc(collection(db, "contratos"), dados);
      }
      limparForm();
      await buscarContratos();
      toast(eraEdicao ? "Contrato atualizado" : "Contrato salvo");
    } catch {
      setErro("Erro ao salvar contrato. Tente novamente.");
    } finally {
      salvandoRef.current = false;
      setSalvando(false);
    }
  };

  const deletarContrato = (id: string) => {
    confirmar("Confirmar exclusão", "Deseja remover este contrato?", async () => {
      try {
        await deleteDoc(doc(db, "contratos", id));
        await buscarContratos();
        toast("Contrato removido");
      } catch {
        setErro("Erro ao remover contrato. Tente novamente.");
      }
    }, "Remover");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.xl, paddingTop: 64, paddingBottom: 120 }}>
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: colors.orange + "18" }]}>
            <Ionicons name="document-text" size={20} color={colors.orange} />
          </View>
          <Text style={styles.titulo}>Contratos</Text>
        </View>

        {erro && (
          <View style={styles.erroContainer}>
            <Ionicons name="cloud-offline-outline" size={16} color={colors.danger} />
            <Text style={styles.erroTexto}>{erro}</Text>
          </View>
        )}

        {!carregando && (contratos.length > 0 || busca.length > 0) && (
          <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar por cliente ou imóvel..." />
        )}

        {carregando ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={contratosFiltrados}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              busca.trim() ? (
                <EmptyState
                  icon="search-outline"
                  titulo="Nenhum resultado"
                  subtitulo={`Nada encontrado para "${busca.trim()}".`}
                />
              ) : (
                <EmptyState
                  icon="document-text-outline"
                  titulo="Nenhum contrato cadastrado"
                  subtitulo="Cadastre seu primeiro contrato para começar."
                  acaoLabel="Novo Contrato"
                  onAcao={() => setMostrarForm(true)}
                />
              )
            }
            renderItem={({ item }) => {
              const alertas = calcularAlertas(item.dataInicio, item.dataVencimento);
              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cliente}>{item.cliente}</Text>
                    <View style={styles.acoes}>
                      <TouchableOpacity onPress={() => abrirEdicao(item)} hitSlop={8}>
                        <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deletarContrato(item.id)} hitSlop={8}>
                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.detalhe}>🏠 {item.imovel}</Text>
                  <Text style={styles.detalhe}>💰 {item.valorAluguel}/mês</Text>
                  <Text style={styles.detalhe}>
                    📅 {item.dataInicio} → {item.dataVencimento}
                  </Text>
                  {alertas.map((a, i) => (
                    <View key={i} style={[styles.alertaPill, { backgroundColor: a.cor + "15" }]}>
                      <Text style={[styles.alerta, { color: a.cor }]}>{a.texto}</Text>
                    </View>
                  ))}
                  {item.observacao ? (
                    <Text style={styles.observacao}>💬 {item.observacao}</Text>
                  ) : null}
                </View>
              );
            }}
          />
        )}

        {mostrarForm && (
          <View style={styles.form}>
            <Text style={styles.formTitulo}>
              {editandoId ? "Editar Contrato" : "Novo Contrato"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do cliente"
              placeholderTextColor={colors.textMuted}
              value={form.cliente}
              onChangeText={(v) => setField("cliente", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Endereço do imóvel"
              placeholderTextColor={colors.textMuted}
              value={form.imovel}
              onChangeText={(v) => setField("imovel", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Valor do aluguel"
              placeholderTextColor={colors.textMuted}
              value={form.valorAluguel}
              onChangeText={formatarValor}
              keyboardType="numeric"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.inputMeio]}
                placeholder="Início (DD/MM/AAAA)"
                placeholderTextColor={colors.textMuted}
                value={form.dataInicio}
                onChangeText={(t) => formatarData(t, "dataInicio")}
                keyboardType="numeric"
                maxLength={10}
              />
              <TextInput
                style={[styles.input, styles.inputMeio]}
                placeholder="Vencimento (DD/MM/AAAA)"
                placeholderTextColor={colors.textMuted}
                value={form.dataVencimento}
                onChangeText={(t) => formatarData(t, "dataVencimento")}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <TextInput
              style={[styles.input, styles.inputObservacao]}
              placeholder="Observações"
              placeholderTextColor={colors.textMuted}
              value={form.observacao}
              onChangeText={(v) => setField("observacao", v)}
              multiline
            />
            <TouchableOpacity
              style={[styles.botao, salvando && styles.botaoDesabilitado]}
              onPress={salvar}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.botaoTexto}>Salvar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoCancelar} onPress={limparForm} disabled={salvando}>
              <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!mostrarForm && (
          <TouchableOpacity style={styles.botaoAdd} onPress={() => setMostrarForm(true)} activeOpacity={0.85}>
            <Ionicons name="add" size={20} color={colors.white} />
            <Text style={styles.botaoTexto}>Novo Contrato</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.xl },
  headerIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  titulo: { fontFamily: font.bold, fontSize: 24, color: colors.textPrimary },
  erroContainer: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  erroTexto: { color: colors.danger, fontSize: 13, fontFamily: font.regular, flexShrink: 1 },
  vazio: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl, fontSize: 14, fontFamily: font.regular },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadow.soft },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs },
  acoes: { flexDirection: "row", gap: spacing.md },
  cliente: { fontFamily: font.semibold, fontSize: 16, color: colors.textPrimary },
  detalhe: { fontSize: 14, color: colors.textSecondary, marginBottom: 2, fontFamily: font.regular },
  alertaPill: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, marginTop: spacing.sm },
  alerta: { fontSize: 12, fontFamily: font.semibold },
  observacao: { fontSize: 13, color: colors.textMuted, marginTop: spacing.sm, fontFamily: font.regular, fontStyle: "italic" },
  form: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadow.soft },
  formTitulo: { fontFamily: font.semibold, fontSize: 16, color: colors.textPrimary, marginBottom: spacing.lg },
  row: { flexDirection: "row", gap: spacing.sm },
  inputMeio: { flex: 1 },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, borderRadius: radius.md, padding: 13, marginBottom: spacing.md, fontSize: 14, fontFamily: font.regular, color: colors.textPrimary },
  inputObservacao: { height: 80, textAlignVertical: "top" },
  botao: { backgroundColor: colors.primary, borderRadius: radius.md, padding: 15, alignItems: "center", marginTop: spacing.sm },
  botaoAdd: { flexDirection: "row", gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md, padding: 15, alignItems: "center", justifyContent: "center", marginTop: spacing.sm, ...shadow.card },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: colors.white, fontSize: 15, fontFamily: font.semibold },
  botaoCancelar: { borderRadius: radius.md, padding: 15, alignItems: "center", marginTop: spacing.sm, marginBottom: spacing.xl },
  botaoCancelarTexto: { color: colors.textMuted, fontSize: 15, fontFamily: font.regular },
});
