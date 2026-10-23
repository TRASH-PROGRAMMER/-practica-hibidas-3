import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Titulo from "../components/Titulo";
import SensorUbicacion from "../components/sensorUbicacion";
import SensorMovimiento from "../components/sensormovimiento";
import NotificacionLocal from "../components/notificacionlocal";

export default function PerfilScreen({ usuario, onLogout }) {
  const correo = usuario?.correo || "yo@live.uleam.edu.ec";
  const esCliente = usuario?.rol === "Cliente";
  const [fotoPerfil, setFotoPerfil] = useState(usuario?.foto || null);
  const [fotoPendiente, setFotoPendiente] = useState(null);
  const [origenFoto, setOrigenFoto] = useState(null);
  const [selectorFotoVisible, setSelectorFotoVisible] = useState(false);
  const [vistaPreviaVisible, setVistaPreviaVisible] = useState(false);

  const confirmarCerrarSesion = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas salir de la aplicación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: () => {
            if (onLogout) onLogout();
          },
        },
      ]
    );
  };

  const seleccionarDeGaleria = async () => {
    setSelectorFotoVisible(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(false);
    if (!permission.granted) {
      Alert.alert(
        "Acceso no concedido",
        "Puedes seguir usando tu cuenta sin una foto. Para intentarlo otra vez, elige Galería y concede acceso a las fotos seleccionadas."
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    prepararVistaPrevia(resultado, "galeria");
  };

  const tomarFoto = async () => {
    setSelectorFotoVisible(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Cámara no disponible",
        "Puedes continuar sin cambiar tu foto. Si lo deseas, vuelve a intentarlo y permite usar la cámara mientras la aplicación está en uso."
      );
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      cameraType: "front",
    });
    prepararVistaPrevia(resultado, "camara");
  };

  const prepararVistaPrevia = (resultado, origen) => {
    if (resultado.canceled || !resultado.assets?.[0]?.uri) return;
    setFotoPendiente(resultado.assets[0].uri);
    setOrigenFoto(origen);
    setVistaPreviaVisible(true);
  };

  const confirmarFoto = () => {
    setFotoPerfil(fotoPendiente);
    setFotoPendiente(null);
    setVistaPreviaVisible(false);
    Alert.alert("Foto actualizada", "Tu nueva foto de perfil se ha guardado en esta cuenta.");
  };

  const repetirFoto = () => {
    setVistaPreviaVisible(false);
    if (origenFoto === "camara") tomarFoto();
    else seleccionarDeGaleria();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Titulo
        texto="Mi cuenta"
        subtitulo={esCliente ? "Datos de contacto y acceso" : "Datos del negocio y acceso"}
      />

      {/* Avatar y encabezado de usuario */}
      <View style={styles.perfilHeader}>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => setSelectorFotoVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Cambiar foto de perfil"
          activeOpacity={0.8}
        >
          <View style={styles.avatarContainer}>
            {fotoPerfil ? (
              <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} accessibilityLabel="Foto de perfil actual" />
            ) : (
              <Text style={styles.avatarTexto}>$</Text>
            )}
          </View>
          <View style={styles.cameraBadge}><Text style={styles.cameraBadgeText}>+</Text></View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectorFotoVisible(true)} accessibilityRole="button" accessibilityLabel="Gestionar foto de perfil">
          <Text style={styles.photoLink}>{fotoPerfil ? "Cambiar foto de perfil" : "Agregar foto de perfil"}</Text>
        </TouchableOpacity>
        <Text style={styles.nombre}>{esCliente ? "Cliente registrado" : "Administrador del negocio"}</Text>
        <Text style={styles.correo}>{correo}</Text>
      </View>

      {/* Tarjeta de información detallada */}
      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Información de la cuenta</Text>

        <View style={styles.infoFila}>
          <Text style={styles.infoLabel}>{esCliente ? "Cliente:" : "Negocio:"}</Text>
          <Text style={styles.infoValor}>{esCliente ? "Cliente frecuente" : "Mi negocio local"}</Text>
        </View>

        <View style={styles.infoFila}>
          <Text style={styles.infoLabel}>Rol:</Text>
          <Text style={styles.infoValor}>{esCliente ? "Cliente" : "Administrador"}</Text>
        </View>

        <View style={styles.infoFila}>
          <Text style={styles.infoLabel}>{esCliente ? "Compras:" : "Clientes:"}</Text>
          <Text style={styles.infoValor}>{esCliente ? "3 realizadas" : "28 registrados"}</Text>
        </View>

        <View style={styles.infoFila}>
          <Text style={styles.infoLabel}>{esCliente ? "Facturas:" : "Productos:"}</Text>
          <Text style={styles.infoValor}>{esCliente ? "3 disponibles" : "42 activos"}</Text>
        </View>

        <View style={styles.infoFila}>
          <Text style={styles.infoLabel}>Estado:</Text>
          <Text style={styles.infoValor}>Cuenta activa</Text>
        </View>
      </View>

      <SensorUbicacion />
      <SensorMovimiento />
      <NotificacionLocal />

      {/* Botón Cerrar Sesión */}
      <TouchableOpacity
        style={styles.botonLogout}
        onPress={confirmarCerrarSesion}
        activeOpacity={0.8}
      >
        <Text style={styles.textoLogout}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <Modal visible={selectorFotoVisible} transparent animationType="fade" onRequestClose={() => setSelectorFotoVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.photoModal}>
            <Text style={styles.modalTitle}>Foto de perfil</Text>
            <Text style={styles.modalDescription}>
              Elige cómo quieres agregar una foto. Solo pediremos el permiso necesario para la opción que selecciones.
            </Text>

            <TouchableOpacity style={styles.photoOption} onPress={seleccionarDeGaleria} accessibilityRole="button" accessibilityLabel="Elegir una foto de la galería">
              <Text style={styles.photoOptionIcon}>▧</Text>
              <View style={styles.photoOptionCopy}>
                <Text style={styles.photoOptionTitle}>Elegir de la galería</Text>
                <Text style={styles.photoOptionDescription}>Selecciona una foto específica de tu dispositivo.</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoOption} onPress={tomarFoto} accessibilityRole="button" accessibilityLabel="Tomar una foto con la cámara">
              <Text style={styles.photoOptionIcon}>◉</Text>
              <View style={styles.photoOptionCopy}>
                <Text style={styles.photoOptionTitle}>Tomar una foto</Text>
                <Text style={styles.photoOptionDescription}>Usaremos la cámara solo durante esta acción.</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelAction} onPress={() => setSelectorFotoVisible(false)} accessibilityRole="button">
              <Text style={styles.cancelActionText}>Ahora no</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={vistaPreviaVisible} transparent animationType="slide" onRequestClose={() => setVistaPreviaVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.previewModal}>
            <Text style={styles.modalTitle}>Vista previa</Text>
            <Text style={styles.modalDescription}>Así se verá tu foto en Mi cuenta.</Text>
            {fotoPendiente ? <Image source={{ uri: fotoPendiente }} style={styles.previewImage} accessibilityLabel="Vista previa de la nueva foto" /> : null}
            <TouchableOpacity style={styles.primaryAction} onPress={confirmarFoto} accessibilityRole="button">
              <Text style={styles.primaryActionText}>Usar foto</Text>
            </TouchableOpacity>
            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.secondaryAction} onPress={repetirFoto} accessibilityRole="button">
                <Text style={styles.secondaryActionText}>{origenFoto === "camara" ? "Repetir" : "Elegir otra"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryAction} onPress={() => setVistaPreviaVisible(false)} accessibilityRole="button">
                <Text style={styles.secondaryActionText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  perfilHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarButton: { alignItems: "center", position: "relative" },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: 8,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#1f6f5b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#f8fafc",
  },
  cameraBadgeText: { color: "#ffffff", fontSize: 18, lineHeight: 20, fontWeight: "700" },
  avatarTexto: {
    fontSize: 40,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  correo: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  photoLink: { color: "#1f6f5b", fontSize: 13, fontWeight: "700", marginBottom: 20, marginTop: -4 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 24,
  },
  cardTitulo: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 6,
  },
  infoFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748b",
  },
  infoValor: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
  },
  botonLogout: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  textoLogout: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(24, 37, 32, 0.46)" },
  photoModal: { backgroundColor: "#fffdf8", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: 28 },
  previewModal: { backgroundColor: "#fffdf8", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, alignItems: "center", paddingBottom: 30 },
  modalTitle: { color: "#20352f", fontSize: 20, fontWeight: "800" },
  modalDescription: { color: "#748078", fontSize: 13, lineHeight: 19, marginTop: 7, marginBottom: 16 },
  photoOption: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e2e5dc", borderRadius: 11, padding: 13, marginBottom: 10, minHeight: 66 },
  photoOptionIcon: { color: "#c2643d", fontSize: 26, fontWeight: "800", width: 38, textAlign: "center", marginRight: 10 },
  photoOptionCopy: { flex: 1 },
  photoOptionTitle: { color: "#20352f", fontSize: 14, fontWeight: "800" },
  photoOptionDescription: { color: "#748078", fontSize: 11, lineHeight: 16, marginTop: 4 },
  cancelAction: { alignItems: "center", paddingVertical: 12 },
  cancelActionText: { color: "#748078", fontSize: 14, fontWeight: "700" },
  previewImage: { width: 210, height: 210, borderRadius: 105, marginVertical: 18, backgroundColor: "#e8ece5" },
  primaryAction: { width: "100%", alignItems: "center", backgroundColor: "#1f6f5b", borderRadius: 10, paddingVertical: 14 },
  primaryActionText: { color: "#fffdf8", fontSize: 14, fontWeight: "800" },
  previewActions: { flexDirection: "row", width: "100%", justifyContent: "space-between", marginTop: 10 },
  secondaryAction: { width: "48%", alignItems: "center", borderWidth: 1, borderColor: "#d7ddd8", borderRadius: 10, paddingVertical: 12 },
  secondaryActionText: { color: "#1f6f5b", fontSize: 13, fontWeight: "700" },
});
