import { StyleSheet, View, Text, TouchableOpacity, Platform } from "react-native";

export default function MenuInferior({ pantallaActual, setPantallaActual, esCliente }) {
  const items = esCliente
    ? [
        { id: "inicio", titulo: "Portal", icono: "⌂" },
        { id: "notificaciones", titulo: "Notificaciones", icono: "🔔" },
        { id: "perfil", titulo: "Cuenta", icono: "○" },
      ]
    : [
        { id: "inicio", titulo: "Panel", icono: "⌂" },
        { id: "ventas", titulo: "Ventas", icono: "$" },
        { id: "analitica", titulo: "Analítica", icono: "▥" },
        { id: "solicitudes", titulo: "Pagos", icono: "↗" },
        { id: "notificaciones", titulo: "Notificaciones", icono: "🔔" },
        { id: "perfil", titulo: "Cuenta", icono: "○" },
      ];

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const activo = pantallaActual === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.boton, activo && styles.botonActivo]}
            onPress={() => setPantallaActual(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.icono}>{item.icono}</Text>
            <Text
              style={[styles.texto, activo && styles.textoActivo]}
              numberOfLines={1}
            >
              {item.titulo}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fffdf8",
    borderTopWidth: 1,
    borderTopColor: "#e2e5dc",
    paddingVertical: 8,
    paddingHorizontal: 4,
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  boton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 10,
    flex: 1,
  },
  botonActivo: {
    backgroundColor: "#dceee6",
  },
  icono: {
    fontSize: 18,
    marginBottom: 2,
  },
  texto: {
    fontSize: 9.5,
    fontWeight: "500",
    color: "#748078",
  },
  textoActivo: {
    color: "#1f6f5b",
    fontWeight: "700",
  },
});
