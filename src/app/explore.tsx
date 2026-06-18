import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ImoveisScreen() {
  const [imoveis, setImoveis] = useState([
    {
      id: "1",
      endereco: "Rua das Flores, 123",
      valor: "R$ 350.000",
      tipo: "Apartamento",
    },
    { id: "2", endereco: "Av. Brasil, 456", valor: "R$ 500.000", tipo: "Casa" },
  ]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [endereco, setEndereco] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("");

  const formatarValor = (text: string) => {
    const numero = text.replace(/\D/g, "");
    const formatado = numero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setValor(formatado ? `R$ ${formatado}` : "");
  };

  const adicionarImovel = () => {
    if (!endereco || !valor || !tipo) return;
    setImoveis([
      ...imoveis,
      { id: Date.now().toString(), endereco, valor, tipo },
    ]);
    setEndereco("");
    setValor("");
    setTipo("");
    setMostrarForm(false);
  };

  const deletarImovel = (id: string) => {
    setImoveis(imoveis.filter((item) => item.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Imóveis</Text>
      <FlatList
        data={imoveis}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.tipo}>{item.tipo}</Text>
              <TouchableOpacity onPress={() => deletarImovel(item.id)}>
                <Text style={styles.deletar}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.endereco}>{item.endereco}</Text>
            <Text style={styles.valor}>{item.valor}</Text>
          </View>
        )}
      />

      {mostrarForm && (
        <View style={styles.form}>
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
          <TouchableOpacity style={styles.botao} onPress={adicionarImovel}>
            <Text style={styles.botaoTexto}>Salvar</Text>
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
    </View>
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
  tipo: { fontSize: 12, color: "#888" },
  deletar: { fontSize: 16, color: "#e74c3c", fontWeight: "bold" },
  endereco: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  valor: { fontSize: 14, color: "#2ecc71", fontWeight: "600" },
  form: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
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
});
