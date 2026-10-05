import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Titulo from "../components/Titulo";

const PERIODOS = {
  semana: {
    label: "Esta semana",
    ventas: [
      { label: "Lun", value: 120 },
      { label: "Mar", value: 185 },
      { label: "Mié", value: 95 },
      { label: "Jue", value: 240 },
      { label: "Vie", value: 310 },
      { label: "Sáb", value: 280 },
      { label: "Dom", value: 145 },
    ],
    clientes: 18,
    ticket: "$19.40",
    total: "$1,375",
  },
  mes: {
    label: "Este mes",
    ventas: [
      { label: "Sem 1", value: 680 },
      { label: "Sem 2", value: 920 },
      { label: "Sem 3", value: 760 },
      { label: "Sem 4", value: 1_248 },
    ],
    clientes: 46,
    ticket: "$27.12",
    total: "$3,608",
  },
  año: {
    label: "Este año",
    ventas: [
      { label: "Ene", value: 2_140 },
      { label: "Feb", value: 2_680 },
      { label: "Mar", value: 2_420 },
      { label: "Abr", value: 3_120 },
      { label: "May", value: 3_480 },
      { label: "Jun", value: 3_050 },
    ],
    clientes: 182,
    ticket: "$24.86",
    total: "$16,890",
  },
};

const PRODUCTOS_TOP = [
  { nombre: "Café molido 500 g", ventas: 86, color: "#1f6f5b" },
  { nombre: "Pan artesanal", ventas: 64, color: "#c2643d" },
  { nombre: "Mermelada casera", ventas: 48, color: "#d69a38" },
  { nombre: "Galletas de avena", ventas: 35, color: "#6b8e7e" },
];

