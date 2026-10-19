import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";

function estimarPresion(altitud) {
  if (typeof altitud !== "number" || !Number.isFinite(altitud)) return null;
  const presion = 1013.25 * Math.pow(1 - 0.0000225577 * altitud, 5.25588);
  return Math.round(presion);
}

export default function SensorUbicacion() {
  const [ubicacion, setUbicacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const obtenerUbicacion = async () => {
    setCargando(true);
    setMensaje("");

    try {
      const serviciosActivos = await Location.hasServicesEnabledAsync();
      if (!serviciosActivos) {
        setMensaje("Activa la ubicación del dispositivo para continuar.");
        return;
      }

      const permiso = await Location.requestForegroundPermissionsAsync();
      if (permiso.status !== "granted") {
        setMensaje("No se concedió permiso. Puedes continuar usando la aplicación.");
        return;
      }

      const resultado = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUbicacion(resultado.coords);
    } catch {
      setMensaje("No pudimos obtener la ubicación. Inténtalo nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  const presion = estimarPresion(ubicacion?.altitude);
  const precision = ubicacion?.accuracy ? Math.round(ubicacion.accuracy) : null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⌖</Text>
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Ubicación actual</Text>
          <Text style={styles.subtitle}>Consulta tu posición con permiso temporal</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={obtenerUbicacion}
        disabled={cargando}
        accessibilityRole="button"
        accessibilityLabel="Obtener ubicación actual"
        accessibilityState={{ busy: cargando, disabled: cargando }}
        activeOpacity={0.8}
      >
        {cargando ? <ActivityIndicator color="#fffdf8" size="small" /> : <Text style={styles.buttonIcon}>⌖</Text>}
        <Text style={styles.buttonText}>{cargando ? "Obteniendo ubicación..." : "Obtener ubicación"}</Text>
      </TouchableOpacity>

      {mensaje ? (
        <View style={styles.messageBox} accessibilityLiveRegion="polite">
          <Text style={styles.messageIcon}>!</Text>
          <Text style={styles.messageText}>{mensaje}</Text>
        </View>
      ) : null}

      {ubicacion ? (
        <View style={styles.dataGrid} accessibilityLiveRegion="polite">
          <DatoUbicacion icono="N" label="Latitud" value={`${ubicacion.latitude.toFixed(6)}°`} />
          <DatoUbicacion icono="E" label="Longitud" value={`${ubicacion.longitude.toFixed(6)}°`} />
          <DatoUbicacion icono="≈" label="Presión aprox." value={presion ? `${presion} hPa` : "No disponible"} />
          <DatoUbicacion icono="±" label="Precisión" value={precision ? `±${precision} m` : "No disponible"} />
          <Text style={styles.note}>
            La presión es una estimación según la altitud, no una lectura directa de un barómetro.
          </Text>
        </View>
      ) : (
        <Text style={styles.emptyText}>Aún no has consultado tu ubicación.</Text>
      )}
    </View>
  );
}

function DatoUbicacion({ icono, label, value }) {
  return (
    <View style={styles.dataItem} accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.dataIcon}><Text style={styles.dataIconText}>{icono}</Text></View>
      <View style={styles.dataCopy}>
        <Text style={styles.dataLabel}>{label}</Text>
        <Text style={styles.dataValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fffdf8", borderWidth: 1, borderColor: "#e2e5dc", borderRadius: 12, padding: 16, marginBottom: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  iconContainer: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#dceee6", alignItems: "center", justifyContent: "center", marginRight: 11 },
  icon: { color: "#1f6f5b", fontSize: 27, fontWeight: "800" },
  headerCopy: { flex: 1 },
  title: { color: "#20352f", fontSize: 16, fontWeight: "800" },
  subtitle: { color: "#748078", fontSize: 11, marginTop: 4, lineHeight: 16 },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#1f6f5b", borderRadius: 10, minHeight: 46, paddingHorizontal: 14 },
  buttonIcon: { color: "#fffdf8", fontSize: 19, fontWeight: "800", marginRight: 7 },
  buttonText: { color: "#fffdf8", fontSize: 14, fontWeight: "800" },
  messageBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff1e8", borderRadius: 8, padding: 10, marginTop: 12 },
  messageIcon: { color: "#b65335", fontWeight: "800", fontSize: 15, marginRight: 8 },
  messageText: { flex: 1, color: "#b65335", fontSize: 12, lineHeight: 17 },
  dataGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 14 },
  dataItem: { width: "48%", flexDirection: "row", alignItems: "center", backgroundColor: "#f6f7f2", borderRadius: 9, padding: 9, marginBottom: 8 },
  dataIcon: { width: 25, height: 25, borderRadius: 7, backgroundColor: "#fff1e8", alignItems: "center", justifyContent: "center", marginRight: 7 },
  dataIconText: { color: "#c2643d", fontSize: 11, fontWeight: "800" },
  dataCopy: { flex: 1 },
  dataLabel: { color: "#748078", fontSize: 10 },
  dataValue: { color: "#20352f", fontSize: 12, fontWeight: "800", marginTop: 2 },
  note: { color: "#748078", fontSize: 10, lineHeight: 15, marginTop: 2, width: "100%" },
  emptyText: { color: "#748078", fontSize: 12, marginTop: 13 },
});
