import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../services/firebase";

export default function VisitasScreen() {
  const [visitas, setVisitas] = useState<any[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [cliente, setCliente] = useState("");
  const [imovel, setImovel] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [observacao, setObservacao] = useState("");
  const [status, setStatus] = useState("Agendada");

  const buscarVisitas = async () => {
    const snapshot = await getDocs(collection(db, "visitas"));
    setVisitas(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { buscarVisitas(); }, []);

  const formatarData = (text: string) => {
    const n = text.replace(/\D/g, "");
    if (n.length <= 2) return setData(n);
    if (n.length <= 4) return setData(`${n.slice(0, 2)}/${n.slice(2)}`);
    setData(`${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4, 8)}`);
  };

  const formatarHorario = (text: string) => {
    const n = text.replace(/\D/g, "");
    if (n.length <= 2) return setHorario(n);
    setHorario(`${n.slice(0, 2)}:${n.slice(2, 4)}`);
  };

  const limparForm = () => {
    setCliente(""); setImovel(""); setData(""); setHorario("");
    setObservacao(""); setStatus("Agendada"); setEditandoId(null); setMostrarForm(false);
  };

  const abrirEdicao = (item: any) => {
    setEditandoId(item.id);
    setCliente(item.cliente); setImovel(item.imovel);
    setData(item.data); setHorario(item.horario);
    setObservacao(item.observacao || ""); setStatus(item.status);
    setMostrarForm(true);
  };

  const salvar = async () => {
    if (!cliente || !imovel || !data || !horario) return;
    const dados = { cliente, imovel, data, horario, observacao, status };
    if (editandoId) {
      await updateDoc(doc(db, "visitas", editandoId), dados);
    } else {
      await addDoc(collection(db, "visitas"), dados);
    }
    limparForm();
    buscarVisitas();
  };

  const deletarVisita = async (id: string) => {
    await deleteDoc(doc(db, "visitas", id));
    buscarVisitas();
  };

  const statusCores: any = {
    Agendada: "#888", Confirmada: "#3498db", Realizada: "#f39c12", Fechada: "#2ecc71",
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.titulo}>Visitas</Text>
        <FlatList
          data={visitas}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={[styles.status, { color: statusCores[item.status] || "#888" }]}>{item.status}</Text>
                <View style={styles.acoes}>
                  <TouchableOpacity onPress={() => abrirEdicao(item)}>
                    <Text style={styles.editar}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deletarVisita(item.id)}>
                    <Text style={styles.deletar}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.cliente}>{item.cliente}</Text>
              <Text style={styles.detalhe}>{item.imovel}</Text>
              <Text style={styles.detalhe}>📅 {item.data} às {item.horario}</Text>
              {item.observacao ? <Text style={styles.observacao}>💬 {item.observacao}</Text> : null}
            </View>
          )}
        />
        {mostrarForm && (
          <View style={styles.form}>
            <Text style={styles.formTitulo}>{editandoId ? "Editar Visita" : "Nova Visita"}</Text>
            <TextInput style={styles.input} placeholder="Nome do cliente" value={cliente} onChangeText={setCliente} />
            <TextInput style={styles.input} placeholder="Endereço do imóvel" value={imovel} onChangeText={setImovel} />
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.inputMeio]} placeholder="Data (DD/MM/AAAA)" value={data} onChangeText={formatarData} keyboardType="numeric" maxLength={10} />
              <TextInput style={[styles.input, styles.inputMeio]} placeholder="Horário (HH:MM)" value={horario} onChangeText={formatarHorario} keyboardType="numeric" maxLength={5} />
            </View>
            <Text style={styles.label}>Status:</Text>
            <View style={styles.statusRow}>
              {["Agendada", "Confirmada", "Realizada", "Fechada"].map((s) => (
                <TouchableOpacity key={s} style={[styles.statusBtn, status === s && styles.statusBtnAtivo]} onPress={() => setStatus(s)}>
                  <Text style={[styles.statusBtnTexto, status === s && styles.statusBtnTextoAtivo]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={[styles.input, styles.inputObservacao]} placeholder="Observações" value={observacao} onChangeText={setObservacao} multiline />
            <TouchableOpacity style={styles.botao} onPress={salvar}>
              <Text style={styles.botaoTexto}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoCancelar} onPress={limparForm}>
              <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
        {!mostrarForm && (
          <TouchableOpacity style={styles.botao} onPress={() => setMostrarForm(true)}>
            <Text style={styles.botaoTexto}>+ Nova Visita</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 24, paddingTop: 60 },
  titulo: { fontSize: 28, fontWeight: "bold", color: "#1a1a2e", marginBottom: 24 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  acoes: { flexDirection: "row", gap: 12 },
  status: { fontSize: 12, fontWeight: "600" },
  editar: { fontSize: 16 },
  deletar: { fontSize: 16, color: "#e74c3c", fontWeight: "bold" },
  cliente: { fontSize: 16, fontWeight: "600", color: "#1a1a2e", marginBottom: 4 },
  detalhe: { fontSize: 14, color: "#666", marginBottom: 2 },
  observacao: { fontSize: 13, color: "#888", marginTop: 4, fontStyle: "italic" },
  form: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12 },
  formTitulo: { fontSize: 16, fontWeight: "600", color: "#1a1a2e", marginBottom: 16 },
  label: { fontSize: 14, color: "#666", marginBottom: 8 },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  statusBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#ddd" },
  statusBtnAtivo: { backgroundColor: "#1a1a2e", borderColor: "#1a1a2e" },
  statusBtnTexto: { fontSize: 12, color: "#666" },
  statusBtnTextoAtivo: { color: "#fff" },
  row: { flexDirection: "row", gap: 8 },
  inputMeio: { flex: 1 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14 },
  inputObservacao: { height: 80, textAlignVertical: "top" },
  botao: { backgroundColor: "#1a1a2e", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  botaoTexto: { color: "#fff", fontSize: 16, fontWeight: "600" },
  botaoCancelar: { borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8, marginBottom: 24 },
  botaoCancelarTexto: { color: "#888", fontSize: 16 },
});