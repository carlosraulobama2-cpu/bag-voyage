import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const initialMessages = [
    { id: '1', text: 'Hola, vi tu publicación para envío a Malabo. ¿Aún tienes espacio?', sender: 'other', time: '10:00 AM' },
    { id: '2', text: '¡Hola! Sí, todavía me quedan 5kg disponibles.', sender: 'me', time: '10:05 AM' },
    { id: '3', text: 'Perfecto. Necesito enviar unos documentos.', sender: 'other', time: '10:06 AM' }
];

export default function ChatScreen() {
    const [messages, setMessages] = useState(initialMessages);
    const [inputText, setInputText] = useState('');

    const sendMessage = () => {
        if (inputText.trim()) {
            setMessages([...messages, {
                id: Date.now().toString(),
                text: inputText,
                sender: 'me',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setInputText('');
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.messageBubble, item.sender === 'me' ? styles.myMessage : styles.otherMessage]}>
            <Text style={[styles.messageText, item.sender === 'me' ? styles.myMessageText : styles.otherMessageText]}>{item.text}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.messageList}
                    inverted={false}
                />
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Escribe un mensaje..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Text style={styles.sendButtonText}>Enviar</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    keyboardView: { flex: 1, paddingBottom: 80 }, // Account for the tab bar
    messageList: { padding: 15, paddingBottom: 20 },
    messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 10 },
    myMessage: { alignSelf: 'flex-end', backgroundColor: '#1E7C67', borderBottomRightRadius: 4 },
    otherMessage: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    messageText: { fontSize: 16 },
    myMessageText: { color: '#FFFFFF' },
    otherMessageText: { color: '#2D3748' },
    timeText: { fontSize: 10, color: '#A0AEC0', alignSelf: 'flex-end', marginTop: 4 },
    inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EDF2F7', alignItems: 'center' },
    input: { flex: 1, backgroundColor: '#EDF2F7', borderRadius: 20, paddingHorizontal: 15, paddingTop: 12, paddingBottom: 12, fontSize: 16, maxHeight: 100 },
    sendButton: { marginLeft: 10, backgroundColor: '#0B3B60', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20 },
    sendButtonText: { color: '#FFFFFF', fontWeight: 'bold' }
});
