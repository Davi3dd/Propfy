import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
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
  const [endereco, setEndereco] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("");

  const buscarImoveis = async () => {
    const snapshot = await getDocs(collection(db, "imoveis"));
    const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setImoveis(lista);
  };

  useEffect(() => {
    buscarImoveis();
  }, []);

  const formatarValor = (text: string) => {
    const numero = text.replace(/\D/g, "");
    const formatado = numero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setValor(formatado ? `R$ ${formatado}` : "");
  };

  const adicionarImovel = async () => {
    if (!endereco || !valor || !tipo) return;
    await addDoc(collection(db, "imoveis"), { endereco, valor, tipo });
    setEndereco("");
    setValor("");
    setTipo("");
    setMostrarForm(false);
    buscarImoveis();
  };

  const deletarImovel = async (id: string) => {
    await deleteDoc(doc(db, "imoveis", id));
    buscarImoveis();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Imóveis</Text>
      <FlatList
        data={imoveis}
        scrollEnabled={false}
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
    marginBottom: 24,
  },
  botaoTexto: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
