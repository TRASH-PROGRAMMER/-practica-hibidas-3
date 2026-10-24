import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import Titulo from "../components/Titulo";

export default function SolicitudesScreen({ setPantallaActual }) {
  const solicitudes = [
    {
      id: "1",
      empresa: "María González",
      tipo: "Abono de deuda · Factura F-1048",
      fecha: "02/10/2026",
      estado: "Pendiente",
    },
    {
      id: "2",
      empresa: "Carlos Mendoza",
      tipo: "Pago parcial · Factura F-1042",
      fecha: "01/10/2026",
      estado: "Aprobada",
    },
    {
      id: "3",
      empresa: "Tienda La Esquina",
      tipo: "Solicitud de pago · Factura F-1046",
      fecha: "30/09/2026",
      estado: "En revisión",
    },
  ];

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Aprobada":
        return { bg: "#dcfce7", text: "#15803d" };
      case "En revisión":
        return { bg: "#fef9c3", text: "#a16207" };
      case "Pendiente":
        return { bg: "#fff1e8", text: "#c2643d" };
      default:
        return { bg: "#f1f5f9", text: "#475569" };
    }
  };

  const nuevaSolicitud = () => {
    Alert.alert(
      "Nueva solicitud de pago",
      "La solicitud se registrará para que el cliente pueda revisar y confirmar el abono."
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Titulo
          texto="Solicitudes de pago"
          subtitulo="Revisa abonos y confirma pagos de clientes"
        />

        <TouchableOpacity
          style={styles.botonCrear}
          onPress={nuevaSolicitud}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBotonCrear}>+ Registrar solicitud de pago</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonPush}
          onPress={() => setPantallaActual && setPantallaActual("notificaciones")}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBotonPush}>🔔 Configurar y probar Avisos Push</Text>
        </TouchableOpacity>

        <Text style={styles.listaTitulo}>Actividad reciente</Text>

        {solicitudes.map((item) => {
          const badge = getEstadoColor(item.estado);
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.empresa}>{item.empresa}</Text>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeTexto, { color: badge.text }]}>
                    {item.estado}
                  </Text>
                </View>
              </View>

              <Text style={styles.tipo}>{item.tipo}</Text>
              <Text style={styles.fecha}>Actualizada: {item.fecha}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  botonCrear: {
    backgroundColor: "#4338ca",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  textoBotonCrear: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  botonPush: {
    backgroundColor: "#dceee6",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#b6d8cc",
  },
  textoBotonPush: {
    color: "#1f6f5b",
    fontWeight: "bold",
    fontSize: 14,
  },
  listaTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  empresa: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeTexto: {
    fontSize: 11,
    fontWeight: "700",
  },
  tipo: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },
  fecha: {
    fontSize: 12,
    color: "#94a3b8",
  },
});
