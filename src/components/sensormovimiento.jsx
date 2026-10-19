import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Accelerometer } from "expo-sensors";

const DATOS_INICIALES = { x: 0, y: 0, z: 0 };

export default function SensorMovimiento() {
  const [datos, setDatos] = useState(DATOS_INICIALES);
  const [suscripcion, setSuscripcion] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    return () => {
      suscripcion?.remove();
    };
  }, [suscripcion]);

  const alternarSensor = async () => {
    if (suscripcion) {
      suscripcion.remove();
      setSuscripcion(null);
      setDatos(DATOS_INICIALES);
      return;
    }

    setCargando(true);
    try {
      const disponible = await Accelerometer.isAvailableAsync();
      if (!disponible) {
        Alert.alert("Sensor no disponible", "Este dispositivo no tiene un acelerómetro disponible.");
        return;
      }

      const permiso = await Accelerometer.requestPermissionsAsync();
      if (permiso.status !== "granted") {
        Alert.alert("Permiso no concedido", "Puedes continuar usando la aplicación sin activar el sensor de movimiento.");
        return;
      }

      Accelerometer.setUpdateInterval(250);
      const nuevaSuscripcion = Accelerometer.addListener(setDatos);
      setSuscripcion(nuevaSuscripcion);
    } catch {
      Alert.alert("No se pudo activar", "Intenta activar el sensor de movimiento nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  const intensidad = Math.sqrt((datos.x ** 2) + (datos.y ** 2) + (datos.z ** 2));
  const enMovimiento = Math.abs(intensidad - 1) > 0.08;
  const estado = suscripcion ? (enMovimiento ? "Movimiento detectado" : "En reposo") : "Sensor detenido";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>↕</Text>
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Sensor de movimiento</Text>
          <Text style={styles.subtitle}>Consulta la orientación y actividad del dispositivo</Text>
        </View>
      </View>

      <View style={[styles.statusBox, suscripcion && enMovimiento ? styles.statusActive : styles.statusIdle]} accessibilityLiveRegion="polite">
        <Text style={styles.statusIcon}>{suscripcion && enMovimiento ? "!" : "✓"}</Text>
        <Text style={styles.statusText}>{estado}</Text>
      </View>

      <View style={styles.axisGrid} accessibilityLabel="Valores del acelerómetro">
        <DatoMovimiento eje="X" valor={datos.x} />
        <DatoMovimiento eje="Y" valor={datos.y} />
        <DatoMovimiento eje="Z" valor={datos.z} />
      </View>

      <View style={styles.intensityRow}>
        <Text style={styles.intensityLabel}>Intensidad</Text>
        <Text style={styles.intensityValue}>{intensidad.toFixed(2)} g</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, suscripcion && styles.buttonStop]}
        onPress={alternarSensor}
        disabled={cargando}
        accessibilityRole="button"
        accessibilityLabel={suscripcion ? "Detener sensor de movimiento" : "Activar sensor de movimiento"}
        accessibilityState={{ busy: cargando, disabled: cargando }}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonIcon}>{suscripcion ? "■" : "▶"}</Text>
        <Text style={styles.buttonText}>
          {cargando ? "Activando sensor..." : suscripcion ? "Detener sensor" : "Activar sensor"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>El sensor se detiene automáticamente al salir de esta cuenta.</Text>
    </View>
  );
}

function DatoMovimiento({ eje, valor }) {
  return (
    <View style={styles.axisItem} accessibilityLabel={`Eje ${eje}: ${valor.toFixed(2)} g`}>
      <Text style={styles.axisLabel}>Eje {eje}</Text>
      <Text style={styles.axisValue}>{valor.toFixed(2)} g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fffdf8", borderWidth: 1, borderColor: "#e2e5dc", borderRadius: 12, padding: 16, marginBottom: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  iconContainer: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#fff1e8", alignItems: "center", justifyContent: "center", marginRight: 11 },
  icon: { color: "#c2643d", fontSize: 25, fontWeight: "800" },
  headerCopy: { flex: 1 },
  title: { color: "#20352f", fontSize: 16, fontWeight: "800" },
  subtitle: { color: "#748078", fontSize: 11, lineHeight: 16, marginTop: 4 },
  statusBox: { flexDirection: "row", alignItems: "center", borderRadius: 8, padding: 10, marginBottom: 12 },
  statusActive: { backgroundColor: "#fff1e8" },
  statusIdle: { backgroundColor: "#dceee6" },
  statusIcon: { color: "#1f6f5b", fontSize: 14, fontWeight: "800", marginRight: 8 },
  statusText: { color: "#20352f", fontSize: 12, fontWeight: "700" },
  axisGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  axisItem: { width: "31.5%", backgroundColor: "#f6f7f2", borderRadius: 8, padding: 9 },
  axisLabel: { color: "#748078", fontSize: 10 },
  axisValue: { color: "#20352f", fontSize: 14, fontWeight: "800", marginTop: 4 },
  intensityRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#e5e8df", paddingTop: 11, marginBottom: 12 },
  intensityLabel: { color: "#748078", fontSize: 12 },
  intensityValue: { color: "#c2643d", fontSize: 12, fontWeight: "800" },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#1f6f5b", borderRadius: 10, minHeight: 44 },
  buttonStop: { backgroundColor: "#c2643d" },
  buttonIcon: { color: "#fffdf8", fontSize: 13, fontWeight: "800", marginRight: 7 },
  buttonText: { color: "#fffdf8", fontSize: 14, fontWeight: "800" },
  note: { color: "#748078", fontSize: 10, lineHeight: 15, marginTop: 10 },
});
