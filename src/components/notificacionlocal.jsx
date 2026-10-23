import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Notifications from "expo-notifications";

const CANAL_ID = "recordatorios-locales";
const MARCADOR = "recordatorio-local-perfil";
const OPCIONES_TIEMPO = [
  { etiqueta: "1 min", segundos: 60 },
  { etiqueta: "5 min", segundos: 300 },
  { etiqueta: "1 hora", segundos: 3600 },
];

export default function NotificacionLocal() {
  const [mensaje, setMensaje] = useState("Es hora de revisar tus pendientes.");
  const [segundos, setSegundos] = useState(OPCIONES_TIEMPO[0].segundos);
  const [recordatorio, setRecordatorio] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [estado, setEstado] = useState("");

  const cargarRecordatorioProgramado = useCallback(async () => {
    try {
      const programadas = await Notifications.getAllScheduledNotificationsAsync();
      const existente = programadas.find(
        (solicitud) => solicitud.content.data?.tipo === MARCADOR,
      );
      if (existente) {
        setRecordatorio({
          identificador: existente.identifier,
          fecha: existente.content.data?.fecha || null,
        });
      } else {
        setRecordatorio(null);
      }
    } catch {
      setEstado("No se pudo consultar el aviso programado en este dispositivo.");
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return undefined;
    cargarRecordatorioProgramado();
    return undefined;
  }, [cargarRecordatorioProgramado]);

  const programarRecordatorio = async () => {
    const texto = mensaje.trim();
    if (!texto) {
      setEstado("Escribe el mensaje que quieres recibir.");
      return;
    }

    setCargando(true);
    setEstado("");
    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(CANAL_ID, {
          name: "Recordatorios locales",
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250],
        });
      }

      const permisosActuales = await Notifications.getPermissionsAsync();
      let permiso = permisosActuales.status;
      if (permiso !== "granted") {
        permiso = (await Notifications.requestPermissionsAsync()).status;
      }
      if (permiso !== "granted") {
        setEstado("No hay permiso para mostrar avisos. Habilita las notificaciones en los ajustes del dispositivo e inténtalo otra vez.");
        return;
      }

      if (recordatorio?.identificador) {
        await Notifications.cancelScheduledNotificationAsync(recordatorio.identificador);
        setRecordatorio(null);
      }

      const fecha = new Date(Date.now() + segundos * 1000);
      const identificador = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Recordatorio local",
          body: texto,
          sound: "default",
          data: { tipo: MARCADOR, fecha: fecha.toISOString() },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: segundos,
          ...(Platform.OS === "android" ? { channelId: CANAL_ID } : {}),
        },
      });

      setRecordatorio({ identificador, fecha: fecha.toISOString() });
      setEstado(`Aviso programado para ${fecha.toLocaleString()}.`);
    } catch {
      setEstado("No se pudo programar el aviso. Comprueba los permisos e inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const cancelarRecordatorio = async () => {
    if (!recordatorio?.identificador) return;
    setCargando(true);
    setEstado("");
    try {
      await Notifications.cancelScheduledNotificationAsync(recordatorio.identificador);
      setRecordatorio(null);
      setEstado("Aviso cancelado.");
    } catch {
      setEstado("No se pudo cancelar el aviso. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  if (Platform.OS === "web") {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Notificación local</Text>
        <Text style={styles.description}>
          La programación de avisos está disponible en la aplicación móvil para Android y iOS.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>◷</Text>
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Notificación local</Text>
          <Text style={styles.description}>
            Programa un aviso en este dispositivo, sin servidor remoto.
          </Text>
        </View>
      </View>

      <Text style={styles.label}>Mensaje del aviso</Text>
      <TextInput
        style={styles.input}
        value={mensaje}
        onChangeText={setMensaje}
        placeholder="Escribe un recordatorio"
        placeholderTextColor="#9aa59d"
        maxLength={120}
        accessibilityLabel="Mensaje del aviso local"
      />

      <Text style={styles.label}>¿Cuándo quieres recibirlo?</Text>
      <View style={styles.options} accessibilityRole="radiogroup">
        {OPCIONES_TIEMPO.map((opcion) => {
          const seleccionada = segundos === opcion.segundos;
          return (
            <TouchableOpacity
              key={opcion.segundos}
              style={[styles.option, seleccionada && styles.optionSelected]}
              onPress={() => setSegundos(opcion.segundos)}
              accessibilityRole="radio"
              accessibilityState={{ checked: seleccionada }}
              accessibilityLabel={`Programar en ${opcion.etiqueta}`}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, seleccionada && styles.optionTextSelected]}>
                {opcion.etiqueta}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {recordatorio ? (
        <View style={styles.scheduledBox} accessibilityLiveRegion="polite">
          <Text style={styles.scheduledTitle}>Tienes un aviso pendiente</Text>
          {recordatorio.fecha ? (
            <Text style={styles.scheduledText}>
              Previsto para {new Date(recordatorio.fecha).toLocaleString()}.
            </Text>
          ) : null}
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.button, recordatorio && styles.replaceButton]}
        onPress={programarRecordatorio}
        disabled={cargando}
        accessibilityRole="button"
        accessibilityLabel={recordatorio ? "Reprogramar notificación local" : "Programar notificación local"}
        accessibilityState={{ busy: cargando, disabled: cargando }}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {cargando ? "Procesando..." : recordatorio ? "Reprogramar aviso" : "Programar aviso"}
        </Text>
      </TouchableOpacity>

      {recordatorio ? (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={cancelarRecordatorio}
          disabled={cargando}
          accessibilityRole="button"
          accessibilityLabel="Cancelar notificación local programada"
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancelar aviso</Text>
        </TouchableOpacity>
      ) : null}

      {estado ? (
        <Text style={styles.status} accessibilityLiveRegion="polite">
          {estado}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: "#e2e5dc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#dceee6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  icon: { color: "#1f6f5b", fontSize: 25, fontWeight: "800" },
  headerCopy: { flex: 1 },
  title: { color: "#20352f", fontSize: 16, fontWeight: "800" },
  description: { color: "#748078", fontSize: 11, lineHeight: 16, marginTop: 4 },
  label: { color: "#20352f", fontSize: 12, fontWeight: "700", marginBottom: 7 },
  input: {
    backgroundColor: "#f6f7f2",
    borderWidth: 1,
    borderColor: "#e2e5dc",
    borderRadius: 9,
    color: "#20352f",
    fontSize: 13,
    minHeight: 44,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  options: { flexDirection: "row", gap: 8, marginBottom: 14 },
  option: {
    flex: 1,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#e2e5dc",
    backgroundColor: "#f6f7f2",
  },
  optionSelected: { borderColor: "#1f6f5b", backgroundColor: "#dceee6" },
  optionText: { color: "#748078", fontSize: 12, fontWeight: "700" },
  optionTextSelected: { color: "#1f6f5b" },
  scheduledBox: {
    backgroundColor: "#dceee6",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  scheduledTitle: { color: "#1f6f5b", fontSize: 12, fontWeight: "800" },
  scheduledText: { color: "#20352f", fontSize: 11, marginTop: 3 },
  button: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#1f6f5b",
    paddingHorizontal: 12,
  },
  replaceButton: { backgroundColor: "#315d50" },
  buttonText: { color: "#fffdf8", fontSize: 13, fontWeight: "800" },
  cancelButton: { alignItems: "center", paddingVertical: 12, marginTop: 4 },
  cancelButtonText: { color: "#b65335", fontSize: 12, fontWeight: "700" },
  status: { color: "#53665c", fontSize: 11, lineHeight: 16, marginTop: 10 },
});
