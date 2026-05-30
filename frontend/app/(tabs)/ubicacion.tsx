import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// Simulated offline data
const offlineData = [
    { id: '1', name: 'Agencia Bata', type: 'Punto de recogida' },
    { id: '2', name: 'Cafetería Malabo', type: 'Punto de encuentro' },
];

export default function UbicacionScreen() {
    const [offlineMode, setOfflineMode] = useState(false);
    const [selectedLandmark, setSelectedLandmark] = useState<string | null>(null);

    const handleLandmarkPress = (landmark: string) => {
        setSelectedLandmark(landmark);
        Alert.alert('Ubicación', `Has seleccionado: ${landmark}`);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Mapa y Señal</Text>

            {/* Offline Toggle */}
            <View style={styles.offlineToggleContainer}>
                <View style={styles.offlineTextContainer}>
                    <SymbolView name={{ ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }} size={20} tintColor={offlineMode ? "#1E7C67" : "#A0AEC0"} />
                    <Text style={styles.offlineText}>Modo Offline</Text>
                </View>
                <Switch
                    value={offlineMode}
                    onValueChange={setOfflineMode}
                    trackColor={{ false: '#CBD5E0', true: '#1E7C67' }}
                    thumbColor={'#FFFFFF'}
                />
            </View>

            {/* SVG Map of Equatorial Guinea (Simplified Representation) */}
            <View style={styles.mapContainer}>
                <Svg height="250" width="100%" viewBox="0 0 300 250">
                    {/* Bioko Island */}
                    <Path
                        d="M 60,40 Q 80,30 90,50 Q 100,70 80,80 Q 60,90 50,70 Q 40,50 60,40 Z"
                        fill="#E2E8F0"
                        stroke="#1E7C67"
                        strokeWidth="2"
                    />
                    {/* Rio Muni (Mainland) */}
                    <Path
                        d="M 120,100 L 280,100 L 280,220 L 120,220 Z"
                        fill="#EDF2F7"
                        stroke="#0B3B60"
                        strokeWidth="2"
                    />

                    {/* Landmarks */}
                    {/* Malabo (Bioko) */}
                    <Circle cx="70" cy="50" r="8" fill={selectedLandmark === 'Malabo' ? '#1E7C67' : '#0B3B60'} onPress={() => handleLandmarkPress('Malabo')} />
                    {/* Bata (Mainland Coastal) */}
                    <Circle cx="130" cy="130" r="8" fill={selectedLandmark === 'Bata' ? '#1E7C67' : '#0B3B60'} onPress={() => handleLandmarkPress('Bata')} />
                    {/* Ebebiyin (Mainland Inland) */}
                    <Circle cx="260" cy="120" r="8" fill={selectedLandmark === 'Ebebiyín' ? '#1E7C67' : '#0B3B60'} onPress={() => handleLandmarkPress('Ebebiyín')} />
                    {/* Aeropuerto (Mainland) */}
                    <Circle cx="150" cy="180" r="8" fill={selectedLandmark === 'Aeropuerto' ? '#1E7C67' : '#0B3B60'} onPress={() => handleLandmarkPress('Aeropuerto')} />
                </Svg>
                <Text style={styles.mapHint}>Toca un punto para seleccionar una ubicación clave.</Text>
            </View>

            {/* Offline Data View */}
            {offlineMode && (
                <View style={styles.offlineDataContainer}>
                    <Text style={styles.sectionTitle}>Datos Guardados (Offline)</Text>
                    {offlineData.map(item => (
                        <View key={item.id} style={styles.offlineItem}>
                            <Text style={styles.offlineItemName}>{item.name}</Text>
                            <Text style={styles.offlineItemType}>{item.type}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Operator Signal strength panel */}
            <View style={styles.signalContainer}>
                <Text style={styles.sectionTitle}>Señal de Operadoras</Text>

                <View style={styles.operatorRow}>
                    <Text style={styles.operatorName}>Orange GE</Text>
                    <View style={styles.barsContainer}>
                        <View style={[styles.bar, styles.barActive, { height: 10 }]} />
                        <View style={[styles.bar, styles.barActive, { height: 15 }]} />
                        <View style={[styles.bar, styles.barActive, { height: 20 }]} />
                        <View style={[styles.bar, styles.barActive, { height: 25 }]} />
                    </View>
                </View>

                <View style={styles.operatorRow}>
                    <Text style={styles.operatorName}>GETESA</Text>
                    <View style={styles.barsContainer}>
                        <View style={[styles.bar, styles.barActive, { height: 10 }]} />
                        <View style={[styles.bar, styles.barActive, { height: 15 }]} />
                        <View style={[styles.bar, styles.barActive, { height: 20 }]} />
                        <View style={[styles.bar, styles.barInactive, { height: 25 }]} />
                    </View>
                </View>

                <View style={styles.operatorRow}>
                    <Text style={styles.operatorName}>Hits Telecom</Text>
                    <View style={styles.barsContainer}>
                        <View style={[styles.bar, styles.barActive, { height: 10 }]} />
                        <View style={[styles.bar, styles.barActive, { height: 15 }]} />
                        <View style={[styles.bar, styles.barInactive, { height: 20 }]} />
                        <View style={[styles.bar, styles.barInactive, { height: 25 }]} />
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#F7FAFC', padding: 20, paddingBottom: 100 },
    title: { fontSize: 24, fontWeight: '700', color: '#0B3B60', marginBottom: 20 },

    offlineToggleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    offlineTextContainer: { flexDirection: 'row', alignItems: 'center' },
    offlineText: { marginLeft: 10, fontSize: 16, fontWeight: '600', color: '#2D3748' },

    mapContainer: { backgroundColor: '#FFFFFF', padding: 10, borderRadius: 12, marginBottom: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    mapHint: { marginTop: 10, fontSize: 12, color: '#A0AEC0', textAlign: 'center' },

    offlineDataContainer: { backgroundColor: '#E6FFFA', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#319795' },
    offlineItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#B2F5EA' },
    offlineItemName: { fontSize: 16, fontWeight: 'bold', color: '#234E52' },
    offlineItemType: { fontSize: 14, color: '#285E61' },

    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0B3B60', marginBottom: 15 },

    signalContainer: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    operatorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    operatorName: { fontSize: 16, color: '#4A5568', fontWeight: '500' },
    barsContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 25 },
    bar: { width: 6, borderRadius: 3, marginLeft: 4 },
    barActive: { backgroundColor: '#1E7C67' },
    barInactive: { backgroundColor: '#E2E8F0' },
});
