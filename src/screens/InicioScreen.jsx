import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Titulo from "../components/Titulo";

export default function InicioScreen({ usuario, setPantallaActual }) {
  const correoMostrar = usuario?.correo || "yo@live.uleam.edu.ec";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Titulo texto="Panel de ventas" subtitulo="Controla tu negocio desde un solo lugar" />

      {/* Tarjeta de bienvenida */}
      <View style={styles.bienvenidaCard}>
        <Text style={styles.saludo}>Hola, {usuario?.nombre || "administrador"}</Text>
        <Text style={styles.correo}>{correoMostrar}</Text>
        <Text style={styles.carrera}>Resumen del negocio · 02 oct 2026</Text>
      </View>

      {/* Métricas o Resumen */}
      <Text style={styles.seccionTitulo}>Resumen de hoy</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumero}>$1,248</Text>
          <Text style={styles.statLabel}>Ventas del mes</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumero}>18</Text>
          <Text style={styles.statLabel}>Pedidos hoy</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statNumero, { color: "#c2643d" }]}>$89.50</Text>
          <Text style={styles.statLabel}>Por cobrar</Text>
        </View>
      </View>

      {/* Accesos directos rápidos */}
      <Text style={styles.seccionTitulo}>Gestión rápida</Text>
      <View style={styles.accionesContainer}>
        <TouchableOpacity
          style={styles.accionBoton}
          onPress={() => setPantallaActual && setPantallaActual("productos")}
          activeOpacity={0.8}
        >
          <Text style={styles.accionIcono}>▣</Text>
          <View style={styles.accionTextoContainer}>
            <Text style={styles.accionTitulo}>Productos</Text>
            <Text style={styles.accionSubtitulo}>Administra catálogo y existencias</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.accionBoton}
          onPress={() => setPantallaActual && setPantallaActual("ventas")}
          activeOpacity={0.8}
        >
          <Text style={styles.accionIcono}>$</Text>
          <View style={styles.accionTextoContainer}>
            <Text style={styles.accionTitulo}>Ventas</Text>
            <Text style={styles.accionSubtitulo}>Registra pedidos y consulta ingresos</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.grid}>
          {[
            ["facturas", "▤", "Facturas"],
            ["clientes", "♙", "Clientes"],
            ["deudas", "≡", "Deudas"],
            ["solicitudes", "↗", "Solicitudes de pago"],
          ].map(([id, icon, label]) => (
            <TouchableOpacity key={id} style={styles.gridItem} onPress={() => setPantallaActual(id)}>
              <Text style={styles.gridIcon}>{icon}</Text>
              <Text style={styles.gridLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Aviso institucional */}
      <View style={styles.avisoBox}>
        <Text style={styles.avisoTitulo}>Atención de cobros</Text>
        <Text style={styles.avisoTexto}>
          Tienes 2 clientes con pagos pendientes. Revisa Deudas para enviarles un recordatorio.
        </Text>
      </View>
    </ScrollView>
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
  bienvenidaCard: {
    backgroundColor: "#4338ca",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#4338ca",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saludo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  correo: {
    fontSize: 14,
    color: "#e0e7ff",
    marginBottom: 4,
  },
  carrera: {
    fontSize: 12,
    color: "#c7d2fe",
    fontStyle: "italic",
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumero: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4338ca",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "center",
  },
  accionesContainer: {
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 2,
  },
  gridItem: {
    width: "48%",
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: "#e2e5dc",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  gridIcon: {
    color: "#c2643d",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  gridLabel: {
    color: "#20352f",
    fontSize: 13,
    fontWeight: "700",
  },
  accionBoton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  accionIcono: {
    fontSize: 28,
    marginRight: 14,
  },
  accionTextoContainer: {
    flex: 1,
  },
  accionTitulo: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  accionSubtitulo: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  avisoBox: {
    backgroundColor: "#fef3c7",
    borderColor: "#fde68a",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  avisoTitulo: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 4,
  },
  avisoTexto: {
    fontSize: 12,
    color: "#b45309",
    lineHeight: 18,
  },
});
