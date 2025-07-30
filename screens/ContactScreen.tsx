import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

interface ContactScreenProps {
  navigation: any;
}

interface ContactMethod {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
  color: string;
}

export default function ContactScreen({ navigation }: ContactScreenProps) {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const subjects = [
    'Dúvida sobre funcionalidade',
    'Problema técnico',
    'Sugestão de melhoria',
    'Erro no aplicativo',
    'Solicitação de recurso',
    'Feedback geral',
    'Outro'
  ];

  const handleEmailContact = async () => {
    const subject = encodeURIComponent('Contato - Personal Medicare');
    const body = encodeURIComponent('Olá,\n\nEstou entrando em contato sobre o Personal Medicare.\n\n');
    const emailUrl = `mailto:suporte@personalmedicare.flowinx.com?subject=${subject}&body=${body}`;
    
    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert('Email', 'suporte@personalmedicare.flowinx.com');
      }
    } catch (error) {
      Alert.alert('Email', 'suporte@personalmedicare.flowinx.com');
    }
  };

  const handleWhatsAppContact = async () => {
    const message = encodeURIComponent('Olá! Preciso de ajuda com o Personal Medicare.');
    const whatsappUrl = `https://wa.me/5519960000431?text=${message}`;
    
    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert(
          'WhatsApp não disponível',
          'WhatsApp não está instalado ou disponível neste dispositivo.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
    }
  };

  const handlePhoneContact = async () => {
    const phoneUrl = 'tel:+5519960000431';
    
    try {
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Telefone', '+55 (19) 99600-0043');
      }
    } catch (error) {
      Alert.alert('Telefone', '+55 (19) 99600-0043');
    }
  };

  const handleWebsiteContact = async () => {
    const websiteUrl = 'https://personalmedicare.flowinx.com';
    
    try {
      const canOpen = await Linking.canOpenURL(websiteUrl);
      if (canOpen) {
        await Linking.openURL(websiteUrl);
      } else {
        Alert.alert('Website', 'https://personalmedicare.flowinx.com');
      }
    } catch (error) {
      Alert.alert('Website', 'https://personalmedicare.flowinx.com');
    }
  };

  const contactMethods: ContactMethod[] = [
    {
      id: 'email',
      title: 'Email',
      subtitle: 'suporte@personalmedicare.flowinx.com',
      icon: 'mail',
      action: handleEmailContact,
      color: '#b081ee'
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      subtitle: '+55 (19) 99600-0043',
      icon: 'logo-whatsapp',
      action: handleWhatsAppContact,
      color: '#25D366'
    },
    {
      id: 'phone',
      title: 'Telefone',
      subtitle: '+55 (19) 99600-0043',
      icon: 'call',
      action: handlePhoneContact,
      color: '#FF9500'
    },
    {
      id: 'website',
      title: 'Website',
      subtitle: 'https://personalmedicare.flowinx.com',
      icon: 'globe',
      action: handleWebsiteContact,
      color: '#34C759'
    }
  ];

  const handleSendMessage = async () => {
    // Validações dos campos
    if (!senderName.trim()) {
      Alert.alert('Erro', 'Digite seu nome');
      return;
    }

    if (!senderEmail.trim()) {
      Alert.alert('Erro', 'Digite seu email');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail.trim())) {
      Alert.alert('Erro', 'Digite um email válido');
      return;
    }

    if (!selectedSubject) {
      Alert.alert('Erro', 'Selecione um assunto');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Erro', 'Digite sua mensagem');
      return;
    }

    setLoading(true);
    
    try {
      // SOLUÇÃO TEMPORÁRIA: Usar cliente de email nativo
      const timestamp = new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      const emailSubject = encodeURIComponent(`[Personal Medicare] ${selectedSubject}`);
      const emailBody = encodeURIComponent(`
NOVA MENSAGEM DE CONTATO - PERSONAL MEDICARE

👤 Nome: ${senderName.trim()}
📧 Email: ${senderEmail.trim()}
📋 Assunto: ${selectedSubject}
🕐 Data/Hora: ${timestamp}

💬 Mensagem:
${message.trim()}

---
Enviado via Personal Medicare App
Responda diretamente para: ${senderEmail.trim()}
      `);

      const emailUrl = `mailto:suporte@personalmedicare.flowinx.com?subject=${emailSubject}&body=${emailBody}`;
      
      // Tentar abrir cliente de email
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
        
        // Mostrar confirmação após abrir cliente de email
        setTimeout(() => {
          Alert.alert(
            'Cliente de Email Aberto! 📧',
            `Olá ${senderName}!\n\nO cliente de email foi aberto com sua mensagem pré-preenchida para contato@personalmedicare.flowinx.com.\n\nApós enviar o email, nossa equipe responderá em até 24 horas no email ${senderEmail}.\n\nObrigado por usar o Personal Medicare! 💊`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Limpar todos os campos
                  setSenderName('');
                  setSenderEmail('');
                  setSelectedSubject('');
                  setMessage('');
                }
              }
            ]
          );
        }, 1000);
        
      } else {
        // Fallback: Mostrar informações para contato manual
        Alert.alert(
          'Contato Manual 📞',
          `Cliente de email não disponível.\n\nEnvie sua mensagem manualmente para:\n\n📧 contato@personalmedicare.flowinx.com\n\nAssunto: [Personal Medicare] ${selectedSubject}\n\nIncluir:\n• Nome: ${senderName}\n• Email: ${senderEmail}\n• Mensagem: ${message.substring(0, 50)}...`,
          [
            { text: 'Copiar Email', onPress: () => {
              // Em produção, usar Clipboard API
              Alert.alert('Email', 'suporte@personalmedicare.flowinx.com');
            }},
            { text: 'OK', onPress: () => {
              setSenderName('');
              setSenderEmail('');
              setSelectedSubject('');
              setMessage('');
            }}
          ]
        );
      }
      
    } catch (error: any) {
      console.error('Erro ao abrir cliente de email:', error);
      
      Alert.alert(
        'Erro no Envio ❌',
        `Não foi possível abrir o cliente de email.\n\nEntre em contato diretamente:\n📧 contato@personalmedicare.flowinx.com\n\nAssunto: [Personal Medicare] ${selectedSubject}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleHelpCenter = () => {
    navigation.navigate('HelpCenter');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contato</Text>
        <TouchableOpacity style={styles.helpButton} onPress={handleHelpCenter}>
          <Ionicons name="help-circle" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            <Ionicons name="chatbubbles" size={32} color="#b081ee" />
            <Text style={styles.welcomeTitle}>Fale Conosco</Text>
            <Text style={styles.welcomeText}>
              Estamos aqui para ajudar! Entre em contato conosco através dos canais abaixo.
            </Text>
          </View>

          {/* Contact Methods */}
          <View style={styles.methodsCard}>
            <Text style={styles.methodsTitle}>📞 Canais de Contato</Text>
            {contactMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.methodItem}
                onPress={method.action}
              >
                <View style={[styles.methodIcon, { backgroundColor: `${method.color}20` }]}>
                  <Ionicons name={method.icon as any} size={24} color={method.color} />
                </View>
                <View style={styles.methodContent}>
                  <Text style={styles.methodTitle}>{method.title}</Text>
                  <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>✉️ Enviar Mensagem</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nome *</Text>
              <TextInput
                style={styles.textInput}
                value={senderName}
                onChangeText={setSenderName}
                placeholder="Seu nome completo"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.textInput}
                value={senderEmail}
                onChangeText={setSenderEmail}
                placeholder="seu@email.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Assunto *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectsScroll}>
                <View style={styles.subjectsContainer}>
                  {subjects.map((subject) => (
                    <TouchableOpacity
                      key={subject}
                      style={[
                        styles.subjectChip,
                        selectedSubject === subject && styles.subjectChipActive
                      ]}
                      onPress={() => setSelectedSubject(subject)}
                    >
                      <Text style={[
                        styles.subjectChipText,
                        selectedSubject === subject && styles.subjectChipTextActive
                      ]}>
                        {subject}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mensagem *</Text>
              <TextInput
                style={[styles.textInput, styles.messageInput]}
                value={message}
                onChangeText={setMessage}
                placeholder="Descreva sua dúvida, problema ou sugestão..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.sendButton, loading && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text style={styles.sendButtonText}>Enviar Mensagem</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Response Time */}
          <View style={styles.responseCard}>
            <Ionicons name="time" size={20} color="#b081ee" />
            <Text style={styles.responseTitle}>Tempo de Resposta</Text>
            <Text style={styles.responseText}>
              Respondemos todas as mensagens em até 24 horas durante dias úteis.
            </Text>
          </View>

          {/* FAQ Link */}
          <View style={styles.faqCard}>
            <Ionicons name="help-circle" size={20} color="#b081ee" />
            <Text style={styles.faqTitle}>Dúvidas Frequentes</Text>
            <Text style={styles.faqText}>
              Antes de entrar em contato, verifique se sua dúvida já foi respondida.
            </Text>
            <TouchableOpacity style={styles.faqButton} onPress={handleHelpCenter}>
              <Text style={styles.faqButtonText}>Ver Central de Ajuda</Text>
              <Ionicons name="arrow-forward" size={16} color="#b081ee" />
            </TouchableOpacity>
          </View>

          {/* Office Hours */}
          <View style={styles.hoursCard}>
            <Text style={styles.hoursTitle}>🕐 Horário de Atendimento</Text>
            <View style={styles.hoursItem}>
              <Text style={styles.hoursDay}>Segunda a Sexta:</Text>
              <Text style={styles.hoursTime}>9h às 18h</Text>
            </View>
            <View style={styles.hoursItem}>
              <Text style={styles.hoursDay}>Sábado:</Text>
              <Text style={styles.hoursTime}>9h às 14h</Text>
            </View>
            <View style={styles.hoursItem}>
              <Text style={styles.hoursDay}>Domingo:</Text>
              <Text style={styles.hoursTime}>Fechado</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  methodsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  methodsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  messageInput: {
    height: 100,
    paddingTop: 12,
  },
  subjectsScroll: {
    marginTop: 4,
  },
  subjectsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  subjectChip: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  subjectChipActive: {
    backgroundColor: '#b081ee',
    borderColor: '#b081ee',
  },
  subjectChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  subjectChipTextActive: {
    color: '#fff',
  },
  sendButton: {
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  responseCard: {
    backgroundColor: '#f0eaff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  responseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    marginBottom: 8,
  },
  faqText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
    marginBottom: 16,
    lineHeight: 20,
  },
  faqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0eaff',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  faqButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b081ee',
  },
  hoursCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  hoursItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  hoursDay: {
    fontSize: 14,
    color: '#666',
  },
  hoursTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});