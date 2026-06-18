import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function VisitasScreen() {
  const [visitas] = useState([
    {
      id: "1",
      cliente: "Maria Silva",
      imovel: "Rua das Flores, 123",
      data: "20/06/2026",
      status: "Agendada",
    },
    {
      id: "2",
      cliente: "João Santos",
      imovel: "Av. Brasil, 456",
      data: "22/06/2026",
      status: "Confirmada",
    },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Visitas</Text>
      <FlatList
        data={visitas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.status}>{item.status}</Text>
            <Text style={styles.cliente}>{item.cliente}</Text>
            <Text style={styles.detalhe}>{item.imovel}</Text>
            <Text style={styles.detalhe}>{item.data}</Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.botao}>
        <Text style={styles.botaoTexto}>+ Nova Visita</Text>
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
  status: { fontSize: 12, color: "#888", marginBottom: 4 },
  cliente: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  detalhe: { fontSize: 14, color: "#666" },
  botao: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  botaoTexto: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
