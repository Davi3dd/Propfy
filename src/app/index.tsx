import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { db } from "../services/firebase";

export default function DashboardScreen() {
  const [totalImoveis, setTotalImoveis] = useState(0);
  const [totalVisitas, setTotalVisitas] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalContratos, setTotalContratos] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getDocs(collection(db, "imoveis")).then((s) => setTotalImoveis(s.size));
      getDocs(collection(db, "visitas")).then((s) => setTotalVisitas(s.size));
      getDocs(collection(db, "clientes")).then((s) => setTotalClientes(s.size));
      getDocs(collection(db, "contratos")).then((s) =>
        setTotalContratos(s.size),
      );
    }, []),
  );

  const cards = [
    { titulo: "Imóveis", valor: totalImoveis, icone: "home", cor: "#3498db" },
    {
      titulo: "Visitas",
      valor: totalVisitas,
      icone: "calendar",
      cor: "#2ecc71",
    },
    {
      titulo: "Clientes",
      valor: totalClientes,
      icone: "people",
      cor: "#9b59b6",
    },
    {
      titulo: "Contratos",
      valor: totalContratos,
      icone: "document-text",
      cor: "#e67e22",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text style={styles.titulo}>Propfy</Text>
      <Text style={styles.subtitulo}>Bem-vinda, Denise! 👋</Text>

      <View style={styles.grid}>
        {cards.map((card) => (
          <View
            key={card.titulo}
            style={[styles.card, { borderLeftColor: card.cor }]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: card.cor + "20" },
              ]}
            >
              <Ionicons name={card.icone as any} size={28} color={card.cor} />
            </View>
            <Text style={styles.cardNumero}>{card.valor}</Text>
            <Text style={styles.cardTexto}>{card.titulo}</Text>
          </View>
        ))}
      </View>
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
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  subtitulo: { fontSize: 16, color: "#666", marginBottom: 32 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "47%",
    borderLeftWidth: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardNumero: { fontSize: 32, fontWeight: "bold", color: "#1a1a2e" },
  cardTexto: { fontSize: 13, color: "#666", marginTop: 2 },
});
