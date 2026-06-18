import { useFocusEffect } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { db } from "../services/firebase";

export default function DashboardScreen() {
  const [totalImoveis, setTotalImoveis] = useState(0);
  const [totalVisitas, setTotalVisitas] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getDocs(collection(db, "imoveis")).then((s) => setTotalImoveis(s.size));
      getDocs(collection(db, "visitas")).then((s) => setTotalVisitas(s.size));
    }, []),
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Propfy</Text>
      <Text style={styles.subtitulo}>Bem-vinda, corretora!</Text>
      <View style={styles.card}>
        <Text style={styles.cardNumero}>{totalImoveis}</Text>
        <Text style={styles.cardTexto}>Imóveis cadastrados</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardNumero}>{totalVisitas}</Text>
        <Text style={styles.cardTexto}>Visitas agendadas</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardNumero}>0</Text>
        <Text style={styles.cardTexto}>Contratos ativos</Text>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  cardNumero: { fontSize: 36, fontWeight: "bold", color: "#1a1a2e" },
  cardTexto: { fontSize: 14, color: "#666", marginTop: 4 },
});
