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
  Switch,
} from "react-native";
import Titulo from "../components/Titulo";

const MODULES = {
  ventas: {
    title: "Ventas",
    subtitle: "Registra pedidos y consulta ingresos",
    action: "Registrar venta",
    emptyLabel: "ventas",
    items: [
      { id: "V-018", name: "Venta V-018", detail: "María González · 02 oct 2026", value: "$42.75" },
      { id: "V-017", name: "Venta V-017", detail: "Carlos Mendoza · 02 oct 2026", value: "$18.50" },
      { id: "V-016", name: "Venta V-016", detail: "Cliente mostrador · 02 oct 2026", value: "$27.90" },
    ],
  },
  productos: {
    title: "Productos",
    subtitle: "Controla tu catálogo y existencias",
    action: "Nuevo producto",
    emptyLabel: "productos",
    items: [
      { id: "1", code: "CAF-500", name: "Café molido 500 g", detail: "SKU CAF-500 · 24 unidades · Alimentos · Activo", value: "$8.50", stock: 24, category: "Alimentos", active: true },
      { id: "2", code: "PAN-001", name: "Pan artesanal", detail: "SKU PAN-001 · 12 unidades · Panadería · Activo", value: "$2.25", stock: 12, category: "Panadería", active: true },
      { id: "3", code: "MER-250", name: "Mermelada casera", detail: "SKU MER-250 · 8 unidades · Conservas · Activo", value: "$4.00", stock: 8, category: "Conservas", active: true },
    ],
  },
  facturas: {
    title: "Facturas",
    subtitle: "Consulta y comparte comprobantes",
    action: "Nueva factura",
    emptyLabel: "facturas",
    items: [
      { id: "F-1048", name: "Factura F-1048", detail: "María González · 02 oct 2026", value: "$42.75" },
      { id: "F-1047", name: "Factura F-1047", detail: "Carlos Mendoza · 01 oct 2026", value: "$18.50" },
      { id: "F-1046", name: "Factura F-1046", detail: "Tienda La Esquina · 30 sep 2026", value: "$76.20" },
    ],
  },
  clientes: {
    title: "Clientes",
    subtitle: "Gestiona tu cartera de clientes",
    action: "Nuevo cliente",
    emptyLabel: "clientes",
    items: [
      { id: "1", name: "María González", detail: "maria@email.com · 5 compras", value: "$42.75" },
      { id: "2", name: "Carlos Mendoza", detail: "carlos@email.com · 3 compras", value: "$18.50" },
      { id: "3", name: "Tienda La Esquina", detail: "contacto@esquina.com · 12 compras", value: "$76.20" },
    ],
  },
  deudas: {
    title: "Deudas",
    subtitle: "Da seguimiento a saldos pendientes",
    action: "Registrar abono",
    emptyLabel: "deudas",
    items: [
      { id: "1", name: "María González", detail: "Vence el 08 oct 2026", value: "$24.00" },
      { id: "2", name: "Carlos Mendoza", detail: "Vence el 12 oct 2026", value: "$65.50" },
    ],
  },
};

