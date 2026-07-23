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
import { SelectField } from "../../components/SelectField";
import { useToast } from "../../components/Toast";
import { useTheme } from "../../contexts/ThemeContext";
import { db } from "../../services/firebase";
import { font, radius, shadow, spacing, type ColorPalette } from "../../theme";
import type { Cliente, Imovel, StatusVisita, Visita } from "../../types";
import { avisar, confirmar } from "../../utils/dialogs";

const STATUS_OPCOES: StatusVisita[] = ["Agendada", "Confirmada", "Realizada", "Fechada"];

const getStatusCores = (colors: ColorPalette): Record<StatusVisita, string> => ({
  Agendada: "#94A3B8",
  Confirmada: colors.blue,
  Realizada: colors.orange,
  Fechada: colors.success,
});

const FORM_VAZIO = {
  cliente: "",
  imovel: "",
  data: "",
  horario: "",
  observacao: "",
  status: "Agendada" as StatusVisita,
};

export default function VisitasScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const STATUS_CORES = useMemo(() => getStatusCores(colors), [colors]);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
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

  const setField = <K extends keyof typeof FORM_VAZIO>(campo: K, valor: (typeof FORM_VAZIO)[K]) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const visitasFiltradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return visitas;
    return visitas.filter((v) =>
      [v.cliente, v.imovel, v.status].some((c) => c?.toLowerCase().includes(q)),
    );
  }, [visitas, busca]);

  const buscarVisitas = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [visitasSnap, clientesSnap, imoveisSnap] = await Promise.all([
        getDocs(collection(db, "visitas")),
        getDocs(collection(db, "clientes")),
        getDocs(collection(db, "imoveis")),
      ]);
      setVisitas(visitasSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Visita)));
      setClientes(clientesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Cliente)));
      setImoveis(imoveisSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Imovel)));
    } catch {
      setErro("Erro ao carregar visitas. Verifique a conexão.");
    } finally {
      setCarregando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarVisitas();
    }, []),
  );

  const formatarData = (text: string) => {
    const n = text.replace(/\D/g, "");
    if (n.length <= 2) return setField("data", n);
    if (n.length <= 4) return setField("data", `${n.slice(0, 2)}/${n.slice(2)}`);
    setField("data", `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4, 8)}`);
  };

  const formatarHorario = (text: string) => {
    const n = text.replace(/\D/g, "");
    if (n.length <= 2) return setField("horario", n);
    setField("horario", `${n.slice(0, 2)}:${n.slice(2, 4)}`);
  };

  const limparForm = () => {
    setForm(FORM_VAZIO);
    setEditandoId(null);
    setMostrarForm(false);
  };

  const abrirEdicao = (item: Visita) => {
    setEditandoId(item.id);
    setForm({
      cliente: item.cliente,
      imovel: item.imovel,
      data: item.data,
      horario: item.horario,
      observacao: item.observacao ?? "",
      status: item.status,
    });
    setMostrarForm(true);
  };

  const salvar = async () => {
    if (!form.cliente.trim() || !form.imovel.trim() || !form.data || !form.horario) {
      avisar("Campos obrigatórios", "Preencha cliente, imóvel, data e horário.");
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
        data: form.data,
        horario: form.horario,
        observacao: form.observacao.trim(),
        status: form.status,
      };
      if (editandoId) {
        await updateDoc(doc(db, "visitas", editandoId), dados);
      } else {
        await addDoc(collection(db, "visitas"), dados);
      }
      limparForm();
      await buscarVisitas();
      toast(eraEdicao ? "Visita atualizada" : "Visita salva");
    } catch {
      setErro("Erro ao salvar visita. Tente novamente.");
    } finally {
      salvandoRef.current = false;
      setSalvando(false);
    }
  };

  const deletarVisita = (id: string) => {
    confirmar("Confirmar exclusão", "Deseja remover esta visita?", async () => {
      try {
        await deleteDoc(doc(db, "visitas", id));
        await buscarVisitas();
        toast("Visita removida");
      } catch {
        setErro("Erro ao remover visita. Tente novamente.");
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
          <View style={[styles.headerIcon, { backgroundColor: colors.green + "18" }]}>
            <Ionicons name="calendar" size={20} color={colors.green} />
          </View>
          <Text style={styles.titulo}>Visitas</Text>
        </View>

        {erro && (
          <View style={styles.erroContainer}>
            <Ionicons name="cloud-offline-outline" size={16} color={colors.danger} />
            <Text style={styles.erroTexto}>{erro}</Text>
          </View>
        )}

        {!carregando && (visitas.length > 0 || busca.length > 0) && (
          <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar por cliente, imóvel ou status..." />
        )}

        {carregando ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={visitasFiltradas}
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
                  icon="calendar-outline"
                  titulo="Nenhuma visita agendada"
                  subtitulo="Agende sua primeira visita para começar."
                  acaoLabel="Nova Visita"
                  onAcao={() => setMostrarForm(true)}
                />
              )
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.statusPill, { backgroundColor: (STATUS_CORES[item.status] ?? "#94A3B8") + "18" }]}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_CORES[item.status] ?? "#94A3B8" }]} />
                    <Text style={[styles.status, { color: STATUS_CORES[item.status] ?? "#94A3B8" }]}>
                      {item.status}
                    </Text>
                  </View>
                  <View style={styles.acoes}>
                    <TouchableOpacity onPress={() => abrirEdicao(item)} hitSlop={8}>
                      <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deletarVisita(item.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.cliente}>{item.cliente}</Text>
                <Text style={styles.detalhe}>{item.imovel}</Text>
                <Text style={styles.detalhe}>📅 {item.data} às {item.horario}</Text>
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
              {editandoId ? "Editar Visita" : "Nova Visita"}
            </Text>
            <SelectField
              placeholder="Selecione o cliente"
              value={form.cliente}
              onChange={(v) => setField("cliente", v)}
              options={clientes.map((c) => ({ label: c.nome, subtitulo: c.telefone }))}
              vazioTexto="Nenhum cliente cadastrado. Cadastre um cliente primeiro."
            />
            <SelectField
              placeholder="Selecione o imóvel"
              value={form.imovel}
              onChange={(v) => setField("imovel", v)}
              options={imoveis.map((i) => ({ label: i.endereco, subtitulo: i.valor }))}
              vazioTexto="Nenhum imóvel cadastrado. Cadastre um imóvel primeiro."
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.inputMeio]}
                placeholder="Data (DD/MM/AAAA)"
                placeholderTextColor={colors.textMuted}
                value={form.data}
                onChangeText={formatarData}
                keyboardType="numeric"
                maxLength={10}
              />
              <TextInput
                style={[styles.input, styles.inputMeio]}
                placeholder="Horário (HH:MM)"
                placeholderTextColor={colors.textMuted}
                value={form.horario}
                onChangeText={formatarHorario}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <Text style={styles.label}>Status:</Text>
            <View style={styles.statusRow}>
              {STATUS_OPCOES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusBtn, form.status === s && styles.statusBtnAtivo]}
                  onPress={() => setField("status", s)}
                >
                  <Text style={[styles.statusBtnTexto, form.status === s && styles.statusBtnTextoAtivo]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
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
            <Text style={styles.botaoTexto}>Nova Visita</Text>
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
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  acoes: { flexDirection: "row", gap: spacing.md },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  status: { fontSize: 11, fontFamily: font.semibold },
  cliente: { fontFamily: font.semibold, fontSize: 16, color: colors.textPrimary, marginBottom: 4 },
  detalhe: { fontSize: 14, color: colors.textSecondary, marginBottom: 2, fontFamily: font.regular },
  observacao: { fontSize: 13, color: colors.textMuted, marginTop: 4, fontFamily: font.regular, fontStyle: "italic" },
  form: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadow.soft },
  formTitulo: { fontFamily: font.semibold, fontSize: 16, color: colors.textPrimary, marginBottom: spacing.lg },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm, fontFamily: font.semibold },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  statusBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  statusBtnAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusBtnTexto: { fontSize: 12, color: colors.textSecondary, fontFamily: font.regular },
  statusBtnTextoAtivo: { color: colors.white, fontFamily: font.semibold },
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
