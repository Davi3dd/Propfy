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
import type { Imovel } from "../../types";
import { avisar, confirmar } from "../../utils/dialogs";

const FORM_VAZIO = {
  tipo: "",
  endereco: "",
  valor: "",
  quartos: "",
  banheiros: "",
  vagas: "",
  observacao: "",
};

export default function ImoveisScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
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

  const imoveisFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return imoveis;
    return imoveis.filter((i) =>
      [i.tipo, i.endereco, i.valor].some((c) => c?.toLowerCase().includes(q)),
    );
  }, [imoveis, busca]);

  const buscarImoveis = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const snapshot = await getDocs(collection(db, "imoveis"));
      setImoveis(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Imovel)));
    } catch {
      setErro("Erro ao carregar imóveis. Verifique a conexão.");
    } finally {
      setCarregando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarImoveis();
    }, []),
  );

  const formatarValor = (text: string) => {
    const numero = text.replace(/\D/g, "");
    const formatado = numero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setField("valor", formatado ? `R$ ${formatado}` : "");
  };

  const limparForm = () => {
    setForm(FORM_VAZIO);
    setEditandoId(null);
    setMostrarForm(false);
  };

  const abrirEdicao = (item: Imovel) => {
    setEditandoId(item.id);
    setForm({
      tipo: item.tipo,
      endereco: item.endereco,
      valor: item.valor,
      quartos: item.quartos ?? "",
      banheiros: item.banheiros ?? "",
      vagas: item.vagas ?? "",
      observacao: item.observacao ?? "",
    });
    setMostrarForm(true);
  };

  const salvar = async () => {
    if (!form.endereco.trim() || !form.valor.trim() || !form.tipo.trim()) {
      avisar("Campos obrigatórios", "Preencha tipo, endereço e valor.");
      return;
    }
    if (salvandoRef.current) return;
    salvandoRef.current = true;
    setSalvando(true);
    setErro(null);
    const eraEdicao = editandoId !== null;
    try {
      const dados = {
        tipo: form.tipo.trim(),
        endereco: form.endereco.trim(),
        valor: form.valor.trim(),
        quartos: form.quartos.trim(),
        banheiros: form.banheiros.trim(),
        vagas: form.vagas.trim(),
        observacao: form.observacao.trim(),
      };
      if (editandoId) {
        await updateDoc(doc(db, "imoveis", editandoId), dados);
      } else {
        await addDoc(collection(db, "imoveis"), dados);
      }
      limparForm();
      await buscarImoveis();
      toast(eraEdicao ? "Imóvel atualizado" : "Imóvel salvo");
    } catch {
      setErro("Erro ao salvar imóvel. Tente novamente.");
    } finally {
      salvandoRef.current = false;
      setSalvando(false);
    }
  };

  const deletarImovel = (id: string) => {
    confirmar("Confirmar exclusão", "Deseja remover este imóvel?", async () => {
      try {
        await deleteDoc(doc(db, "imoveis", id));
        await buscarImoveis();
        toast("Imóvel removido");
      } catch {
        setErro("Erro ao remover imóvel. Tente novamente.");
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
          <View style={[styles.headerIcon, { backgroundColor: colors.blue + "18" }]}>
            <Ionicons name="home" size={20} color={colors.blue} />
          </View>
          <Text style={styles.titulo}>Imóveis</Text>
        </View>

        {erro && (
          <View style={styles.erroContainer}>
            <Ionicons name="cloud-offline-outline" size={16} color={colors.danger} />
            <Text style={styles.erroTexto}>{erro}</Text>
          </View>
        )}

        {!carregando && (imoveis.length > 0 || busca.length > 0) && (
          <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar por tipo ou endereço..." />
        )}

        {carregando ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={imoveisFiltrados}
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
                  icon="home-outline"
                  titulo="Nenhum imóvel cadastrado"
                  subtitulo="Cadastre seu primeiro imóvel para começar."
                  acaoLabel="Novo Imóvel"
                  onAcao={() => setMostrarForm(true)}
                />
              )
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.tipo}>{item.tipo}</Text>
                  <View style={styles.acoes}>
                    <TouchableOpacity onPress={() => abrirEdicao(item)} hitSlop={8}>
                      <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deletarImovel(item.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.endereco}>{item.endereco}</Text>
                <Text style={styles.valor}>{item.valor}</Text>
                <View style={styles.detalhesRow}>
                  {item.quartos ? <Text style={styles.detalhe}>🛏 {item.quartos} quartos</Text> : null}
                  {item.banheiros ? <Text style={styles.detalhe}>🚿 {item.banheiros} banheiros</Text> : null}
                  {item.vagas ? <Text style={styles.detalhe}>🚗 {item.vagas} vagas</Text> : null}
                </View>
                {item.observacao ? (
                  <Text style={styles.observacao}>💬 {item.observacao}</Text>
                ) : null}
              </View>
            )}
          />
        )}

        {mostrarForm && (
          <View style={styles.form}>
            <Text style={styles.formTitulo}>
              {editandoId ? "Editar Imóvel" : "Novo Imóvel"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tipo (Casa, Apto...)"
              placeholderTextColor={colors.textMuted}
              value={form.tipo}
              onChangeText={(v) => setField("tipo", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Endereço"
              placeholderTextColor={colors.textMuted}
              value={form.endereco}
              onChangeText={(v) => setField("endereco", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Valor"
              placeholderTextColor={colors.textMuted}
              value={form.valor}
              onChangeText={formatarValor}
              keyboardType="numeric"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.inputTerceiro]}
                placeholder="Quartos"
                placeholderTextColor={colors.textMuted}
                value={form.quartos}
                onChangeText={(v) => setField("quartos", v)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.inputTerceiro]}
                placeholder="Banheiros"
                placeholderTextColor={colors.textMuted}
                value={form.banheiros}
                onChangeText={(v) => setField("banheiros", v)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.inputTerceiro]}
                placeholder="Vagas"
                placeholderTextColor={colors.textMuted}
                value={form.vagas}
                onChangeText={(v) => setField("vagas", v)}
                keyboardType="numeric"
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
            <Text style={styles.botaoTexto}>Novo Imóvel</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
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
  tipo: { fontFamily: font.semibold, fontSize: 11, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  endereco: { fontFamily: font.semibold, fontSize: 16, color: colors.textPrimary, marginBottom: 2 },
  valor: { fontFamily: font.bold, fontSize: 15, color: colors.success, marginBottom: spacing.sm },
  detalhesRow: { flexDirection: "row", gap: spacing.md, flexWrap: "wrap" },
  detalhe: { fontSize: 13, color: colors.textSecondary, fontFamily: font.regular },
  observacao: { fontSize: 13, color: colors.textMuted, marginTop: 6, fontFamily: font.regular, fontStyle: "italic" },
  form: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadow.soft },
  formTitulo: { fontFamily: font.semibold, fontSize: 16, color: colors.textPrimary, marginBottom: spacing.lg },
  row: { flexDirection: "row", gap: spacing.sm },
  inputTerceiro: { flex: 1 },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, borderRadius: radius.md, padding: 13, marginBottom: spacing.md, fontSize: 14, fontFamily: font.regular, color: colors.textPrimary },
  inputObservacao: { height: 80, textAlignVertical: "top" },
  botao: { backgroundColor: colors.primary, borderRadius: radius.md, padding: 15, alignItems: "center", marginTop: spacing.sm },
  botaoAdd: { flexDirection: "row", gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md, padding: 15, alignItems: "center", justifyContent: "center", marginTop: spacing.sm, ...shadow.card },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: colors.white, fontSize: 15, fontFamily: font.semibold },
  botaoCancelar: { borderRadius: radius.md, padding: 15, alignItems: "center", marginTop: spacing.sm, marginBottom: spacing.xl },
  botaoCancelarTexto: { color: colors.textMuted, fontSize: 15, fontFamily: font.regular },
});
