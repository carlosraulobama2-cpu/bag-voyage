import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function PerfilScreen() {
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Image source={{ uri: 'https://i.pravatar.cc/150?img=33' }} style={styles.avatar} />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>Carlos Raúl</Text>
                    <View style={styles.verificationBadge}>
                        <SymbolView name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }} size={16} tintColor="#1E7C67" />
                        <Text style={styles.verifiedText}>Perfil Verificado</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>4.9</Text>
                    <Text style={styles.statLabel}>Valoración⭐⭐⭐⭐⭐</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>12</Text>
                    <Text style={styles.statLabel}>Viajes</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>34</Text>
                    <Text style={styles.statLabel}>Envíos</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ajustes de Cuenta</Text>

                <TouchableOpacity style={styles.settingItem}>
                    <SymbolView name={{ ios: 'person', android: 'person', web: 'person' }} size={24} tintColor="#4A5568" />
                    <Text style={styles.settingText}>Editar Perfil</Text>
                    <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={20} tintColor="#A0AEC0" />
                </TouchableOpacity>

                {/* Nuevo botón para ir al KYC de Conductor */}
                <TouchableOpacity 
                    style={styles.settingItem}
                    onPress={() => require('expo-router').router.push('/driver-registration')}
                >
                    <SymbolView name={{ ios: 'car', android: 'directions_car', web: 'directions_car' }} size={24} tintColor="#1E7C67" />
                    <Text style={[styles.settingText, { color: '#1E7C67', fontWeight: 'bold' }]}>Hazte Viajero / Conductor</Text>
                    <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={20} tintColor="#1E7C67" />
                </TouchableOpacity>

                {/* Opción 2: Invita y Gana (Referidos) */}
                <TouchableOpacity 
                    style={styles.settingItem}
                    onPress={() => require('expo-router').router.push('/referrals')}
                >
                    <SymbolView name={{ ios: 'gift', android: 'card_giftcard', web: 'card_giftcard' }} size={24} tintColor="#D69E2E" />
                    <Text style={[styles.settingText, { color: '#D69E2E', fontWeight: 'bold' }]}>Invita y Gana 500 FCFA</Text>
                    <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={20} tintColor="#D69E2E" />
                </TouchableOpacity>

                {/* Opción Billetera */}
                <TouchableOpacity 
                    style={styles.settingItem}
                    onPress={() => require('expo-router').router.push('/wallet')}
                >
                    <SymbolView name={{ ios: 'creditcard', android: 'wallet', web: 'wallet' }} size={24} tintColor="#1E7C67" />
                    <Text style={[styles.settingText, { color: '#1E7C67', fontWeight: 'bold' }]}>Mi Billetera (Bag-Wallet)</Text>
                    <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={20} tintColor="#1E7C67" />
                </TouchableOpacity>

                {/* Opción Panel Restaurantes (Solo Dueños) */}
                <TouchableOpacity 
                    style={styles.settingItem}
                    onPress={() => require('expo-router').router.push('/restaurant-dashboard')}
                >
                    <SymbolView name={{ ios: 'briefcase', android: 'store', web: 'store' }} size={24} tintColor="#E53E3E" />
                    <Text style={[styles.settingText, { color: '#E53E3E', fontWeight: 'bold' }]}>Acceso Dueños de Restaurante</Text>
                    <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={20} tintColor="#E53E3E" />
                </TouchableOpacity>

                {/* Opción: registrar un comercio nuevo (restaurante/tienda) */}
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => require('expo-router').router.push('/restaurant-registration')}
                >
                    <SymbolView name={{ ios: 'storefront', android: 'storefront', web: 'storefront' }} size={24} tintColor="#E53E3E" />
                    <Text style={[styles.settingText, { color: '#E53E3E', fontWeight: 'bold' }]}>Registra tu Comercio</Text>
                    <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={20} tintColor="#E53E3E" />
                </TouchableOpacity>

                {/* Opción 3: Historial de Viajes */}
                <TouchableOpacity 
                    style={styles.settingItem}
                    onPress={() => require('expo-router').router.push('/trip-history')}
                >
                    <SymbolView name={{ ios: 'clock', android: 'history', web: 'history' }} size={24} tintColor="#4A5568" />
                    <Text style={styles.settingText}>Historial de Viajes</Text>
                    <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={20} tintColor="#A0AEC0" />
                </TouchableOpacity>

                <View style={styles.settingItem}>
                    <SymbolView name={{ ios: 'bell', android: 'notifications', web: 'notifications' }} size={24} tintColor="#4A5568" />
                    <Text style={styles.settingText}>Notificaciones</Text>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: '#CBD5E0', true: '#1E7C67' }}
                        thumbColor={'#FFFFFF'}
                    />
                </View>

                <TouchableOpacity style={styles.settingItem}>
                    <SymbolView name={{ ios: 'lock', android: 'lock', web: 'lock' }} size={24} tintColor="#4A5568" />
                    <Text style={styles.settingText}>Privacidad y Seguridad</Text>
                    <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={20} tintColor="#A0AEC0" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton}>
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#F7FAFC', padding: 20, paddingBottom: 100 },
    header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, marginBottom: 20 },
    avatar: { width: 80, height: 80, borderRadius: 40, marginRight: 20 },
    userInfo: { flex: 1 },
    userName: { fontSize: 22, fontWeight: 'bold', color: '#0B3B60', marginBottom: 5 },
    verificationBadge: { flexDirection: 'row', alignItems: 'center' },
    verifiedText: { fontSize: 14, color: '#1E7C67', fontWeight: '600', marginLeft: 5 },
    statsContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    statBox: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: 'bold', color: '#0B3B60', marginBottom: 5 },
    statLabel: { fontSize: 12, color: '#718096' },
    statDivider: { width: 1, backgroundColor: '#EDF2F7' },
    section: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0B3B60', marginBottom: 15 },
    settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
    settingText: { flex: 1, fontSize: 16, color: '#2D3748', marginLeft: 15 },
    logoutButton: { backgroundColor: '#FED7D7', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    logoutText: { color: '#C53030', fontSize: 16, fontWeight: 'bold' }
});
