import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function BuscarScreen() {
    const [origen, setOrigen] = useState('');
    const [destino, setDestino] = useState('');
    const [fecha, setFecha] = useState('');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>¿Qué estás buscando?</Text>

            <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <SymbolView name={{ ios: 'mappin.and.ellipse', android: 'place', web: 'place' }} size={20} tintColor="#A0AEC0" />
                    <TextInput
                        style={styles.input}
                        placeholder="Origen"
                        value={origen}
                        onChangeText={setOrigen}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <SymbolView name={{ ios: 'mappin.and.ellipse', android: 'place', web: 'place' }} size={20} tintColor="#A0AEC0" />
                    <TextInput
                        style={styles.input}
                        placeholder="Destino"
                        value={destino}
                        onChangeText={setDestino}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <SymbolView name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }} size={20} tintColor="#A0AEC0" />
                    <TextInput
                        style={styles.input}
                        placeholder="Fecha"
                        value={fecha}
                        onChangeText={setFecha}
                    />
                </View>

                <TouchableOpacity style={styles.searchButton}>
                    <Text style={styles.searchButtonText}>Buscar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#F7FAFC', padding: 20 },
    title: { fontSize: 24, fontWeight: '700', color: '#0B3B60', marginBottom: 20 },
    formContainer: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDF2F7', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, marginBottom: 15 },
    input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#2D3748' },
    searchButton: { backgroundColor: '#1E7C67', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    searchButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
