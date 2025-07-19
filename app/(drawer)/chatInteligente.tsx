import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
import { askGeminiChat } from '../../services/gemini';

interface Message {
  from: 'user' | 'ia';
  text: string;
  time: string;
}

function MessageBubble({ item }: { item: Message }) {
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);
  const { startAnimation } = useEntranceAnimation();

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: Message = {
      from: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await askGeminiChat(text);
      const iaMessage: Message = {
        from: 'ia',
        text: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      
      setMessages(prev => [...prev, iaMessage]);
      
      // Scroll para o final após adicionar mensagem
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        from: 'ia',
        text: 'Desculpe, não consegui responder agora. Tente novamente.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? -50 : 0}
    >
      <ThemedView style={styles.container}>
        <View style={styles.chatContainer}>
          {/* Header do Chat */}
          <View style={styles.chatHeader}>
            <View style={styles.agentInfo}>
              <Image 
                source={require('../../assets/images/medica-avatar.png')} 
                style={styles.agentAvatar}
              />
              <View style={styles.agentDetails}>
                <ThemedText style={styles.agentName}>Melissa Parker</ThemedText>
                <ThemedText style={styles.agentEmail}>suporte@flowinx.com</ThemedText>
              </View>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.messagesContainer}>
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
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={input}
                onChangeText={setInput}
                placeholder="Type your message..."
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
                  <Ionicons name="arrow-up" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
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
    height: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  messageContainer: {
    padding: 10,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#b081ee',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingRight: 60,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButton: {
    backgroundColor: '#b081ee',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 10,
    top: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#d4b5f7',
  },
  messagesList: {
    paddingVertical: 10,
    paddingBottom: 20, // Mais espaço no final da lista
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginHorizontal: 10,
  },
  messageTime: {
    color: '#b081ee',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#b081ee',
  },
  agentDetails: {
    flexDirection: 'column',
  },
  agentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  agentEmail: {
    fontSize: 12,
    color: '#666',
  },
  addButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
  },
}); 