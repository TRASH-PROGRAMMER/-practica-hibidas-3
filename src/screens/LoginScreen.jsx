import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Titulo from "../components/Titulo";

export default function LoginScreen({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("Administrador");

  // Credenciales de prueba sin BD
  const correoUsuario = "admin@negocio.local";
  const correoCliente = "cliente@negocio.local";
  const passUsuario = "123456";

  // Lógica de negocio para el inicio de sesión
  const IniciarSesion = () => {
    if (correo.trim() === "" || password.trim() === "") {
      Alert.alert("Error", "Ambos campos son obligatorios");
      return;
    }

    const correoIngresado = correo.trim().toLowerCase();
    const esAdministrador = correoIngresado === correoUsuario;
    const esCliente = correoIngresado === correoCliente;

    if ((esAdministrador || esCliente) && password === passUsuario) {
      if (onLogin) {
        onLogin({
          correo: correoIngresado,
          nombre: esAdministrador ? "Administrador" : "Cliente",
          rol: esAdministrador ? "Administrador" : "Cliente",
        });
      }
    } else {
      Alert.alert("Error", "Credenciales incorrectas");
    }
  };

  // Rellenar automáticamente para pruebas rápidas
  const llenarCredencialesPrueba = () => {
    setCorreo(rol === "Administrador" ? correoUsuario : correoCliente);
    setPassword(passUsuario);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Titulo
            texto="Iniciar Sesión"
            subtitulo="Gestiona ventas, clientes y cobros"
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de usuario</Text>
            <View style={styles.rolePicker}>
              {["Administrador", "Cliente"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.roleOption, rol === option && styles.roleOptionActive]}
                  onPress={() => setRol(option)}
                >
                  <Text style={[styles.roleText, rol === option && styles.roleTextActive]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo del usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="admin@negocio.local"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Clave de acceso</Text>
            <TextInput
              style={styles.input}
              placeholder="******"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.botonLogin}
            onPress={IniciarSesion}
            activeOpacity={0.8}
          >
            <Text style={styles.textoBotonLogin}>Iniciar Sesión</Text>
          </TouchableOpacity>

          {/* Caja informativa con credenciales de prueba */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitulo}>Acceso de demostración</Text>
            <Text style={styles.infoTexto}>Administrador: {correoUsuario}</Text>
            <Text style={styles.infoTexto}>Cliente: {correoCliente}</Text>
            <Text style={styles.infoTexto}>Clave: {passUsuario}</Text>
            <TouchableOpacity
              onPress={llenarCredencialesPrueba}
              style={styles.botonAutoFill}
            >
              <Text style={styles.textoAutoFill}>⚡ Autocompletar datos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#f8fafc",
    color: "#1e293b",
  },
  rolePicker: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 3,
  },
  roleOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: 6,
  },
  roleOptionActive: { backgroundColor: "#dceee6" },
  roleText: { color: "#64748b", fontSize: 13, fontWeight: "600" },
  roleTextActive: { color: "#1f6f5b" },
  botonLogin: {
    backgroundColor: "#4338ca",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  textoBotonLogin: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  infoTitulo: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 4,
  },
  infoTexto: {
    fontSize: 12,
    color: "#64748b",
  },
  botonAutoFill: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#e0e7ff",
  },
  textoAutoFill: {
    fontSize: 12,
    color: "#4338ca",
    fontWeight: "600",
  },
});
