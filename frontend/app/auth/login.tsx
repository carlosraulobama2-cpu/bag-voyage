import { SymbolView } from 'expo-symbols';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { api, setToken, type ApiError } from '../../src/services/api';
import { useAppStore } from '../../src/store/useAppStore';

export default function LoginScreen() {
    const router = useRouter();
    const setUser = useAppStore((s) => s.setUser);
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [aceptaTerminos, setAceptaTerminos] = useState(false);

    // La versión vigente de términos/privacidad: el backend la exige tal
    // cual (ver schemas.js) para registrar una cuenta — si no se carga,
    // directamente no se puede enviar el registro, mejor eso que mandar
    // una versión inventada que el servidor va a rechazar igual.
    const [terminosVersion, setTerminosVersion] = useState<string | null>(null);

    useEffect(() => {
        if (isLogin) return;
        api.legal
            .get()
            .then((r) => setTerminosVersion(r.version))
            .catch(() => setTerminosVersion(null));
    }, [isLogin]);

    const formularioValido = isLogin
        ? email.trim() && password
        : nombre.trim() && apellidos.trim() && email.trim() && password.length >= 8 && aceptaTerminos && terminosVersion;

    const handleAuth = async () => {
        if (!isLogin && password.length > 0 && password.length < 8) {
            return Alert.alert('Contraseña muy corta', 'Usá al menos 8 caracteres.');
        }
        if (!formularioValido) {
            return Alert.alert('Faltan datos', isLogin ? 'Completá correo y contraseña.' : 'Completá todos los campos y aceptá los términos.');
        }

        setIsLoading(true);
        try {
            const resultado = isLogin
                ? await api.auth.login({ email: email.trim(), password })
                : await api.auth.register({
                      nombre: nombre.trim(),
                      apellidos: apellidos.trim(),
                      email: email.trim(),
                      password,
                      acceptedTermsVersion: terminosVersion!,
                  });

            await setToken(resultado.token);
            setUser({ id: resultado.user.id, name: `${resultado.user.nombre} ${resultado.user.apellidos}`.trim(), phone: resultado.user.phone || '', isVerified: false });
            router.replace('/(tabs)');
        } catch (error) {
            const mensaje = (error as ApiError)?.message || 'Ha ocurrido un error';
            Alert.alert(isLogin ? 'No se pudo iniciar sesión' : 'No se pudo crear la cuenta', mensaje);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Fondo con degradé de marca — antes dos olas lisas; se agrega
                un tercer tono y un ícono insignia para que el momento de
                entrar a la app se sienta cuidado, no una plantilla genérica. */}
            <View style={styles.waveContainer}>
                <Svg height="320" width="100%" viewBox="0 0 1440 320" style={styles.svg as any}>
                    <Defs>
                        <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor="#0B3B60" />
                            <Stop offset="1" stopColor="#0E2A42" />
                        </LinearGradient>
                    </Defs>
                    <Path fill="url(#bgGrad)" fillOpacity="1" d="M0,160L48,160C96,160,192,160,288,170.7C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,149.3C1248,117,1344,75,1392,53.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
                    <Path fill="#1E7C67" fillOpacity="0.85" d="M0,256L48,245.3C96,235,192,213,288,213.3C384,213,480,235,576,240C672,245,768,235,864,208C960,181,1056,139,1152,117.3C1248,96,1344,96,1392,96L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
                </Svg>
                <View style={styles.badge}>
                    <Text style={styles.badgeEmoji}>🧳</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.switcherContainer}>
                    <TouchableOpacity style={[styles.switcherButton, isLogin && styles.switcherActive]} onPress={() => setIsLogin(true)}>
                        <Text style={[styles.switcherText, isLogin && styles.switcherTextActive]}>Iniciar sesión</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.switcherButton, !isLogin && styles.switcherActive]} onPress={() => setIsLogin(false)}>
                        <Text style={[styles.switcherText, !isLogin && styles.switcherTextActive]}>Registrarse</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.welcomeTitle}>{isLogin ? '¡Bienvenido de nuevo!' : 'Creá tu cuenta'}</Text>
                    <Text style={styles.welcomeSubtitle}>
                        {isLogin ? 'Entrá para pedir un viaje, un envío o tu comida.' : 'Viajes, envíos y comida — una cuenta para todo Bag Voyage.'}
                    </Text>

                    {!isLogin && (
                        <View style={styles.rowGroup}>
                            <View style={[styles.inputGroup, styles.inputHalf]}>
                                <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} size={18} tintColor="#A0AEC0" />
                                <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} autoCapitalize="words" />
                            </View>
                            <View style={[styles.inputGroup, styles.inputHalf]}>
                                <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} size={18} tintColor="#A0AEC0" />
                                <TextInput style={styles.input} placeholder="Apellidos" value={apellidos} onChangeText={setApellidos} autoCapitalize="words" />
                            </View>
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
                            placeholder={isLogin ? 'Contraseña' : 'Contraseña (mínimo 8 caracteres)'}
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

                    {!isLogin && (
                        <TouchableOpacity style={styles.acceptRow} onPress={() => setAceptaTerminos((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: aceptaTerminos }}>
                            <SymbolView
                                name={aceptaTerminos ? { ios: 'checkmark.square.fill', android: 'check_box', web: 'check_box' } : { ios: 'square', android: 'check_box_outline_blank', web: 'check_box_outline_blank' }}
                                size={22}
                                tintColor={aceptaTerminos ? '#1E7C67' : '#A0AEC0'}
                            />
                            <Text style={styles.acceptText}>
                                Acepto los{' '}
                                <Text style={styles.acceptLink} onPress={() => router.push({ pathname: '/legal/[slug]', params: { slug: 'terminos' } })}>
                                    Términos de servicio
                                </Text>{' '}
                                y la{' '}
                                <Text style={styles.acceptLink} onPress={() => router.push({ pathname: '/legal/[slug]', params: { slug: 'privacidad' } })}>
                                    Política de privacidad
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={[styles.mainButton, !formularioValido && styles.mainButtonDisabled]} onPress={handleAuth} disabled={isLoading || !formularioValido}>
                        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainButtonText}>{isLogin ? 'Entrar' : 'Crear mi cuenta'}</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    waveContainer: { position: 'absolute', top: 0, width: '100%', height: 320, alignItems: 'center' },
    svg: { position: 'absolute', top: 0 },
    badge: {
        marginTop: 64,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeEmoji: { fontSize: 30 },
    scrollContent: { paddingTop: 200, paddingHorizontal: 20, paddingBottom: 50 },

    switcherContainer: { flexDirection: 'row', backgroundColor: '#EDF2F7', borderRadius: 30, padding: 4, marginBottom: 24, alignSelf: 'center', width: '82%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    switcherButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 26 },
    switcherActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    switcherText: { fontSize: 15, fontWeight: '600', color: '#A0AEC0' },
    switcherTextActive: { color: '#0B3B60' },

    formContainer: { backgroundColor: '#FFFFFF', padding: 25, borderRadius: 24, shadowColor: '#0B3B60', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 6 },
    welcomeTitle: { fontSize: 25, fontWeight: 'bold', color: '#0B3B60', marginBottom: 6, textAlign: 'center' },
    welcomeSubtitle: { fontSize: 14, color: '#718096', marginBottom: 22, textAlign: 'center', lineHeight: 20 },

    rowGroup: { flexDirection: 'row', gap: 10 },
    inputHalf: { flex: 1 },

    inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#EDF2F7', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 14 },
    input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#2D3748' },

    forgotPassword: { alignSelf: 'flex-end', marginBottom: 16 },
    forgotPasswordText: { color: '#1E7C67', fontWeight: '600', fontSize: 14 },

    acceptRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 20, marginTop: 4 },
    acceptText: { flex: 1, fontSize: 13, color: '#4A5568', lineHeight: 19 },
    acceptLink: { color: '#1E7C67', fontWeight: '700' },

    mainButton: { backgroundColor: '#0B3B60', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 6, shadowColor: '#0B3B60', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4 },
    mainButtonDisabled: { backgroundColor: '#CBD5E0', shadowOpacity: 0 },
    mainButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
});
