import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../src/config';
import { useAppStore } from '../src/store/useAppStore';
import { api, ApiError, type Mensaje } from '../src/services/api';

const { width } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  texto: string | null;
  audioUri: string | null;
  isMe: boolean;
  time: string;
}

function aChatMessage(m: Mensaje, miId?: string): ChatMessage {
  return {
    id: m.id,
    texto: m.texto,
    audioUri: m.audio_url,
    isMe: m.remitente_id === miId,
    time: new Date(m.created_at).toLocaleTimeString().slice(0, 5),
  };
}

export default function TripChatScreen() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const { rideId, driverNombre, driverApellidos, vehiculoMarca, vehiculoModelo, vehiculoPlaca } = useLocalSearchParams<{
    rideId?: string;
    driverNombre?: string;
    driverApellidos?: string;
    vehiculoMarca?: string;
    vehiculoModelo?: string;
    vehiculoPlaca?: string;
  }>();

  const driverName = driverNombre ? `${driverNombre} ${driverApellidos || ''}`.trim() : 'Tu conductor';
  const carInfo = [vehiculoMarca, vehiculoModelo].filter(Boolean).join(' ') + (vehiculoPlaca ? ` • ${vehiculoPlaca}` : '');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [cargando, setCargando] = useState(true);
  const [inputText, setInputText] = useState('');
  const socketRef = useRef<Socket | null>(null);

  // Estados para audio
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [subiendoAudio, setSubiendoAudio] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    if (!rideId) {
      setCargando(false);
      return;
    }

    api.mensajes
      .listar(rideId)
      .then(({ data }) => setMessages(data.map((m) => aChatMessage(m, user?.id))))
      .catch(() => {})
      .finally(() => setCargando(false));
    api.mensajes.marcarLeidos(rideId).catch(() => {});

    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.on('connect', () => socket.emit('join_ride', rideId));
    socket.on('new_message', (data: { id: string; remitenteId: string; texto: string | null; audioUrl: string | null; createdAt: string }) => {
      setMessages((prev) => [
        ...prev,
        aChatMessage({ id: data.id, remitente_id: data.remitenteId, texto: data.texto, audio_url: data.audioUrl, leido: false, created_at: data.createdAt }, user?.id),
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [rideId]);

  const sendMessage = () => {
    if (!inputText.trim() || !rideId || !user) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    socketRef.current?.emit('send_message', { rideId, usuarioId: user.id, texto: inputText.trim() });
    setInputText('');
  };

  // ----- LÓGICA DE NOTAS DE VOZ -----
  const startRecording = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsRecording(true);
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsRecording(false);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      // Antes esto agregaba el audio local (`file://...`) directo a la
      // lista de mensajes: nunca viajaba al servidor, así que el otro lado
      // (ni el propio dispositivo tras reiniciar) podía reproducirlo. Ahora
      // se sube como cualquier otra imagen/archivo y se manda la URL real.
      if (uri && rideId && user) {
        setSubiendoAudio(true);
        try {
          const { url } = await api.uploads.subirAudio(uri);
          socketRef.current?.emit('send_message', { rideId, usuarioId: user.id, audioUrl: url });
        } catch (e) {
          console.error('No se pudo subir la nota de voz', e);
        } finally {
          setSubiendoAudio(false);
        }
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const playAudio = async (uri: string, id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Si ya hay un sonido reproduciéndose, pararlo
      if (sound) {
        await sound.unloadAsync();
      }
      
      setPlayingId(id);
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      await newSound.playAsync();
      
      // Cuando termine, resetear el estado
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
        }
      });
    } catch (err) {
      console.error('Failed to play audio', err);
      setPlayingId(null);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.isMe;

    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.driverMessage]}>
        {item.audioUri ? (
          <TouchableOpacity
            style={styles.audioContainer}
            onPress={() => playAudio(item.audioUri!, item.id)}
          >
            <SymbolView name={{ ios: playingId === item.id ? 'pause.circle.fill' : 'play.circle.fill', android: playingId === item.id ? 'pause_circle' : 'play_circle', web: 'play_circle' }} size={28} tintColor={isMe ? '#FFFFFF' : '#1E7C67'} />
            <View style={[styles.audioWave, { backgroundColor: isMe ? '#FFFFFF' : '#CBD5E0' }]} />
            <Text style={[styles.audioText, isMe && {color: '#FFFFFF'}]}>🎙️ Nota de voz</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.messageText, isMe && styles.myMessageText]}>{item.texto}</Text>
        )}
        <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>{item.time}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <SymbolView name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }} size={24} tintColor="#2D3748" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.avatar} />
          <View>
            <Text style={styles.driverName}>{driverName}</Text>
            {!!carInfo && <Text style={styles.carInfo}>{carInfo}</Text>}
          </View>
        </View>

        <TouchableOpacity style={styles.callBtn}>
          <SymbolView name={{ ios: 'phone.fill', android: 'phone', web: 'phone' }} size={20} tintColor="#1E7C67" />
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      {cargando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#1E7C67" size="large" />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatList}
          inverted={false}
        />
      )}
      {subiendoAudio && (
        <View style={styles.uploadingBanner}>
          <ActivityIndicator color="#1E7C67" size="small" />
          <Text style={styles.uploadingText}>Enviando nota de voz...</Text>
        </View>
      )}

      {/* Alerta de Grabación (Overlay invisible pero bloqueante si graba) */}
      {isRecording && (
        <View style={styles.recordingOverlay}>
          <View style={styles.recordingCard}>
            <SymbolView name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }} size={40} tintColor="#E53E3E" />
            <Text style={styles.recordingText}>Grabando nota de voz...</Text>
            <Text style={styles.recordingSub}>Suelta para enviar</Text>
          </View>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.textInput}
          placeholder="Escribe un mensaje..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        
        {inputText.length > 0 ? (
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <SymbolView name={{ ios: 'paperplane.fill', android: 'send', web: 'send' }} size={20} tintColor="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.sendBtn, styles.micBtn, isRecording && styles.micBtnRecording]} 
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <SymbolView name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }} size={24} tintColor="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingTop: 60, paddingBottom: 15, paddingHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, zIndex: 10 },
  backBtn: { padding: 5, marginRight: 15 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#CBD5E0', marginRight: 10 },
  driverName: { fontSize: 16, fontWeight: 'bold', color: '#2D3748' },
  carInfo: { fontSize: 12, color: '#718096' },
  callBtn: { backgroundColor: '#E6FFFA', padding: 10, borderRadius: 20 },

  chatList: { padding: 20, flexGrow: 1, justifyContent: 'flex-end' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  uploadingBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 8, backgroundColor: '#E6FFFA' },
  uploadingText: { color: '#1E7C67', fontWeight: '600', fontSize: 13 },

  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 18, marginBottom: 15 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#1E7C67', borderBottomRightRadius: 4 },
  driverMessage: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  
  messageText: { fontSize: 16, color: '#2D3748' },
  myMessageText: { color: '#FFFFFF' },
  messageTime: { fontSize: 11, color: '#A0AEC0', alignSelf: 'flex-end', marginTop: 5 },
  myMessageTime: { color: '#A0AEC0' },

  audioContainer: { flexDirection: 'row', alignItems: 'center', minWidth: 150 },
  audioWave: { flex: 1, height: 3, marginHorizontal: 10, borderRadius: 2 },
  audioText: { fontSize: 14, fontWeight: '600', color: '#1E7C67' },

  inputArea: { flexDirection: 'row', alignItems: 'flex-end', padding: 15, paddingBottom: Platform.OS === 'ios' ? 30 : 15, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#EDF2F7' },
  textInput: { flex: 1, backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, paddingHorizontal: 15, paddingTop: 12, paddingBottom: 12, minHeight: 45, maxHeight: 100, fontSize: 16 },
  
  sendBtn: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#1E7C67', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  micBtn: { backgroundColor: '#E53E3E' },
  micBtnRecording: { transform: [{ scale: 1.2 }], backgroundColor: '#C53030' },

  recordingOverlay: { position: 'absolute', top: 100, left: 0, right: 0, bottom: 100, justifyContent: 'center', alignItems: 'center', zIndex: 20 },
  recordingCard: { backgroundColor: '#FFFFFF', padding: 30, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  recordingText: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginTop: 15 },
  recordingSub: { fontSize: 14, color: '#718096', marginTop: 5 }
});
