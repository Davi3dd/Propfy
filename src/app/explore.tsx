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

export default function ImoveisScreen() {
  const [imoveis, setImoveis] = useState<any[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [endereco, setEndereco] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("");
  const [quartos, setQuartos] = useState("");
  const [banheiros, setBanheiros] = useState("");
  const [vagas, setVagas] = useState("");
  const [observacao, setObservacao] = useState("");

  const buscarImoveis = async () => {
    const snapshot = await getDocs(collection(db, "imoveis"));
    setImoveis(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    buscarImoveis();
  }, []);

  const formatarValor = (text: string) => {
    const numero = text.replace(/\D/g, "");
    const formatado = numero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setValor(formatado ? `R$ ${formatado}` : "");
  };

  const limparForm = () => {
    setEndereco("");
    setValor("");
    setTipo("");
    setQuartos("");
    setBanheiros("");
    setVagas("");
    setObservacao("");
    setEditandoId(null);
    setMostrarForm(false);
  };

  const abrirEdicao = (item: any) => {
    setEditandoId(item.id);
    setEndereco(item.endereco);
    setValor(item.valor);
    setTipo(item.tipo);
    setQuartos(item.quartos || "");
    setBanheiros(item.banheiros || "");
    setVagas(item.vagas || "");
    setObservacao(item.observacao || "");
    setMostrarForm(true);
  };

  const salvar = async () => {
    if (!endereco || !valor || !tipo) return;
    const dados = {
      endereco,
      valor,
      tipo,
      quartos,
      banheiros,
      vagas,
      observacao,
    };
    if (editandoId) {
      await updateDoc(doc(db, "imoveis", editandoId), dados);
    } else {
      await addDoc(collection(db, "imoveis"), dados);
    }
    limparForm();
    buscarImoveis();
  };

  const deletarImovel = async (id: string) => {
    await deleteDoc(doc(db, "imoveis", id));
    buscarImoveis();
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
        <Text style={styles.titulo}>Imóveis</Text>
        <FlatList
          data={imoveis}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.tipo}>{item.tipo}</Text>
                <View style={styles.acoes}>
                  <TouchableOpacity onPress={() => abrirEdicao(item)}>
                    <Text style={styles.editar}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deletarImovel(item.id)}>
                    <Text style={styles.deletar}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.endereco}>{item.endereco}</Text>
              <Text style={styles.valor}>{item.valor}</Text>
              <View style={styles.detalhesRow}>
                {item.quartos ? (
                  <Text style={styles.detalhe}>🛏 {item.quartos} quartos</Text>
                ) : null}
                {item.banheiros ? (
                  <Text style={styles.detalhe}>
                    🚿 {item.banheiros} banheiros
                  </Text>
                ) : null}
                {item.vagas ? (
                  <Text style={styles.detalhe}>🚗 {item.vagas} vagas</Text>
                ) : null}
              </View>
              {item.observacao ? (
                <Text style={styles.observacao}>💬 {item.observacao}</Text>
              ) : null}
            </View>
          )}
        />
        {mostrarForm && (
          <View style={styles.form}>
            <Text style={styles.formTitulo}>
              {editandoId ? "Editar Imóvel" : "Novo Imóvel"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tipo (Casa, Apto...)"
              value={tipo}
              onChangeText={setTipo}
            />
            <TextInput
              style={styles.input}
              placeholder="Endereço"
              value={endereco}
              onChangeText={setEndereco}
            />
            <TextInput
              style={styles.input}
              placeholder="Valor"
              value={valor}
              onChangeText={formatarValor}
              keyboardType="numeric"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.inputTerceiro]}
                placeholder="Quartos"
                value={quartos}
                onChangeText={setQuartos}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.inputTerceiro]}
                placeholder="Banheiros"
                value={banheiros}
                onChangeText={setBanheiros}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.inputTerceiro]}
                placeholder="Vagas"
                value={vagas}
                onChangeText={setVagas}
                keyboardType="numeric"
              />
            </View>
            <TextInput
              style={[styles.input, styles.inputObservacao]}
              placeholder="Observações"
              value={observacao}
              onChangeText={setObservacao}
              multiline
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
            <Text style={styles.botaoTexto}>+ Novo Imóvel</Text>
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
    marginBottom: 24,
  },
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
    marginBottom: 4,
  },
  acoes: { flexDirection: "row", gap: 12 },
  tipo: { fontSize: 12, color: "#888" },
  editar: { fontSize: 16 },
  deletar: { fontSize: 16, color: "#e74c3c", fontWeight: "bold" },
  endereco: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  valor: { fontSize: 14, color: "#2ecc71", fontWeight: "600", marginBottom: 8 },
  detalhesRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  detalhe: { fontSize: 13, color: "#666" },
  observacao: {
    fontSize: 13,
    color: "#888",
    marginTop: 6,
    fontStyle: "italic",
  },
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
  row: { flexDirection: "row", gap: 8 },
  inputTerceiro: { flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  inputObservacao: { height: 80, textAlignVertical: "top" },
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
