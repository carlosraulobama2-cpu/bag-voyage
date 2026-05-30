import { useAppStore } from '@/src/store/useAppStore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function VerifyScreen() {
    const { setUser, user } = useAppStore();
    const [loading, setLoading] = useState(false);

    const handleUploadDIP = () => {
        setLoading(true);
        // Simular carga de imagen y compresión estricta
        setTimeout(() => {
            setLoading(false);
            Alert.alert('DIP Subido', 'La imagen se ha comprimido a 45KB y enviado con éxito.');
            setUser({
                ...(user || { id: 'test', name: 'Usuario Nuevo', phone: '+240' }),
                isVerified: true,
            });
            router.back();
        }, 2000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Atrás</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Verificar Identidad</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>🪪</Text>
                </View>
                <Text style={styles.title}>Protegemos a nuestra comunidad</Text>
                <Text style={styles.description}>
                    Para asegurar que todos los envíos llegan a su destino, requerimos una foto de tu Documento de Identidad Personal (DIP) o Pasaporte.
                </Text>

                <View style={styles.infoBox}>
                    <Text style={styles.infoIcon}>💡</Text>
                    <Text style={styles.infoText}>
                        Uso de Datos Bajo: Tu foto será comprimida fuertemente antes de subirse para ahorrar tus megas de internet.
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={handleUploadDIP}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <Text style={styles.uploadButtonIcon}>📸</Text>
                            <Text style={styles.uploadButtonText}>Tomar Foto al DIP / Pasaporte</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    backButton: {
        marginRight: 16,
    },
    backButtonText: {
        fontSize: 16,
        color: '#2B6CB0',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A202C',
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EBF8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        marginTop: 20,
    },
    icon: {
        fontSize: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#FAF5FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 40,
        width: '100%',
    },
    infoIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#553C9A',
        lineHeight: 20,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2B6CB0',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
        shadowColor: '#2B6CB0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    uploadButtonIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    uploadButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
