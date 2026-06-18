import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ImoveisScreen() {
  const [imoveis] = useState([
    {
      id: "1",
      endereco: "Rua das Flores, 123",
      valor: "R$ 350.000",
      tipo: "Apartamento",
    },
    { id: "2", endereco: "Av. Brasil, 456", valor: "R$ 500.000", tipo: "Casa" },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Imóveis</Text>

      <FlatList
        data={imoveis}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.tipo}>{item.tipo}</Text>
            <Text style={styles.endereco}>{item.endereco}</Text>
            <Text style={styles.valor}>{item.valor}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.botao}>
        <Text style={styles.botaoTexto}>+ Novo Imóvel</Text>
      </TouchableOpacity>
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
  tipo: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  endereco: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  valor: {
    fontSize: 14,
    color: "#2ecc71",
    fontWeight: "600",
  },
  botao: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  botaoTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
