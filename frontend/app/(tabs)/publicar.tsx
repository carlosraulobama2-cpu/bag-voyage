import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
// @ts-ignore
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const BACKEND_URL = 'http://127.0.0.1:3000/api/publicaciones';

export default function PublicarScreen() {
    const router = useRouter();
    const [modo, setModo] = useState('viajero');
    const [origen, setOrigen] = useState('');
    const [destino, setDestino] = useState('');
    const [fecha, setFecha] = useState('');
    const [precio, setPrecio] = useState('');
    const [envio, setEnvio] = useState('');
    const [descripcion, setDescripcion] = useState('');

    const handlePublicar = async () => {
        try {
            // Obtenemos el token guardado tras hacer login
            const token = await AsyncStorage.getItem('userToken');
            
            if (!token) {
                Alert.alert("Acceso denegado", "Debes iniciar sesión para publicar.");
                router.push('/auth/login');
                return;
            }
            
            const payload = {
                modo,
                origen,
                destino,
                fecha,
                precio: modo === 'viajero' ? precio : null,
                envio: modo === 'remitente' ? envio : null,
                descripcion
            };

            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert("¡Éxito!", "Tu publicación se ha guardado correctamente.");
                setOrigen(''); setDestino(''); setFecha(''); setPrecio(''); setEnvio(''); setDescripcion('');
            } else {
                if (response.status === 401 || response.status === 403) {
                    Alert.alert("Sesión expirada", "Inicia sesión nuevamente.");
                    await AsyncStorage.removeItem('userToken');
                    router.push('/auth/login');
                } else {
                    Alert.alert("Error", data.message || "No se pudo guardar la publicación");
                }
            }

        } catch (error) {
            console.error("Error al conectar con backend:", error);
            Alert.alert("Error", "No se pudo conectar con el servidor.");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Nueva Publicación</Text>

            <View style={styles.toggleContainer}>
                <TouchableOpacity style={[styles.toggleButton, modo === 'viajero' && styles.toggleActive]} onPress={() => setModo('viajero')}>
                    <Text style={[styles.toggleText, modo === 'viajero' && styles.toggleTextActive]}>Soy Viajero</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.toggleButton, modo === 'remitente' && styles.toggleActive]} onPress={() => setModo('remitente')}>
                    <Text style={[styles.toggleText, modo === 'remitente' && styles.toggleTextActive]}>Soy Remitente</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <TextInput style={styles.input} placeholder="Origen" value={origen} onChangeText={setOrigen} />
                <TextInput style={styles.input} placeholder="Destino" value={destino} onChangeText={setDestino} />
                <TextInput style={styles.input} placeholder="Fecha" value={fecha} onChangeText={setFecha} />
                {modo === 'viajero' ? (
                    <TextInput style={styles.input} placeholder="Precio por Kg (€)" keyboardType="numeric" value={precio} onChangeText={setPrecio} />
                ) : (
                    <TextInput style={styles.input} placeholder="¿Qué envías?" value={envio} onChangeText={setEnvio} />
                )}
                <TextInput style={[styles.input, styles.textArea]} placeholder="Descripción adicional..." multiline numberOfLines={4} value={descripcion} onChangeText={setDescripcion} />

                <TouchableOpacity style={styles.submitButton} onPress={handlePublicar}>
                    <Text style={styles.submitButtonText}>Publicar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#F7FAFC', padding: 20 },
    title: { fontSize: 24, fontWeight: '700', color: '#0B3B60', marginBottom: 20, textAlign: 'center' },
    toggleContainer: { flexDirection: 'row', backgroundColor: '#EDF2F7', borderRadius: 8, padding: 4, marginBottom: 20 },
    toggleButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 6 },
    toggleActive: { backgroundColor: '#1E7C67' },
    toggleText: { fontSize: 16, color: '#A0AEC0', fontWeight: '600' },
    toggleTextActive: { color: '#FFFFFF' },
    form: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    input: { backgroundColor: '#EDF2F7', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 15, fontSize: 16, color: '#2D3748' },
    textArea: { height: 100, textAlignVertical: 'top' },
    submitButton: { backgroundColor: '#0B3B60', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
