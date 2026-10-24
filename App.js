import { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Platform,
  StatusBar as RNStatusBar,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";

import LoginScreen from "./src/screens/LoginScreen";
import InicioScreen from "./src/screens/InicioScreen";
import SolicitudesScreen from "./src/screens/SolicitudesScreen";
import PerfilScreen from "./src/screens/PerfilScreen";
import GestionScreen from "./src/screens/GestionScreen";
import PortalClienteScreen from "./src/screens/PortalClienteScreen";
import AnaliticaScreen from "./src/screens/AnaliticaScreen";
import NotificacionesPush from "./src/screens/NotificacionesPush";
import MenuInferior from "./src/components/MenuInferior";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [pantallaActual, setPantallaActual] = useState("inicio");

  const handleLogin = (user) => {
    setUsuario(user);
    setIsLoggedIn(true);
    setPantallaActual("inicio");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsuario(null);
    setPantallaActual("inicio");
  };

  // Renderizado condicional de la pantalla según la navegación actual
  const renderPantalla = () => {
    if (usuario?.rol === "Cliente") {
      if (pantallaActual === "perfil") {
        return <PerfilScreen usuario={usuario} onLogout={handleLogout} />;
      }
      if (pantallaActual === "notificaciones" || pantallaActual === "push") {
        return <NotificacionesPush setPantallaActual={setPantallaActual} />;
      }
      return <PortalClienteScreen usuario={usuario} />;
    }

    switch (pantallaActual) {
      case "solicitudes":
        return <SolicitudesScreen setPantallaActual={setPantallaActual} />;
      case "notificaciones":
      case "push":
        return <NotificacionesPush setPantallaActual={setPantallaActual} />;
      case "productos":
      case "facturas":
      case "clientes":
      case "deudas":
        return (
          <GestionScreen
            modulo={pantallaActual}
            setPantallaActual={setPantallaActual}
          />
        );
      case "ventas":
        return (
          <GestionScreen
            modulo="ventas"
            setPantallaActual={setPantallaActual}
          />
        );
      case "analitica":
        return <AnaliticaScreen />;
      case "perfil":
        return <PerfilScreen usuario={usuario} onLogout={handleLogout} />;
      case "inicio":
      default:
        return (
          <InicioScreen
            usuario={usuario}
            setPantallaActual={setPantallaActual}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <View style={styles.container}>
          <View style={styles.screenContainer}>{renderPantalla()}</View>
          <MenuInferior
            pantallaActual={pantallaActual}
            setPantallaActual={setPantallaActual}
            esCliente={usuario?.rol === "Cliente"}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  screenContainer: {
    flex: 1,
  },
});
