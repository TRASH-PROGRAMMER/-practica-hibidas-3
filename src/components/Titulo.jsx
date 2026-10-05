import { StyleSheet, Text, View } from "react-native";

export default function Titulo({ texto, subtitulo, style }) {
    return (
        <View style={[styles.container, style]}>
            <Text style={styles.titulo}>{texto}</Text>
            {subtitulo && (
                <Text style={styles.subtitulo}>{subtitulo}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 12,
        paddingHorizontal: 16,
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a202c',
        textAlign: 'center',
    },
    subtitulo: {
        fontSize: 15,
        color: '#4a5568',
        fontStyle: 'italic',
        marginTop: 4,
        textAlign: 'center',
    }
});