export default function GestionScreen({ modulo, setPantallaActual }) {
  const [items, setItems] = useState(MODULES[modulo].items);
  const [modalVisible, setModalVisible] = useState(false);
  const [formulario, setFormulario] = useState({
    codigo: "",
    nombre: "",
    precio: "",
    stock: "",
    categoria: "",
    activo: true,
  });
  const [errores, setErrores] = useState({});
  const config = MODULES[modulo];

  const abrirFormularioProducto = () => {
    setFormulario({ codigo: "", nombre: "", precio: "", stock: "", categoria: "", activo: true });
    setErrores({});
    setModalVisible(true);
  };

  const actualizarCampo = (campo, valor) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    if (errores[campo]) {
      setErrores((actual) => ({ ...actual, [campo]: "" }));
    }
  };

  const validarProducto = () => {
    const nuevosErrores = {};
    const codigo = formulario.codigo.trim().toUpperCase();
    const precio = Number(formulario.precio.replace(",", "."));
    const stock = Number(formulario.stock);

    if (!codigo) nuevosErrores.codigo = "Escribe un código para identificarlo.";
    else if (items.some((item) => item.code?.toUpperCase() === codigo)) nuevosErrores.codigo = "Ese código ya está registrado.";
    if (formulario.nombre.trim().length < 3) nuevosErrores.nombre = "Escribe un nombre de al menos 3 caracteres.";
    if (!Number.isFinite(precio) || precio <= 0) nuevosErrores.precio = "Ingresa un precio mayor que 0.";
    if (!Number.isInteger(stock) || stock < 0) nuevosErrores.stock = "Usa un número entero igual o mayor que 0.";
    if (!formulario.categoria.trim()) nuevosErrores.categoria = "Indica una categoría.";

    setErrores(nuevosErrores);
    return { nuevosErrores, codigo, precio, stock };
  };

  const guardarProducto = () => {
    const { nuevosErrores, codigo, precio, stock } = validarProducto();
    if (Object.keys(nuevosErrores).length > 0) return;

    const nuevoProducto = {
      id: `${Date.now()}`,
      code: codigo,
      name: formulario.nombre.trim(),
      detail: `${codigo} · ${stock} unidades · ${formulario.categoria.trim()} · ${formulario.activo ? "Activo" : "Inactivo"}`,
      value: `$${precio.toFixed(2)}`,
      price: precio,
      stock,
      category: formulario.categoria.trim(),
      active: formulario.activo,
    };
    setItems((currentItems) => [nuevoProducto, ...currentItems]);
    setModalVisible(false);
    Alert.alert("Producto guardado", `${nuevoProducto.name} ya está disponible en tu catálogo.`);
  };

  const crearRegistro = () => {
    if (modulo === "productos") {
      abrirFormularioProducto();
      return;
    }

    const nuevoRegistro = {
      id: `${items.length + 1}`,
      name: modulo === "productos" ? "Nuevo producto" : `Registro ${items.length + 1}`,
      detail: "Pendiente de completar",
      value: "$0.00",
    };
    setItems((currentItems) => [nuevoRegistro, ...currentItems]);
    Alert.alert("Registro creado", `Completa los datos del nuevo registro en ${config.title.toLowerCase()}.`);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Titulo texto={config.title} subtitulo={config.subtitle} />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={crearRegistro}
          accessibilityRole="button"
          accessibilityLabel={`Crear ${config.title.toLowerCase()}`}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>+ {config.action}</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resumen de {config.title.toLowerCase()}</Text>
          <Text style={styles.count}>{items.length}</Text>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Aún no tienes {config.emptyLabel}</Text>
            <Text style={styles.emptyText}>Crea el primer registro para comenzar.</Text>
          </View>
        ) : (
          items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => Alert.alert(item.name, `${item.detail}\nTotal: ${item.value}`)}
              activeOpacity={0.8}
            >
              <View style={styles.cardBody}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetail}>{item.detail}</Text>
              </View>
              <Text style={styles.itemValue}>{item.value}</Text>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => setPantallaActual("inicio")}>
          <Text style={styles.backButtonText}>Volver al panel</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalIcon}>+</Text>
                <View>
                  <Text style={styles.modalTitle}>Nuevo producto</Text>
                  <Text style={styles.modalSubtitle}>Completa la información del catálogo</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Cerrar formulario"
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.formContent}>
              <CampoProducto
                icono="#"
                etiqueta="Código"
                placeholder="Ej. CAF-500"
                value={formulario.codigo}
                onChangeText={(value) => actualizarCampo("codigo", value)}
                error={errores.codigo}
                autoCapitalize="characters"
              />
              <CampoProducto
                icono="Aa"
                etiqueta="Nombre"
                placeholder="Ej. Café molido 500 g"
                value={formulario.nombre}
                onChangeText={(value) => actualizarCampo("nombre", value)}
                error={errores.nombre}
              />
              <View style={styles.fieldRow}>
                <View style={styles.halfField}>
                  <CampoProducto
                    icono="$"
                    etiqueta="Precio"
                    placeholder="0.00"
                    value={formulario.precio}
                    onChangeText={(value) => actualizarCampo("precio", value)}
                    error={errores.precio}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.halfField}>
                  <CampoProducto
                    icono="#"
                    etiqueta="Stock"
                    placeholder="0"
                    value={formulario.stock}
                    onChangeText={(value) => actualizarCampo("stock", value)}
                    error={errores.stock}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
              <CampoProducto
                icono="◇"
                etiqueta="Categoría"
                placeholder="Ej. Alimentos"
                value={formulario.categoria}
                onChangeText={(value) => actualizarCampo("categoria", value)}
                error={errores.categoria}
              />

              <View style={styles.activeRow}>
                <View style={styles.activeTextContainer}>
                  <Text style={styles.activeIcon}>✓</Text>
                  <View>
                    <Text style={styles.activeTitle}>Producto activo</Text>
                    <Text style={styles.activeDescription}>Visible para registrar nuevas ventas</Text>
                  </View>
                </View>
                <Switch
                  value={formulario.activo}
                  onValueChange={(value) => actualizarCampo("activo", value)}
                  trackColor={{ false: "#d7ddd8", true: "#a8d5c3" }}
                  thumbColor={formulario.activo ? "#1f6f5b" : "#f4f4f4"}
                  accessibilityLabel="Producto activo"
                />
              </View>

              {Object.keys(errores).some((campo) => errores[campo]) && (
                <Text style={styles.formErrorSummary}>Revisa los campos marcados para guardar el producto.</Text>
              )}

              <TouchableOpacity
                style={styles.saveButton}
                onPress={guardarProducto}
                accessibilityRole="button"
                accessibilityLabel="Guardar producto"
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonIcon}>✓</Text>
                <Text style={styles.saveButtonText}>Guardar producto</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function CampoProducto({ icono, etiqueta, error, ...inputProps }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        <Text style={styles.fieldIcon}>{icono} </Text>
        {etiqueta}
      </Text>
      <TextInput
        {...inputProps}
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#9aa59d"
        accessibilityLabel={etiqueta}
      />
      {error ? <Text style={styles.errorText}>! {error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7f2" },
  content: { padding: 16, paddingBottom: 28 },
  actionButton: {
    backgroundColor: "#1f6f5b",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 22,
  },
  actionButtonText: { color: "#fffdf5", fontWeight: "700", fontSize: 14 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#20352f" },
  count: {
    minWidth: 28,
    textAlign: "center",
    color: "#1f6f5b",
    backgroundColor: "#dceee6",
    borderRadius: 14,
    paddingVertical: 4,
    fontWeight: "700",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: "#e2e5dc",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  cardBody: { flex: 1, marginRight: 10 },
  itemName: { color: "#20352f", fontWeight: "700", fontSize: 15 },
  itemDetail: { color: "#748078", fontSize: 12, marginTop: 5 },
  itemValue: { color: "#c2643d", fontWeight: "800", fontSize: 15 },
  emptyState: {
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: "#e2e5dc",
    borderRadius: 10,
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: { color: "#20352f", fontSize: 15, fontWeight: "700" },
  emptyText: { color: "#748078", fontSize: 13, marginTop: 6 },
  backButton: { alignItems: "center", paddingVertical: 18 },
  backButtonText: { color: "#1f6f5b", fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(24, 37, 32, 0.46)",
  },
  modalCard: {
    maxHeight: "94%",
    backgroundColor: "#fffdf8",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e8df",
  },
  modalTitleContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
  modalIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#dceee6",
    color: "#1f6f5b",
    fontSize: 26,
    lineHeight: 35,
    textAlign: "center",
    fontWeight: "700",
    marginRight: 11,
  },
  modalTitle: { color: "#20352f", fontSize: 20, fontWeight: "800" },
  modalSubtitle: { color: "#748078", fontSize: 12, marginTop: 3 },
  closeButton: { padding: 3, marginLeft: 10 },
  closeButtonText: { color: "#748078", fontSize: 30, lineHeight: 28 },
  formContent: { padding: 20, paddingBottom: 30 },
  field: { marginBottom: 14, flex: 1 },
  fieldRow: { flexDirection: "row", gap: 10 },
  halfField: { flex: 1 },
  fieldLabel: { color: "#20352f", fontSize: 13, fontWeight: "700", marginBottom: 6 },
  fieldIcon: { color: "#c2643d", fontWeight: "800" },
  input: {
    borderWidth: 1,
    borderColor: "#d7ddd8",
    borderRadius: 9,
    backgroundColor: "#ffffff",
    color: "#20352f",
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  inputError: { borderColor: "#c2643d", backgroundColor: "#fff8f3" },
  errorText: { color: "#b65335", fontSize: 11, marginTop: 4 },
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e8df",
    paddingTop: 15,
    marginTop: 2,
    marginBottom: 18,
  },
  activeTextContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
  activeIcon: {
    color: "#1f6f5b",
    backgroundColor: "#dceee6",
    borderRadius: 14,
    width: 28,
    height: 28,
    lineHeight: 28,
    textAlign: "center",
    fontWeight: "800",
    marginRight: 9,
  },
  activeTitle: { color: "#20352f", fontSize: 13, fontWeight: "700" },
  activeDescription: { color: "#748078", fontSize: 11, marginTop: 3 },
  formErrorSummary: {
    color: "#b65335",
    backgroundColor: "#fff1e8",
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    marginBottom: 12,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f6f5b",
    borderRadius: 10,
    paddingVertical: 14,
  },
  saveButtonIcon: { color: "#fffdf5", fontSize: 16, fontWeight: "800", marginRight: 7 },
  saveButtonText: { color: "#fffdf5", fontSize: 14, fontWeight: "800" },
});
