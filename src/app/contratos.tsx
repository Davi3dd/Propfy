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

export default function ContratosScreen() {
  const [contratos, setContratos] = useState<any[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [cliente, setCliente] = useState("");
  const [imovel, setImovel] = useState("");
  const [valorAluguel, setValorAluguel] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [observacao, setObservacao] = useState("");

  const buscarContratos = async () => {
    const snapshot = await getDocs(collection(db, "contratos"));
    setContratos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    buscarContratos();
  }, []);

  const formatarValor = (text: string) => {
    const numero = text.replace(/\D/g, "");
    const formatado = numero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setValorAluguel(formatado ? `R$ ${formatado}` : "");
  };

  const formatarData = (text: string, setter: (v: string) => void) => {
    const n = text.replace(/\D/g, "");
    if (n.length <= 2) return setter(n);
    if (n.length <= 4) return setter(`${n.slice(0, 2)}/${n.slice(2)}`);
    setter(`${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4, 8)}`);
  };

  const parseData = (dataStr: string) => {
    const [dia, mes, ano] = dataStr.split("/");
    return new Date(+ano, +mes - 1, +dia);
  };

  const diasDiferenca = (data: Date) => {
    const hoje = new Date();
    return Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calcularAlertas = (dataInicioStr: string, dataVencStr: string) => {
    const alertas = [];

    if (dataVencStr && dataVencStr.length === 10) {
      const vencimento = parseData(dataVencStr);
      const diasVenc = diasDiferenca(vencimento);
      if (diasVenc < 0)
        alertas.push({ texto: "⛔ Contrato vencido", cor: "#e74c3c" });
      else if (diasVenc <= 30)
        alertas.push({
          texto: `⚠️ Renovação em ${diasVenc} dias`,
          cor: "#e74c3c",
        });
      else if (diasVenc <= 90)
        alertas.push({
          texto: `🔔 Renovação em ${diasVenc} dias`,
          cor: "#f39c12",
        });
      else
        alertas.push({ texto: `✅ Vence em ${diasVenc} dias`, cor: "#2ecc71" });
    }

    if (dataInicioStr && dataInicioStr.length === 10) {
      const inicio = parseData(dataInicioStr);
      const hoje = new Date();
      const mesesAtivos =
        (hoje.getFullYear() - inicio.getFullYear()) * 12 +
        (hoje.getMonth() - inicio.getMonth());
      const proximoReajuste = new Date(inicio);
      proximoReajuste.setMonth(
        inicio.getMonth() + (Math.floor(mesesAtivos / 12) + 1) * 12,
      );
      const diasReajuste = diasDiferenca(proximoReajuste);
      if (diasReajuste <= 30)
        alertas.push({
          texto: `💰 Reajuste em ${diasReajuste} dias`,
          cor: "#e74c3c",
        });
      else if (diasReajuste <= 60)
        alertas.push({
          texto: `💰 Reajuste em ${diasReajuste} dias`,
          cor: "#f39c12",
        });
    }

    return alertas;
  };

  const limparForm = () => {
    setCliente("");
    setImovel("");
    setValorAluguel("");
    setDataInicio("");
    setDataVencimento("");
    setObservacao("");
    setEditandoId(null);
    setMostrarForm(false);
  };

  const abrirEdicao = (item: any) => {
    setEditandoId(item.id);
    setCliente(item.cliente);
    setImovel(item.imovel);
    setValorAluguel(item.valorAluguel);
    setDataInicio(item.dataInicio);
    setDataVencimento(item.dataVencimento);
    setObservacao(item.observacao || "");
    setMostrarForm(true);
  };

  const salvar = async () => {
    if (!cliente || !imovel || !valorAluguel || !dataInicio || !dataVencimento)
      return;
    const dados = {
      cliente,
      imovel,
      valorAluguel,
      dataInicio,
      dataVencimento,
      observacao,
    };
    if (editandoId) {
      await updateDoc(doc(db, "contratos", editandoId), dados);
    } else {
      await addDoc(collection(db, "contratos"), dados);
    }
    limparForm();
    buscarContratos();
  };

  const deletarContrato = async (id: string) => {
    await deleteDoc(doc(db, "contratos", id));
    buscarContratos();
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
        <Text style={styles.titulo}>Contratos</Text>
        <FlatList
          data={contratos}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const alertas = calcularAlertas(
              item.dataInicio,
              item.dataVencimento,
            );
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.acoes}>
                    <TouchableOpacity onPress={() => abrirEdicao(item)}>
                      <Text style={styles.editar}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deletarContrato(item.id)}>
                      <Text style={styles.deletar}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.cliente}>{item.cliente}</Text>
                <Text style={styles.detalhe}>🏠 {item.imovel}</Text>
                <Text style={styles.detalhe}>💰 {item.valorAluguel}/mês</Text>
                <Text style={styles.detalhe}>
                  📅 {item.dataInicio} → {item.dataVencimento}
                </Text>
                {alertas.map((a, i) => (
                  <Text key={i} style={[styles.alerta, { color: a.cor }]}>
                    {a.texto}
                  </Text>
                ))}
                {item.observacao ? (
                  <Text style={styles.observacao}>💬 {item.observacao}</Text>
                ) : null}
              </View>
            );
          }}
        />
        {mostrarForm && (
          <View style={styles.form}>
            <Text style={styles.formTitulo}>
              {editandoId ? "Editar Contrato" : "Novo Contrato"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do cliente"
              value={cliente}
              onChangeText={setCliente}
            />
            <TextInput
              style={styles.input}
              placeholder="Endereço do imóvel"
              value={imovel}
              onChangeText={setImovel}
            />
            <TextInput
              style={styles.input}
              placeholder="Valor do aluguel"
              value={valorAluguel}
              onChangeText={formatarValor}
              keyboardType="numeric"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.inputMeio]}
                placeholder="Início (DD/MM/AAAA)"
                value={dataInicio}
                onChangeText={(t) => formatarData(t, setDataInicio)}
                keyboardType="numeric"
                maxLength={10}
              />
              <TextInput
                style={[styles.input, styles.inputMeio]}
                placeholder="Vencimento (DD/MM/AAAA)"
                value={dataVencimento}
                onChangeText={(t) => formatarData(t, setDataVencimento)}
                keyboardType="numeric"
                maxLength={10}
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
            <Text style={styles.botaoTexto}>+ Novo Contrato</Text>
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
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  acoes: { flexDirection: "row", gap: 12 },
  editar: { fontSize: 16 },
  deletar: { fontSize: 16, color: "#e74c3c", fontWeight: "bold" },
  cliente: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  detalhe: { fontSize: 14, color: "#666", marginBottom: 2 },
  alerta: { fontSize: 13, fontWeight: "600", marginTop: 6 },
  observacao: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
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
  inputMeio: { flex: 1 },
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
