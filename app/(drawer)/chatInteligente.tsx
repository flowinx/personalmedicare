import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
import { askGroqChat } from '../../services/groq';

const FAQS = [
  { icon: 'heart', text: 'Como prevenir doenças cardíacas?' },
  { icon: 'smile-o', text: 'Sintomas de ansiedade e como lidar' },
  { icon: 'calendar', text: 'Quando procurar um médico?' },
  { icon: 'leaf', text: 'Dicas de alimentação saudável' },
];

function MessageBubble({ item }: { item: any }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);
  const isUser = item.from === 'user';
  
  return (
    <Animated.View style={[
      styles.messageBubble,
      isUser ? styles.userMessage : styles.botMessage,
      { opacity: fadeAnim }
    ]}>
      <ThemedText style={[
        styles.messageText,
        isUser ? styles.userMessageText : styles.botMessageText
      ]}>
        {item.text}
      </ThemedText>
      <ThemedText style={styles.messageTime}>{item.time}</ThemedText>
    </Animated.View>
  );
}

export default function ChatInteligenteScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<{ from: string; text: string; time: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { fadeAnim, slideAnim, scaleAnim, startAnimation } = useEntranceAnimation();

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [
      ...prev,
      { from: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
    ]);
    setInput('');
    setLoading(true);
    try {
      const response = await askGroqChat(text);
      setMessages(prev => [
        ...prev,
        { from: 'ia', text: response, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
      ]);
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        { from: 'ia', text: 'Desculpe, não consegui responder agora. Tente novamente.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Scroll para o final quando novas mensagens são adicionadas
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ThemedView style={styles.container}>
        <View style={styles.faqContainer}>
          <ThemedText style={styles.faqTitle} lightColor="#2d1155" darkColor="#2d1155">Perguntas frequentes:</ThemedText>
          <View style={styles.faqList}>
            {FAQS.map(faq => (
              <TouchableOpacity key={faq.text} style={styles.faqButton} onPress={() => sendMessage(faq.text)}>
                <Ionicons name={faq.icon as any} size={18} color="#b081ee" style={{ marginRight: 6 }} />
                <ThemedText style={styles.faqButtonText} lightColor="#2d1155" darkColor="#2d1155">{faq.text}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.chatContainer}>
          <FlatList
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <MessageBubble item={item} />
            )}
            contentContainerStyle={styles.messagesList}
            ref={flatListRef}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Digite sua pergunta..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            onFocus={() => {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 300);
            }}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]} 
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 10, // Reduzir padding bottom para dar mais espaço
  },
  bubble: {
    maxWidth: '95%',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  iaBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ede7f6',
  },
  bubbleText: {
    color: '#2d1155',
    fontSize: 16,
  },
  bubbleTime: {
    color: '#b081ee',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  faqContainer: {
    marginBottom: 20,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  faqList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  faqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  faqButtonText: {
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#b081ee',
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2d1155',
    marginRight: 8,
  },

  infoText: {
    color: '#b081ee',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#b081ee',
  },
  chatContainer: {
    flex: 1,
    marginBottom: 10, // Adicionar margem para separar do input
  },
  messageContainer: {
    padding: 10,
  },
  messageText: {
    fontSize: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#b081ee',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    maxWidth: '80%',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    maxWidth: '80%',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  userMessageText: {
    color: 'white',
  },
  botMessageText: {
    color: '#2d1155',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Alinhar ao final para melhor comportamento com multiline
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Mais padding no iOS
    backgroundColor: 'transparent',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#b081ee',
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2d1155',
    marginRight: 8,
    maxHeight: 100, // Limitar altura máxima
    minHeight: 40, // Altura mínima
  },
  sendButton: {
    backgroundColor: '#b081ee',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40, // Garantir altura mínima
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  messagesList: {
    paddingVertical: 10,
    paddingBottom: 20, // Mais espaço no final da lista
  },
  messageBubble: {
    maxWidth: '95%',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  messageTime: {
    color: '#b081ee',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
}); 