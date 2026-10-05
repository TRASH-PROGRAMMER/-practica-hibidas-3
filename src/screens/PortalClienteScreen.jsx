import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Titulo from "../components/Titulo";

const SECCIONES = [
  { id: "catalogo", icono: "▣", titulo: "Catálogo" },
  { id: "compras", icono: "$", titulo: "Compras" },
  { id: "facturas", icono: "▤", titulo: "Facturas" },
  { id: "deuda", icono: "≡", titulo: "Mi deuda" },
  { id: "solicitudes", icono: "↗", titulo: "Abonos" },
];

const productos = [
  { id: "1", code: "CAF-500", name: "Café molido 500 g", category: "Alimentos", price: "$8.50", stock: 24 },
  { id: "2", code: "PAN-001", name: "Pan artesanal", category: "Panadería", price: "$2.25", stock: 12 },
  { id: "3", code: "MER-250", name: "Mermelada casera", category: "Conservas", price: "$4.00", stock: 8 },
  { id: "4", code: "GAL-100", name: "Galletas de avena", category: "Panadería", price: "$3.75", stock: 15 },
];

const compras = [
  { id: "V-018", date: "02 oct 2026", items: "Café molido · Pan artesanal", total: "$18.75", status: "Entregada" },
  { id: "V-011", date: "18 sep 2026", items: "Mermelada · Galletas de avena", total: "$11.50", status: "Entregada" },
  { id: "V-004", date: "04 sep 2026", items: "Café molido 500 g", total: "$8.50", status: "Entregada" },
];

const facturas = [
  { id: "F-1048", date: "02 oct 2026", total: "$18.75", status: "Pendiente" },
  { id: "F-1031", date: "18 sep 2026", total: "$11.50", status: "Pagada" },
  { id: "F-1012", date: "04 sep 2026", total: "$8.50", status: "Pagada" },
];

