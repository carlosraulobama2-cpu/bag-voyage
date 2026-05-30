import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
// @ts-ignore
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// Cambia esta URL por la de tu backend (si pruebas en dispositivo físico usa tu IP de red local en vez de 127.0.0.1)
const BACKEND_URL = 'http://127.0.0.1:3000/api/auth';

export default function LoginScreen() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAuth = async () => {
        if (!email || !password) {
            return Alert.alert('Error', 'Por favor llena todos los campos');
        }

        setIsLoading(true);
        try {
            const endpoint = isLogin ? '/login' : '/register';
            const payload = isLogin ? { email, password } : { nombre, email, password };

            const response = await fetch(`${BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                // Guardamos el JWT Token de forma segura en el dispositivo
                await AsyncStorage.setItem('userToken', data.token);
                Alert.alert('¡Éxito!', isLogin ? 'Bienvenido de nuevo' : 'Cuenta creada con éxito');
                // Redirigir a la pestaña principal (Feed/Buscar)
                router.replace('/(tabs)');
            } else {
                Alert.alert('Error', data.message || 'Ha ocurrido un error');
            }
        } catch (error) {
            console.error('Auth Error:', error);
            Alert.alert('Error de conexión', 'No se pudo conectar con el servidor');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Animated SVG Waves Background */}
            <View style={styles.waveContainer}>
                <Svg height="300" width="100%" viewBox="0 0 1440 320" style={styles.svg as any}>
                    <Path
                        fill="#0B3B60"
                        fillOpacity="1"
                        d="M0,160L48,160C96,160,192,160,288,170.7C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,149.3C1248,117,1344,75,1392,53.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                    />
                    <Path
                        fill="#1E7C67"
                        fillOpacity="0.8"
                        d="M0,256L48,245.3C96,235,192,213,288,213.3C384,213,480,235,576,240C672,245,768,235,864,208C960,181,1056,139,1152,117.3C1248,96,1344,96,1392,96L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                    />
                </Svg>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                {/* Switcher Login / Register */}
                <View style={styles.switcherContainer}>
                    <TouchableOpacity
                        style={[styles.switcherButton, isLogin && styles.switcherActive]}
                        onPress={() => setIsLogin(true)}
                    >
                        <Text style={[styles.switcherText, isLogin && styles.switcherTextActive]}>Iniciar sesión</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.switcherButton, !isLogin && styles.switcherActive]}
                        onPress={() => setIsLogin(false)}
                    >
                        <Text style={[styles.switcherText, !isLogin && styles.switcherTextActive]}>Registrarse</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.welcomeTitle}>{isLogin ? '¡Bienvenido de nuevo!' : 'Crea tu cuenta'}</Text>

                    {!isLogin && (
                        <View style={styles.inputGroup}>
                            <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} size={20} tintColor="#A0AEC0" />
                            <TextInput style={styles.input} placeholder="Nombre completo" value={nombre} onChangeText={setNombre} />
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <SymbolView name={{ ios: 'envelope.fill', android: 'email', web: 'email' }} size={20} tintColor="#A0AEC0" />
                        <TextInput style={styles.input} placeholder="Correo electrónico" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
                    </View>

                    <View style={styles.inputGroup}>
                        <SymbolView name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} size={20} tintColor="#A0AEC0" />
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <SymbolView
                                name={showPassword ? { ios: 'eye.slash.fill', android: 'visibility_off', web: 'visibility_off' } : { ios: 'eye.fill', android: 'visibility', web: 'visibility' }}
                                size={20}
                                tintColor="#A0AEC0"
                            />
                        </TouchableOpacity>
                    </View>

                    {isLogin && (
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.mainButton} onPress={handleAuth} disabled={isLoading}>
                        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainButtonText}>{isLogin ? 'Entrar' : 'Registrarme'}</Text>}
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    waveContainer: { position: 'absolute', top: 0, width: '100%', height: 300 },
    svg: { position: 'absolute', top: 0 },
    scrollContent: { paddingTop: 180, paddingHorizontal: 20, paddingBottom: 50 },

    switcherContainer: { flexDirection: 'row', backgroundColor: '#EDF2F7', borderRadius: 30, padding: 4, marginBottom: 30, alignSelf: 'center', width: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    switcherButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 26 },
    switcherActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    switcherText: { fontSize: 16, fontWeight: '600', color: '#A0AEC0' },
    switcherTextActive: { color: '#0B3B60' },

    formContainer: { backgroundColor: '#FFFFFF', padding: 25, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
    welcomeTitle: { fontSize: 24, fontWeight: 'bold', color: '#0B3B60', marginBottom: 20, textAlign: 'center' },

    inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#EDF2F7', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 15 },
    input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#2D3748' },

    forgotPassword: { alignSelf: 'flex-end', marginBottom: 20 },
    forgotPasswordText: { color: '#1E7C67', fontWeight: '600', fontSize: 14 },

    verificationNotice: { flexDirection: 'row', backgroundColor: '#E6FFFA', padding: 12, borderRadius: 8, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: '#319795' },
    verificationText: { flex: 1, marginLeft: 10, fontSize: 12, color: '#234E52' },

    mainButton: { backgroundColor: '#0B3B60', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 10 },
    mainButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },

    socialDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
    line: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
    orText: { marginHorizontal: 10, color: '#A0AEC0', fontSize: 14 },

    socialButtonsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
    socialBtn: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
    socialBtnText: { fontSize: 20, fontWeight: 'bold', color: '#4A5568' }
});
