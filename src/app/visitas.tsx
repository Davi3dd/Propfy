import { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function VisitasScreen() {
  const [visitas, setVisitas] = useState([
    {
      id: "1",
      cliente: "Maria Silva",
      imovel: "Rua das Flores, 123",
      data: "20/06/2026",
      horario: "10:00",
      status: "Agendada",
      observacao: "",
    },
    {
      id: "2",
      cliente: "João Santos",
      imovel: "Av. Brasil, 456",
      data: "22/06/2026",
      horario: "14:30",
      status: "Confirmada",
      observacao: "Cliente prefere entrada pela lateral",
    },
  ]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cliente, setCliente] = useState("");
  const [imovel, setImovel] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [status, setStatus] = useState("Agendada");
  const [observacao, setObservacao] = useState("");

  const formatarData = (text: string) => {
    const numeros = text.replace(/\D/g, "");
    if (numeros.length <= 2) return setData(numeros);
    if (numeros.length <= 4)
      return setData(`${numeros.slice(0, 2)}/${numeros.slice(2)}`);
    setData(
      `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`,
    );
  };

  const formatarHorario = (text: string) => {
    const numeros = text.replace(/\D/g, "");
    if (numeros.length <= 2) return setHorario(numeros);
    setHorario(`${numeros.slice(0, 2)}:${numeros.slice(2, 4)}`);
  };

  const adicionarVisita = () => {
    if (!cliente || !imovel || !data || !horario) return;
    setVisitas([
      ...visitas,
      {
        id: Date.now().toString(),
        cliente,
        imovel,
        data,
        horario,
        status,
        observacao,
      },
    ]);
    setCliente("");
    setImovel("");
    setData("");
    setHorario("");
    setObservacao("");
    setMostrarForm(false);
  };

  const deletarVisita = (id: string) => {
    setVisitas(visitas.filter((item) => item.id !== id));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Visitas</Text>
      <FlatList
        data={visitas}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.status}>{item.status}</Text>
              <TouchableOpacity onPress={() => deletarVisita(item.id)}>
                <Text style={styles.deletar}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.cliente}>{item.cliente}</Text>
            <Text style={styles.detalhe}>{item.imovel}</Text>
            <Text style={styles.detalhe}>
              📅 {item.data} às {item.horario}
            </Text>
            {item.observacao ? (
              <Text style={styles.observacao}>💬 {item.observacao}</Text>
            ) : null}
          </View>
        )}
      />

      {mostrarForm && (
        <View style={styles.form}>
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
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.inputMeio]}
              placeholder="Data (DD/MM/AAAA)"
              value={data}
              onChangeText={formatarData}
              keyboardType="numeric"
              maxLength={10}
            />
            <TextInput
              style={[styles.input, styles.inputMeio]}
              placeholder="Horário (HH:MM)"
              value={horario}
              onChangeText={formatarHorario}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          <TextInput
            style={[styles.input, styles.inputObservacao]}
            placeholder="Observações (opcional)"
            value={observacao}
            onChangeText={setObservacao}
            multiline
          />
          <TouchableOpacity style={styles.botao} onPress={adicionarVisita}>
            <Text style={styles.botaoTexto}>Salvar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!mostrarForm && (
        <TouchableOpacity
          style={styles.botao}
          onPress={() => setMostrarForm(true)}
        >
          <Text style={styles.botaoTexto}>+ Nova Visita</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
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
  status: { fontSize: 12, color: "#888" },
  deletar: { fontSize: 16, color: "#e74c3c", fontWeight: "bold" },
  cliente: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  detalhe: { fontSize: 14, color: "#666", marginBottom: 2 },
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
  row: { flexDirection: "row", gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  inputMeio: { flex: 1 },
  inputObservacao: { height: 80, textAlignVertical: "top" },
  botao: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  botaoTexto: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
