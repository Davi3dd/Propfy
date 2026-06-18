import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
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
import { db } from "../services/firebase";

const TIPOS = ["Todos", "Locador", "Locatário", "Comprador", "Vendedor"];
const TIPOS_CADASTRO = ["Locador", "Locatário", "Comprador", "Vendedor"];

const CORES_TIPO: any = {
  Locador: "#3498db",
  Locatário: "#2ecc71",
  Comprador: "#f39c12",
  Vendedor: "#9b59b6",
};

export default function ClientesScreen() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("Todos");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [interesse, setInteresse] = useState("");
  const [tipo, setTipo] = useState("Locatário");

  const buscarClientes = async () => {
    const snapshot = await getDocs(collection(db, "clientes"));
    setClientes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    buscarClientes();
  }, []);

  const clientesFiltrados =
    filtro === "Todos" ? clientes : clientes.filter((c) => c.tipo === filtro);

  const formatarTelefone = (text: string) => {
    const n = text.replace(/\D/g, "");
    if (n.length <= 2) return setTelefone(`(${n}`);
    if (n.length <= 7) return setTelefone(`(${n.slice(0, 2)}) ${n.slice(2)}`);
    setTelefone(`(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`);
  };

  const limparForm = () => {
    setNome("");
    setTelefone("");
    setInteresse("");
    setTipo("Locatário");
    setEditandoId(null);
    setMostrarForm(false);
  };

  const abrirEdicao = (item: any) => {
    setEditandoId(item.id);
    setNome(item.nome);
    setTelefone(item.telefone);
    setInteresse(item.interesse || "");
    setTipo(item.tipo || "Locatário");
    setMostrarForm(true);
  };

  const salvar = async () => {
    if (!nome || !telefone) return;
    const dados = { nome, telefone, interesse, tipo };
    if (editandoId) {
      await updateDoc(doc(db, "clientes", editandoId), dados);
    } else {
      await addDoc(collection(db, "clientes"), dados);
    }
    limparForm();
    buscarClientes();
  };

  const deletarCliente = async (id: string) => {
    await deleteDoc(doc(db, "clientes", id));
    buscarClientes();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text style={styles.titulo}>Clientes</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtroContainer}
        >
          {TIPOS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.filtroBtn, filtro === t && styles.filtroBtnAtivo]}
              onPress={() => setFiltro(t)}
            >
              <Text
                style={[
                  styles.filtroBtnTexto,
                  filtro === t && styles.filtroBtnTextoAtivo,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={clientesFiltrados}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.tag,
                    { backgroundColor: CORES_TIPO[item.tipo] || "#888" },
                  ]}
                >
                  <Text style={styles.tagTexto}>{item.tipo || "Sem tipo"}</Text>
                </View>
                <View style={styles.acoes}>
                  <TouchableOpacity onPress={() => abrirEdicao(item)}>
                    <Text style={styles.editar}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deletarCliente(item.id)}>
                    <Text style={styles.deletar}>✕</Text>
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
                    tipo === t && styles.tipoBtnAtivo,
                    { borderColor: CORES_TIPO[t] },
                  ]}
                  onPress={() => setTipo(t)}
                >
                  <Text
                    style={[
                      styles.tipoBtnTexto,
                      tipo === t && { color: "#fff" },
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nome do cliente"
              value={nome}
              onChangeText={setNome}
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              value={telefone}
              onChangeText={formatarTelefone}
              keyboardType="numeric"
              maxLength={15}
            />
            <TextInput
              style={styles.input}
              placeholder="Interesse (ex: Apto 2 quartos)"
              value={interesse}
              onChangeText={setInteresse}
            />
            <TouchableOpacity style={styles.botao} onPress={salvar}>
              <Text style={styles.botaoTexto}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoCancelar} onPress={limparForm}>
              <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
        {!mostrarForm && (
          <TouchableOpacity
            style={styles.botao}
            onPress={() => setMostrarForm(true)}
          >
            <Text style={styles.botaoTexto}>+ Novo Cliente</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 24,
    paddingTop: 60,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 16,
  },
  filtroContainer: { marginBottom: 16 },
  filtroBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  filtroBtnAtivo: { backgroundColor: "#1a1a2e", borderColor: "#1a1a2e" },
  filtroBtnTexto: { fontSize: 13, color: "#666" },
  filtroBtnTextoAtivo: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  acoes: { flexDirection: "row", gap: 12 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagTexto: { fontSize: 11, color: "#fff", fontWeight: "600" },
  nome: { fontSize: 16, fontWeight: "600", color: "#1a1a2e", marginBottom: 4 },
  editar: { fontSize: 16 },
  deletar: { fontSize: 16, color: "#e74c3c", fontWeight: "bold" },
  detalhe: { fontSize: 14, color: "#666", marginTop: 2 },
  form: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  formTitulo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 16,
  },
  label: { fontSize: 14, color: "#666", marginBottom: 8 },
  tipoRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  tipoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#ddd",
  },
  tipoBtnAtivo: { backgroundColor: "#1a1a2e" },
  tipoBtnTexto: { fontSize: 12, color: "#666" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  botao: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  botaoTexto: { color: "#fff", fontSize: 16, fontWeight: "600" },
  botaoCancelar: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  botaoCancelarTexto: { color: "#888", fontSize: 16 },
});
