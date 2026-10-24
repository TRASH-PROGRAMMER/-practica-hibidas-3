import { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import Constants from "expo-constants";
import Titulo from "../components/Titulo";

// Handler global para asegurar que las notificaciones se muestren en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Detección segura de dispositivo físico sin romper si expo-device no está instalado
let isDevicePhysical = Platform.OS !== "web";
try {
  const Device = require("expo-device");
  if (Device && typeof Device.isDevice === "boolean") {
    isDevicePhysical = Device.isDevice;
  }
} catch {
  isDevicePhysical = Platform.OS !== "web";
}

export default function NotificacionesPush({ setPantallaActual }) {
  const [token, setToken] = useState("");
  const [ultimoAviso, setUltimoAviso] = useState(null);
  const [estado, setEstado] = useState("Pendiente de registro");
  const [cargando, setCargando] = useState(false);
  const [mostrarBotonAjustes, setMostrarBotonAjustes] = useState(false);

  useEffect(() => {
    // Escuchar notificaciones entrantes cuando la app está abierta
    const suscripcionRecibida = Notifications.addNotificationReceivedListener(
      (notificacion) => {
        const contenido = notificacion.request.content;
        setUltimoAviso({
          titulo: contenido.title || "Notificación recibida",
          cuerpo: contenido.body || "Sin contenido",
          fecha: new Date().toLocaleTimeString(),
          datos: contenido.data,
        });
      }
    );

    // Escuchar cuando el usuario toca la notificación
    const suscripcionPulsada =
      Notifications.addNotificationResponseReceivedListener((respuesta) => {
        const datos = respuesta.notification.request.content.data;
        console.log("Datos al pulsar la notificación:", datos);
        if (datos?.pantalla && setPantallaActual) {
          setPantallaActual(datos.pantalla);
        }
      });

    return () => {
      suscripcionRecibida.remove();
      suscripcionPulsada.remove();
    };
  }, [setPantallaActual]);

  async function registrarDispositivo() {
    setCargando(true);
    setMostrarBotonAjustes(false);

    try {
      // 1. Configurar canal en Android de forma protegida para Expo Go
      if (Platform.OS === "android") {
        try {
          await Notifications.setNotificationChannelAsync("default", {
            name: "Avisos de solicitudes",
            importance: AndroidImportance?.MAX ?? 4,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#1f6f5b",
          });
        } catch (canalError) {
          console.warn("Canal del sistema usado en Expo Go:", canalError);
        }
      }

      // 2. Comprobar si es dispositivo físico
      if (!isDevicePhysical) {
        setEstado("Las notificaciones push remotas requieren un dispositivo físico.");
        Alert.alert(
          "Emulador detectado",
          "Las notificaciones push remotas no funcionan en emuladores. Sin embargo, puedes probar las notificaciones locales con el botón de prueba."
        );
        return;
      }

      // 3. Permisos de notificación
      const permisosActuales = await Notifications.getPermissionsAsync();
      let concedido = permisosActuales.granted;

      if (!concedido) {
        const nuevosPermisos = await Notifications.requestPermissionsAsync();
        concedido = nuevosPermisos.granted;
      }

      if (!concedido) {
        setMostrarBotonAjustes(true);
        setEstado("Permiso denegado; habilita las notificaciones en los ajustes.");
        Alert.alert(
          "Permisos requeridos",
          "Las notificaciones están desactivadas. Actívalas en la configuración de tu teléfono."
        );
        return;
      }

      // 4. Obtener EAS Project ID
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      if (!projectId || projectId === "REEMPLAZAR_CON_ID_REAL") {
        setEstado("Configura un projectId válido en app.json (extra.eas.projectId).");
        Alert.alert(
          "EAS Project ID pendiente",
          "Para generar un Expo Push Token debes colocar tu projectId real en app.json dentro de 'extra.eas.projectId'."
        );
        return;
      }

      // 5. Obtener Expo Push Token
      setEstado("Solicitando token a Expo...");
      const resultado = await Notifications.getExpoPushTokenAsync({ projectId });
      setToken(resultado.data);
      setEstado("Token obtenido exitosamente");
      Alert.alert("¡Dispositivo registrado!", "El token de notificación push fue generado con éxito.");
    } catch (error) {
      console.error("Error al registrar dispositivo:", error);
      setEstado(`Error: ${error?.message || String(error)}`);
      Alert.alert("Registro fallido", error?.message || String(error));
    } finally {
      setCargando(false);
    }
  }

  async function probarNotificacionLocal() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Solicitud registrada 📬",
          body: "Tu solicitud de pago fue registrada y está en revisión.",
          data: { pantalla: "solicitudes", tipo: "registro" },
          sound: "default",
        },
        trigger: null, // trigger null envía la notificación inmediatamente
      });
      setEstado("Notificación de prueba enviada al dispositivo");
    } catch (error) {
      console.error("Error al enviar notificación local:", error);
      Alert.alert("Error de notificación", error?.message || String(error));
    }
  }

  const getBadgeStyle = () => {
    if (token) return { bg: "#dcfce7", text: "#15803d" };
    if (estado.includes("Error") || estado.includes("denegado")) {
      return { bg: "#fee2e2", text: "#b91c1c" };
    }
    return { bg: "#fff1e8", text: "#c2643d" };
  };

  const badge = getBadgeStyle();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Titulo
        texto="Notificaciones Push"
        subtitulo="Gestión de token de dispositivo y avisos en tiempo real"
      />

      {/* Tarjeta de estado de registro */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔔</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.cardTitle}>Estado de conexión</Text>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>
                {estado}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.botonPrincipal, cargando && styles.botonDesactivado]}
          onPress={registrarDispositivo}
          disabled={cargando}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBotonPrincipal}>
            {cargando ? "Registrando dispositivo..." : "Solicitar permisos y obtener token"}
          </Text>
        </TouchableOpacity>

        {mostrarBotonAjustes && (
          <TouchableOpacity
            style={styles.botonAjustes}
            onPress={() => Linking.openSettings()}
            activeOpacity={0.8}
          >
            <Text style={styles.textoBotonAjustes}>⚙️ Abrir ajustes de Expo Go</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tarjeta del Expo Push Token */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: "#fef3c7" }]}>
            <Text style={styles.icon}>🔑</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.cardTitle}>Expo Push Token</Text>
            <Text style={styles.cardDescription}>
              Identificador único para recibir notificaciones desde tu servidor o Firebase
            </Text>
          </View>
        </View>

        <View style={styles.tokenContainer}>
          <Text selectable style={styles.tokenTexto}>
            {token || "Token aún no generado. Pulsa el botón de arriba para obtenerlo."}
          </Text>
        </View>
      </View>

      {/* Tarjeta de prueba local */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: "#e0e7ff" }]}>
            <Text style={styles.icon}>⚡</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.cardTitle}>Prueba de aviso instantáneo</Text>
            <Text style={styles.cardDescription}>
              Envía una alerta inmediata en este dispositivo para comprobar sonido y avisos
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.botonSecundario}
          onPress={probarNotificacionLocal}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBotonSecundario}>
            Probar notificación local de Solicitud
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tarjeta de último aviso recibido */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Último aviso recibido en la app</Text>
        {ultimoAviso ? (
          <View style={styles.avisoBox}>
            <Text style={styles.avisoTitulo}>{ultimoAviso.titulo}</Text>
            <Text style={styles.avisoCuerpo}>{ultimoAviso.cuerpo}</Text>
            <Text style={styles.avisoFecha}>Recibido a las: {ultimoAviso.fecha}</Text>
          </View>
        ) : (
          <Text style={styles.avisoVacio}>
            Aún no se han recibido notificaciones durante esta sesión.
          </Text>
        )}
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
    paddingBottom: 32,
    gap: 14,
  },
  card: {
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: "#e2e5dc",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#dceee6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#20352f",
  },
  cardDescription: {
    fontSize: 12,
    color: "#748078",
    marginTop: 2,
    lineHeight: 16,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  botonPrincipal: {
    backgroundColor: "#1f6f5b",
    minHeight: 46,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 4,
  },
  botonDesactivado: {
    backgroundColor: "#8ea89e",
  },
  textoBotonPrincipal: {
    color: "#fffdf8",
    fontSize: 14,
    fontWeight: "800",
  },
  botonSecundario: {
    backgroundColor: "#dceee6",
    minHeight: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#b6d8cc",
  },
  textoBotonSecundario: {
    color: "#1f6f5b",
    fontSize: 13,
    fontWeight: "800",
  },
  botonAjustes: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fde68a",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  textoBotonAjustes: {
    color: "#92400e",
    fontSize: 12,
    fontWeight: "700",
  },
  tokenContainer: {
    backgroundColor: "#f6f7f2",
    borderWidth: 1,
    borderColor: "#e2e5dc",
    borderRadius: 10,
    padding: 12,
  },
  tokenTexto: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#20352f",
    lineHeight: 18,
  },
  avisoBox: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#1f6f5b",
  },
  avisoTitulo: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  avisoCuerpo: {
    fontSize: 13,
    color: "#334155",
    marginTop: 2,
  },
  avisoFecha: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 6,
  },
  avisoVacio: {
    fontSize: 12,
    color: "#748078",
    fontStyle: "italic",
    marginTop: 8,
  },
});
