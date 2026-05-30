import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';

const CustomTabBarButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={{
      top: -20,
      justifyContent: 'center',
      alignItems: 'center',
    }}
    onPress={onPress}
  >
    <View style={{
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#1E7C67', // Emerald Green from mockup
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#1E7C67',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5,
    }}>
      {children}
    </View>
  </TouchableOpacity>
);

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0B3B60', // Dark Blue
        tabBarInactiveTintColor: '#A0AEC0',
        headerShown: useClientOnlyValue(false, true),
        headerStyle: { backgroundColor: '#0B3B60' },
        headerTintColor: '#fff',
        tabBarStyle: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: '#FFFFFF',
          position: 'absolute',
          height: 80,
          paddingBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarShowLabel: false, // Hide labels as per mockup
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ruta Guinea',
          tabBarIcon: ({ color }) => <SymbolView name={{ ios: 'house.fill', android: 'home', web: 'home' }} tintColor={color} size={28} />,
          headerTitleAlign: 'center',
          headerLeft: () => (
            <SymbolView name={{ ios: 'line.3.horizontal', android: 'menu', web: 'menu' }} tintColor="#fff" size={24} style={{ marginLeft: 20 }} />
          ),
          headerRight: () => (
            <View style={{ marginRight: 20, position: 'relative' }}>
              <SymbolView name={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }} tintColor="#fff" size={24} />
              <View style={styles.badge} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="buscar"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color }) => <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} tintColor={color} size={28} />,
          headerTitleAlign: 'center',
        }}
      />
      <Tabs.Screen
        name="publicar"
        options={{
          title: 'Publicar',
          tabBarIcon: ({ focused }) => <CustomTabBarButton><SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} tintColor="#fff" size={28} /></CustomTabBarButton>,
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
          headerTitleAlign: 'center',
        }}
      />
      <Tabs.Screen
        name="ubicacion"
        options={{
          title: 'Ubicación',
          tabBarIcon: ({ color }) => <SymbolView name={{ ios: 'map.fill', android: 'map', web: 'map' }} tintColor={color} size={28} />,
          headerTitleAlign: 'center',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Mensajes',
          tabBarIcon: ({ color }) => <SymbolView name={{ ios: 'message.fill', android: 'chat', web: 'chat' }} tintColor={color} size={28} />,
          headerTitleAlign: 'center',
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} tintColor={color} size={28} />,
          headerTitleAlign: 'center',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: 'red',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#0B3B60'
  }
});