export default function PortalClienteScreen({ usuario }) {
  const [seccion, setSeccion] = useState("catalogo");
  const [solicitudes, setSolicitudes] = useState([
    { id: "AB-003", date: "02 oct 2026", amount: "$10.00", status: "En revisión", note: "Abono a factura F-1048" },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [abono, setAbono] = useState({ amount: "", note: "" });
  const [errores, setErrores] = useState({});

  const abrirSolicitud = () => {
    setAbono({ amount: "", note: "" });
    setErrores({});
    setModalVisible(true);
  };

  const enviarSolicitud = () => {
    const amount = Number(abono.amount.replace(",", "."));
    const nuevosErrores = {};
    if (!Number.isFinite(amount) || amount <= 0) nuevosErrores.amount = "Escribe un monto mayor que 0.";
    if (amount > 89.5) nuevosErrores.amount = "El abono no puede superar tu saldo pendiente.";
    if (abono.note.trim().length < 5) nuevosErrores.note = "Cuéntanos a qué factura corresponde el abono.";

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setSolicitudes((actuales) => [
      {
        id: `AB-${String(actuales.length + 4).padStart(3, "0")}`,
        date: "02 oct 2026",
        amount: `$${amount.toFixed(2)}`,
        status: "En revisión",
        note: abono.note.trim(),
      },
      ...actuales,
    ]);
    setModalVisible(false);
    setSeccion("solicitudes");
    Alert.alert("Solicitud enviada", "El negocio revisará tu solicitud y te avisará cuando cambie su estado.");
  };

  const cancelarSolicitud = (id) => {
    Alert.alert("Cancelar solicitud", "¿Quieres retirar esta solicitud de abono?", [
      { text: "Volver", style: "cancel" },
      {
        text: "Cancelar solicitud",
        style: "destructive",
        onPress: () => setSolicitudes((actuales) => actuales.map((item) => (
          item.id === id ? { ...item, status: "Cancelada" } : item
        ))),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Titulo texto="Portal del cliente" subtitulo="Consulta tus productos, compras y pagos" />

        <View style={styles.welcomeCard}>
          <View>
            <Text style={styles.welcomeEyebrow}>Hola, {usuario?.nombre || "cliente"}</Text>
            <Text style={styles.welcomeTitle}>Todo tu historial en un solo lugar</Text>
          </View>
          <Text style={styles.welcomeIcon}>◉</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {SECCIONES.map((item) => {
            const activo = seccion === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.tab, activo && styles.tabActive]}
                onPress={() => setSeccion(item.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: activo }}
                accessibilityLabel={`Ver ${item.titulo}`}
              >
                <Text style={[styles.tabIcon, activo && styles.tabTextActive]}>{item.icono}</Text>
                <Text style={[styles.tabText, activo && styles.tabTextActive]}>{item.titulo}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {seccion === "catalogo" && <Catalogo onSolicitar={abrirSolicitud} />}
        {seccion === "compras" && <ListaCompras />}
        {seccion === "facturas" && <ListaFacturas />}
        {seccion === "deuda" && <ResumenDeuda onSolicitar={abrirSolicitud} />}
        {seccion === "solicitudes" && (
          <ListaSolicitudes solicitudes={solicitudes} onSolicitar={abrirSolicitud} onCancelar={cancelarSolicitud} />
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Solicitar un abono</Text>
                <Text style={styles.modalSubtitle}>El negocio revisará tu solicitud</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} accessibilityLabel="Cerrar solicitud">
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formContent}>
              <Text style={styles.fieldLabel}>$ Monto del abono</Text>
              <TextInput
                style={[styles.input, errores.amount && styles.inputError]}
                value={abono.amount}
                onChangeText={(amount) => {
                  setAbono((actual) => ({ ...actual, amount }));
                  setErrores((actual) => ({ ...actual, amount: "" }));
                }}
                placeholder="Ej. 25.00"
                placeholderTextColor="#9aa59d"
                keyboardType="decimal-pad"
                accessibilityLabel="Monto del abono"
              />
              {errores.amount ? <Text style={styles.errorText}>! {errores.amount}</Text> : null}

              <Text style={styles.fieldLabel}>▤ Referencia o comentario</Text>
              <TextInput
                style={[styles.input, styles.textArea, errores.note && styles.inputError]}
                value={abono.note}
                onChangeText={(note) => {
                  setAbono((actual) => ({ ...actual, note }));
                  setErrores((actual) => ({ ...actual, note: "" }));
                }}
                placeholder="Ej. Abono a factura F-1048"
                placeholderTextColor="#9aa59d"
                multiline
                numberOfLines={3}
                accessibilityLabel="Referencia del abono"
              />
              {errores.note ? <Text style={styles.errorText}>! {errores.note}</Text> : null}

              <TouchableOpacity style={styles.primaryButton} onPress={enviarSolicitud} accessibilityRole="button">
                <Text style={styles.primaryButtonIcon}>↗</Text>
                <Text style={styles.primaryButtonText}>Enviar solicitud</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function Catalogo({ onSolicitar }) {
  return (
    <View>
      <SectionHeading title="Productos disponibles" subtitle="Consulta precios y disponibilidad antes de comprar." />
      {productos.map((producto) => (
        <TouchableOpacity key={producto.id} style={styles.card} onPress={() => Alert.alert(producto.name, `${producto.category}\n${producto.stock} unidades disponibles`)}>
          <View style={styles.cardIcon}><Text style={styles.cardIconText}>▣</Text></View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{producto.name}</Text>
            <Text style={styles.cardDetail}>{producto.code} · {producto.category}</Text>
            <Text style={styles.stockText}>{producto.stock} disponibles</Text>
          </View>
          <Text style={styles.price}>{producto.price}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.secondaryButton} onPress={onSolicitar}>
        <Text style={styles.secondaryButtonText}>↗ Solicitar un abono</Text>
      </TouchableOpacity>
    </View>
  );
}

function ListaCompras() {
  return (
    <View>
      <SectionHeading title="Mis compras" subtitle="Historial de pedidos realizados." />
      {compras.map((compra) => (
        <TouchableOpacity key={compra.id} style={styles.listCard} onPress={() => Alert.alert(compra.id, `${compra.items}\nTotal: ${compra.total}`)}>
          <View style={styles.listTop}><Text style={styles.cardTitle}>{compra.id}</Text><StatusBadge status={compra.status} /></View>
          <Text style={styles.cardDetail}>{compra.date} · {compra.items}</Text>
          <Text style={styles.listTotal}>{compra.total}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ListaFacturas() {
  return (
    <View>
      <SectionHeading title="Mis facturas" subtitle="Comprobantes asociados a tus compras." />
      {facturas.map((factura) => (
        <TouchableOpacity key={factura.id} style={styles.listCard} onPress={() => Alert.alert(factura.id, `Emitida el ${factura.date}\nTotal: ${factura.total}`)}>
          <View style={styles.listTop}><Text style={styles.cardTitle}>▤ {factura.id}</Text><StatusBadge status={factura.status} /></View>
          <Text style={styles.cardDetail}>Fecha de emisión: {factura.date}</Text>
          <Text style={styles.listTotal}>{factura.total}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ResumenDeuda({ onSolicitar }) {
  return (
    <View>
      <SectionHeading title="Detalle de mi deuda" subtitle="Consulta tu saldo y las próximas fechas de pago." />
      <View style={styles.debtCard}>
        <Text style={styles.debtLabel}>Saldo pendiente</Text>
        <Text style={styles.debtAmount}>$89.50</Text>
        <View style={styles.debtLine}><Text style={styles.debtMeta}>Total facturado</Text><Text style={styles.debtValue}>$128.75</Text></View>
        <View style={styles.debtLine}><Text style={styles.debtMeta}>Pagado</Text><Text style={styles.debtValue}>$39.25</Text></View>
        <View style={styles.debtLine}><Text style={styles.debtMeta}>Próximo vencimiento</Text><Text style={styles.debtValue}>08 oct 2026</Text></View>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onSolicitar}>
        <Text style={styles.primaryButtonIcon}>↗</Text>
        <Text style={styles.primaryButtonText}>Solicitar un abono</Text>
      </TouchableOpacity>
    </View>
  );
}

function ListaSolicitudes({ solicitudes, onSolicitar, onCancelar }) {
  return (
    <View>
      <SectionHeading title="Mis solicitudes de abono" subtitle="Consulta y gestiona el estado de tus solicitudes." />
      <TouchableOpacity style={styles.primaryButton} onPress={onSolicitar}>
        <Text style={styles.primaryButtonIcon}>+</Text>
        <Text style={styles.primaryButtonText}>Nueva solicitud</Text>
      </TouchableOpacity>
      {solicitudes.map((solicitud) => (
        <View key={solicitud.id} style={styles.listCard}>
          <View style={styles.listTop}><Text style={styles.cardTitle}>{solicitud.id}</Text><StatusBadge status={solicitud.status} /></View>
          <Text style={styles.cardDetail}>{solicitud.note}</Text>
          <View style={styles.requestBottom}><Text style={styles.cardDetail}>{solicitud.date}</Text><Text style={styles.listTotal}>{solicitud.amount}</Text></View>
          {solicitud.status === "En revisión" && (
            <TouchableOpacity onPress={() => onCancelar(solicitud.id)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancelar solicitud</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

function SectionHeading({ title, subtitle }) {
  return <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sectionSubtitle}>{subtitle}</Text></View>;
}

function StatusBadge({ status }) {
  const pending = status === "Pendiente" || status === "En revisión";
  return <View style={[styles.badge, pending ? styles.badgePending : styles.badgeSuccess]}><Text style={styles.badgeText}>{status}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7f2" },
  content: { padding: 16, paddingBottom: 30 },
  welcomeCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#1f6f5b", borderRadius: 14, padding: 18, marginBottom: 16 },
  welcomeEyebrow: { color: "#bfe4d4", fontSize: 12, fontWeight: "700", marginBottom: 5 },
  welcomeTitle: { color: "#fffdf8", fontSize: 17, fontWeight: "800", maxWidth: 250 },
  welcomeIcon: { color: "#dceee6", fontSize: 36 },
  tabs: { paddingBottom: 18, gap: 8 },
  tab: { alignItems: "center", justifyContent: "center", minWidth: 78, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "#e8ece5" },
  tabActive: { backgroundColor: "#dceee6" },
  tabIcon: { color: "#748078", fontSize: 18, fontWeight: "700", marginBottom: 3 },
  tabText: { color: "#748078", fontSize: 11, fontWeight: "700" },
  tabTextActive: { color: "#1f6f5b" },
  sectionHeading: { marginBottom: 12 },
  sectionTitle: { color: "#20352f", fontSize: 18, fontWeight: "800" },
  sectionSubtitle: { color: "#748078", fontSize: 12, marginTop: 4, lineHeight: 17 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fffdf8", borderWidth: 1, borderColor: "#e2e5dc", borderRadius: 11, padding: 13, marginBottom: 10 },
  cardIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: "#fff1e8", alignItems: "center", justifyContent: "center", marginRight: 10 },
  cardIconText: { color: "#c2643d", fontSize: 20, fontWeight: "800" },
  cardBody: { flex: 1, marginRight: 8 },
  cardTitle: { color: "#20352f", fontSize: 14, fontWeight: "800" },
  cardDetail: { color: "#748078", fontSize: 12, marginTop: 5 },
  stockText: { color: "#1f6f5b", fontSize: 11, fontWeight: "700", marginTop: 4 },
  price: { color: "#c2643d", fontSize: 15, fontWeight: "800" },
  listCard: { backgroundColor: "#fffdf8", borderWidth: 1, borderColor: "#e2e5dc", borderRadius: 11, padding: 14, marginBottom: 10 },
  listTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  listTotal: { color: "#c2643d", fontSize: 15, fontWeight: "800", marginTop: 9 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  badgePending: { backgroundColor: "#fff1e8" },
  badgeSuccess: { backgroundColor: "#dceee6" },
  badgeText: { color: "#1f6f5b", fontSize: 10, fontWeight: "800" },
  debtCard: { backgroundColor: "#20352f", borderRadius: 14, padding: 18, marginBottom: 14 },
  debtLabel: { color: "#bfe4d4", fontSize: 12, fontWeight: "700" },
  debtAmount: { color: "#fffdf8", fontSize: 30, fontWeight: "800", marginVertical: 8 },
  debtLine: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#46645a", paddingTop: 10, marginTop: 8 },
  debtMeta: { color: "#c5d3cc", fontSize: 12 },
  debtValue: { color: "#fffdf8", fontSize: 12, fontWeight: "700" },
  requestBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cancelButton: { borderTopWidth: 1, borderTopColor: "#e5e8df", marginTop: 12, paddingTop: 10 },
  cancelButtonText: { color: "#b65335", fontSize: 12, fontWeight: "700" },
  primaryButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#1f6f5b", borderRadius: 10, paddingVertical: 13, marginBottom: 14 },
  primaryButtonIcon: { color: "#fffdf8", fontSize: 17, fontWeight: "800", marginRight: 7 },
  primaryButtonText: { color: "#fffdf8", fontSize: 14, fontWeight: "800" },
  secondaryButton: { alignItems: "center", paddingVertical: 14 },
  secondaryButtonText: { color: "#1f6f5b", fontSize: 13, fontWeight: "800" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(24, 37, 32, 0.46)" },
  modalCard: { backgroundColor: "#fffdf8", borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: "#e5e8df" },
  modalTitle: { color: "#20352f", fontSize: 19, fontWeight: "800" },
  modalSubtitle: { color: "#748078", fontSize: 12, marginTop: 4 },
  closeText: { color: "#748078", fontSize: 30, lineHeight: 27 },
  formContent: { padding: 20, paddingBottom: 28 },
  fieldLabel: { color: "#20352f", fontSize: 13, fontWeight: "700", marginBottom: 7, marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#d7ddd8", borderRadius: 9, backgroundColor: "#ffffff", color: "#20352f", fontSize: 14, paddingHorizontal: 12, paddingVertical: 11 },
  textArea: { minHeight: 78, textAlignVertical: "top" },
  inputError: { borderColor: "#c2643d", backgroundColor: "#fff8f3" },
  errorText: { color: "#b65335", fontSize: 11, marginTop: 4 },
});