export default function AnaliticaScreen() {
  const [periodo, setPeriodo] = useState("mes");
  const datos = PERIODOS[periodo];
  const maxVenta = Math.max(...datos.ventas.map((item) => item.value));
  const maxProducto = PRODUCTOS_TOP[0].ventas;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Titulo texto="Analítica" subtitulo="Entiende el rendimiento de tu negocio" />

        <View style={styles.periodSelector} accessibilityRole="tablist">
          {Object.entries(PERIODOS).map(([id, data]) => {
            const activo = periodo === id;
            return (
              <TouchableOpacity
                key={id}
                style={[styles.periodButton, activo && styles.periodButtonActive]}
                onPress={() => setPeriodo(id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: activo }}
                accessibilityLabel={`Ver estadísticas de ${data.label.toLowerCase()}`}
              >
                <Text style={[styles.periodText, activo && styles.periodTextActive]}>
                  {id === "semana" ? "Semana" : id === "mes" ? "Mes" : "Año"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.summaryGrid}>
          <MetricCard icono="$" label="Ventas" value={datos.total} trend="↑ 12.8%" />
          <MetricCard icono="♙" label="Clientes" value={datos.clientes} trend="↑ 8.4%" />
          <MetricCard icono="◈" label="Ticket promedio" value={datos.ticket} trend="↑ 4.2%" />
        </View>

        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Ventas por período</Text>
              <Text style={styles.cardSubtitle}>{datos.label} · valores en dólares</Text>
            </View>
            <Text style={styles.chartIcon}>▥</Text>
          </View>
          <View style={styles.chart} accessibilityLabel={`Gráfico de ventas ${datos.label.toLowerCase()}`}>
            {datos.ventas.map((item) => (
              <View key={item.label} style={styles.barColumn}>
                <Text style={styles.barValue}>${item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.bar, { height: `${Math.max((item.value / maxVenta) * 100, 8)}%` }]} />
                </View>
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Productos más vendidos</Text>
              <Text style={styles.cardSubtitle}>Unidades vendidas en {datos.label.toLowerCase()}</Text>
            </View>
            <Text style={styles.chartIcon}>★</Text>
          </View>
          {PRODUCTOS_TOP.map((producto) => (
            <View key={producto.nombre} style={styles.productRow} accessibilityLabel={`${producto.nombre}, ${producto.ventas} unidades vendidas`}>
              <View style={styles.productTitleRow}>
                <Text style={styles.productName}>{producto.nombre}</Text>
                <Text style={styles.productValue}>{producto.ventas} uds.</Text>
              </View>
              <View style={styles.productTrack}>
                <View style={[styles.productBar, { width: `${(producto.ventas / maxProducto) * 100}%`, backgroundColor: producto.color }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.clientsCard}>
          <View style={styles.clientsIcon}><Text style={styles.clientsIconText}>♙</Text></View>
          <View style={styles.clientsCopy}>
            <Text style={styles.cardTitle}>Clientes activos</Text>
            <Text style={styles.cardSubtitle}>Personas que compraron en {datos.label.toLowerCase()}</Text>
          </View>
          <Text style={styles.clientsValue}>{datos.clientes}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function MetricCard({ icono, label, value, trend }) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIcon}><Text style={styles.metricIconText}>{icono}</Text></View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTrend}>{trend}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7f2" },
  content: { padding: 16, paddingBottom: 30 },
  periodSelector: { flexDirection: "row", backgroundColor: "#e8ece5", borderRadius: 10, padding: 3, marginBottom: 16 },
  periodButton: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 8 },
  periodButtonActive: { backgroundColor: "#1f6f5b" },
  periodText: { color: "#748078", fontSize: 13, fontWeight: "700" },
  periodTextActive: { color: "#fffdf8" },
  summaryGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  metricCard: { width: "31.5%", backgroundColor: "#fffdf8", borderWidth: 1, borderColor: "#e2e5dc", borderRadius: 10, padding: 10 },
  metricIcon: { width: 26, height: 26, borderRadius: 8, backgroundColor: "#dceee6", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  metricIconText: { color: "#1f6f5b", fontWeight: "800", fontSize: 14 },
  metricLabel: { color: "#748078", fontSize: 10, marginBottom: 4 },
  metricValue: { color: "#20352f", fontSize: 16, fontWeight: "800" },
  metricTrend: { color: "#1f6f5b", fontSize: 10, fontWeight: "700", marginTop: 5 },
  chartCard: { backgroundColor: "#fffdf8", borderWidth: 1, borderColor: "#e2e5dc", borderRadius: 12, padding: 15, marginBottom: 14 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 },
  cardTitle: { color: "#20352f", fontSize: 15, fontWeight: "800" },
  cardSubtitle: { color: "#748078", fontSize: 11, marginTop: 4 },
  chartIcon: { color: "#c2643d", fontSize: 22, fontWeight: "800" },
  chart: { height: 185, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", borderBottomWidth: 1, borderBottomColor: "#d7ddd8", paddingTop: 12 },
  barColumn: { height: "100%", alignItems: "center", justifyContent: "flex-end", flex: 1, marginHorizontal: 2 },
  barValue: { color: "#748078", fontSize: 9, marginBottom: 5 },
  barTrack: { height: "72%", width: 22, justifyContent: "flex-end", backgroundColor: "#eef1ec", borderRadius: 7, overflow: "hidden" },
  bar: { width: "100%", backgroundColor: "#1f6f5b", borderRadius: 7 },
  barLabel: { color: "#748078", fontSize: 10, marginTop: 7 },
  productRow: { marginBottom: 13 },
  productTitleRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  productName: { color: "#20352f", fontSize: 12, fontWeight: "700" },
  productValue: { color: "#c2643d", fontSize: 12, fontWeight: "800" },
  productTrack: { height: 8, backgroundColor: "#eef1ec", borderRadius: 5, overflow: "hidden" },
  productBar: { height: "100%", borderRadius: 5 },
  clientsCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#20352f", borderRadius: 12, padding: 15 },
  clientsIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#46645a", alignItems: "center", justifyContent: "center", marginRight: 11 },
  clientsIconText: { color: "#dceee6", fontSize: 20 },
  clientsCopy: { flex: 1 },
  clientsCardTitle: { color: "#fffdf8" },
  clientsValue: { color: "#fffdf8", fontSize: 26, fontWeight: "800" },
});
