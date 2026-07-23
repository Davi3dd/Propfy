import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useCallback, useMemo, useRef, useState } from "react";
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
import { useTheme } from "../../contexts/ThemeContext";
import { db } from "../../services/firebase";
import { font, radius, shadow, spacing, type ColorPalette } from "../../theme";
import type { Cliente, TipoCliente } from "../../types";
import { avisar, confirmar } from "../../utils/dialogs";

const TIPOS: Array<"Todos" | TipoCliente> = [
  "Todos",
  "Locador",
  "Locatário",
  "Comprador",
  "Vendedor",
];
const TIPOS_CADASTRO: TipoCliente[] = ["Locador", "Locatário", "Comprador", "Vendedor"];

const getCoresTipo = (colors: ColorPalette): Record<TipoCliente, string> => ({
  Locador: colors.blue,
  Locatário: colors.success,
  Comprador: colors.orange,
  Vendedor: colors.purple,
});

const FORM_VAZIO = { nome: "", telefone: "", interesse: "", tipo: "Locatário" as TipoCliente };

export default function ClientesScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const CORES_TIPO = useMemo(() => getCoresTipo(colors), [colors]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtro, setFiltro] = useState<"Todos" | TipoCliente>("Todos");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const salvandoRef = useRef(false);
  const toast = useToast();

  const setField = <K extends keyof typeof FORM_VAZIO>(campo: K, valor: (typeof FORM_VAZIO)[K]) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const buscarClientes = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const snapshot = await getDocs(collection(db, "clientes"));
      setClientes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Cliente)));
    } catch {
      setErro("Erro ao carregar clientes. Verifique a conexão.");
    } finally {
      setCarregando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarClientes();
    }, []),
  );

  const clientesFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return clientes.filter((c) => {
      const casaTipo = filtro === "Todos" || c.tipo === filtro;
      const casaBusca =
        !q || [c.nome, c.telefone, c.interesse].some((v) => v?.toLowerCase().includes(q));
      return casaTipo && casaBusca;
    });
  }, [clientes, filtro, busca]);

  const formatarTelefone = (text: string) => {
    const n = text.replace(/\D/g, "");
    if (n.length <= 2) return setField("telefone", `(${n}`);
    if (n.length <= 7) return setField("telefone", `(${n.slice(0, 2)}) ${n.slice(2)}`);
    setField("telefone", `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`);
  };

  const limparForm = () => {
    setForm(FORM_VAZIO);
    setEditandoId(null);
    setMostrarForm(false);
  };

  const abrirEdicao = (item: Cliente) => {
    setEditandoId(item.id);
    setForm({
      nome: item.nome,
      telefone: item.telefone,
      interesse: item.interesse ?? "",
      tipo: item.tipo,
    });
    setMostrarForm(true);
  };

  const salvar = async () => {
    if (!form.nome.trim() || !form.telefone.trim()) {
      avisar("Campos obrigatórios", "Preencha nome e telefone.");
      return;
    }
    if (salvandoRef.current) return;
    salvandoRef.current = true;
    setSalvando(true);
    setErro(null);
    const eraEdicao = editandoId !== null;
    try {
      const dados = {
        nome: form.nome.trim(),
        telefone: form.telefone.trim(),
        interesse: form.interesse.trim(),
        tipo: form.tipo,
      };
      if (editandoId) {
        await updateDoc(doc(db, "clientes", editandoId), dados);
      } else {
        await addDoc(collection(db, "clientes"), dados);
      }
      limparForm();
      await buscarClientes();
      toast(eraEdicao ? "Cliente atualizado" : "Cliente salvo");
    } catch {
      setErro("Erro ao salvar cliente. Tente novamente.");
    } finally {
      salvandoRef.current = false;
      setSalvando(false);
    }
  };

  const deletarCliente = (id: string) => {
    confirmar("Confirmar exclusão", "Deseja remover este cliente?", async () => {
      try {
        await deleteDoc(doc(db, "clientes", id));
        await buscarClientes();
        toast("Cliente removido");
      } catch {
        setErro("Erro ao remover cliente. Tente novamente.");
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
          <View style={[styles.headerIcon, { backgroundColor: colors.purple + "18" }]}>
            <Ionicons name="people" size={20} color={colors.purple} />
          </View>
          <Text style={styles.titulo}>Clientes</Text>
        </View>

        {erro && (
          <View style={styles.erroContainer}>
            <Ionicons name="cloud-offline-outline" size={16} color={colors.danger} />
            <Text style={styles.erroTexto}>{erro}</Text>
          </View>
        )}

        {!carregando && (clientes.length > 0 || busca.length > 0) && (
          <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar por nome ou telefone..." />
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtroContainer}
          contentContainerStyle={{ gap: spacing.sm }}
        >
          {TIPOS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.filtroBtn, filtro === t && styles.filtroBtnAtivo]}
              onPress={() => setFiltro(t)}
            >
              <Text style={[styles.filtroBtnTexto, filtro === t && styles.filtroBtnTextoAtivo]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {carregando ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={clientesFiltrados}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              clientes.length === 0 ? (
                <EmptyState
                  icon="people-outline"
                  titulo="Nenhum cliente cadastrado"
                  subtitulo="Cadastre seu primeiro cliente para começar."
                  acaoLabel="Novo Cliente"
                  onAcao={() => setMostrarForm(true)}
                />
              ) : (
                <EmptyState
                  icon="search-outline"
                  titulo="Nenhum resultado"
                  subtitulo="Nenhum cliente corresponde ao filtro ou busca."
                />
              )
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.tag, { backgroundColor: (CORES_TIPO[item.tipo] ?? "#94A3B8") + "18" }]}>
                    <Text style={[styles.tagTexto, { color: CORES_TIPO[item.tipo] ?? "#94A3B8" }]}>{item.tipo}</Text>
                  </View>
                  <View style={styles.acoes}>
                    <TouchableOpacity onPress={() => abrirEdicao(item)} hitSlop={8}>
                      <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deletarCliente(item.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.detalhe}>📞 {item.telefone}</Text>
                {item.interesse ? (
                  <Text style={styles.detalhe}>🏠 {item.interesse}</Text>
                ) : null}
              </View>
            )}
          />
        )}

        {mostrarForm && (
          <View style={styles.form}>
            <Text style={styles.formTitulo}>
              {editandoId ? "Editar Cliente" : "Novo Cliente"}
            </Text>
            <Text style={styles.label}>Tipo:</Text>
            <View style={styles.tipoRow}>
              {TIPOS_CADASTRO.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.tipoBtn,
                    { borderColor: CORES_TIPO[t] },
                    form.tipo === t && { backgroundColor: CORES_TIPO[t] },
                  ]}
                  onPress={() => setField("tipo", t)}
                >
                  <Text style={[styles.tipoBtnTexto, form.tipo === t ? { color: colors.white } : { color: CORES_TIPO[t] }]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nome do cliente"
              placeholderTextColor={colors.textMuted}
              value={form.nome}
              onChangeText={(v) => setField("nome", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              placeholderTextColor={colors.textMuted}
              value={form.telefone}
              onChangeText={formatarTelefone}
              keyboardType="numeric"
              maxLength={15}
            />
            <TextInput
              style={styles.input}
              placeholder="Interesse (ex: Apto 2 quartos)"
              placeholderTextColor={colors.textMuted}
              value={form.interesse}
              onChangeText={(v) => setField("interesse", v)}
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
            <Text style={styles.botaoTexto}>Novo Cliente</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg },
  headerIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  titulo: { fontFamily: font.bold, fontSize: 24, color: colors.textPrimary },
  erroContainer: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  erroTexto: { color: colors.danger, fontSize: 13, fontFamily: font.regular, flexShrink: 1 },
  vazio: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl, fontSize: 14, fontFamily: font.regular },
  filtroContainer: { marginBottom: spacing.lg },
  filtroBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filtroBtnAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  filtroBtnTexto: { fontSize: 13, color: colors.textSecondary, fontFamily: font.regular },
  filtroBtnTextoAtivo: { color: colors.white, fontFamily: font.semibold },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadow.soft },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  acoes: { flexDirection: "row", gap: spacing.md },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  tagTexto: { fontSize: 11, fontFamily: font.semibold },
  nome: { fontFamily: font.semibold, fontSize: 16, color: colors.textPrimary, marginBottom: 4 },
  detalhe: { fontSize: 14, color: colors.textSecondary, marginTop: 2, fontFamily: font.regular },
  form: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadow.soft },
  formTitulo: { fontFamily: font.semibold, fontSize: 16, color: colors.textPrimary, marginBottom: spacing.lg },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm, fontFamily: font.semibold },
  tipoRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  tipoBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1.5 },
  tipoBtnTexto: { fontSize: 12, fontFamily: font.semibold },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, borderRadius: radius.md, padding: 13, marginBottom: spacing.md, fontSize: 14, fontFamily: font.regular, color: colors.textPrimary },
  botao: { backgroundColor: colors.primary, borderRadius: radius.md, padding: 15, alignItems: "center", marginTop: spacing.sm },
  botaoAdd: { flexDirection: "row", gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md, padding: 15, alignItems: "center", justifyContent: "center", marginTop: spacing.sm, ...shadow.card },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: colors.white, fontSize: 15, fontFamily: font.semibold },
  botaoCancelar: { borderRadius: radius.md, padding: 15, alignItems: "center", marginTop: spacing.sm, marginBottom: spacing.xl },
  botaoCancelarTexto: { color: colors.textMuted, fontSize: 15, fontFamily: font.regular },
});
