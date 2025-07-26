import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HelpCenterScreenProps {
  navigation: any;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface HelpCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
}

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Primeiros Passos',
    icon: 'rocket',
    description: 'Como começar a usar o Personal Medicare'
  },
  {
    id: 'treatments',
    title: 'Tratamentos',
    icon: 'medical',
    description: 'Gerenciar medicamentos e dosagens'
  },
  {
    id: 'family',
    title: 'Família',
    icon: 'people',
    description: 'Compartilhar dados com a família'
  },
  {
    id: 'notifications',
    title: 'Notificações',
    icon: 'notifications',
    description: 'Lembretes e alertas'
  },
  {
    id: 'account',
    title: 'Conta',
    icon: 'person',
    description: 'Perfil e configurações'
  },
  {
    id: 'troubleshooting',
    title: 'Problemas',
    icon: 'build',
    description: 'Soluções para problemas comuns'
  }
];

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    question: 'Como adicionar um novo membro da família?',
    answer: 'Vá para a tela inicial, toque no botão "+" e selecione "Adicionar Membro". Preencha as informações básicas como nome, relação familiar e data de nascimento.',
    category: 'getting-started'
  },
  {
    id: '2',
    question: 'Como criar um novo tratamento?',
    answer: 'Na tela de detalhes do membro, toque em "Novo Tratamento". Preencha o nome do medicamento, dosagem, frequência e duração do tratamento.',
    category: 'treatments'
  },
  {
    id: '3',
    question: 'Como compartilhar dados com minha família?',
    answer: 'Vá em Configurações > Família > Criar Nova Família. Compartilhe o código gerado com outros membros da família para que eles possam entrar no grupo.',
    category: 'family'
  },
  {
    id: '4',
    question: 'Como configurar lembretes de medicamentos?',
    answer: 'Acesse Configurações > Lembretes. Configure os horários desejados e ative as notificações push nas configurações do seu dispositivo.',
    category: 'notifications'
  },
  {
    id: '5',
    question: 'Como alterar minha senha?',
    answer: 'Vá em Configurações > Alterar Senha. Digite sua senha atual e a nova senha duas vezes. A senha deve ter pelo menos 6 caracteres.',
    category: 'account'
  },
  {
    id: '6',
    question: 'Como exportar meus dados?',
    answer: 'Em Configurações > Exportar Dados, selecione os tipos de dados desejados e escolha o formato (CSV ou JSON). O arquivo será compartilhado via sistema.',
    category: 'account'
  },
  {
    id: '7',
    question: 'As notificações não estão funcionando',
    answer: 'Verifique se as notificações estão ativadas em Configurações > Lembretes e nas configurações do seu dispositivo. Certifique-se de que o app tem permissão para enviar notificações.',
    category: 'troubleshooting'
  },
  {
    id: '8',
    question: 'Esqueci o código da família',
    answer: 'Apenas o administrador da família pode ver o código. Se você é admin, vá em Configurações > Família. Se não, peça para o admin gerar um novo código.',
    category: 'troubleshooting'
  },
  {
    id: '9',
    question: 'Como mudar o tema do aplicativo?',
    answer: 'Acesse Configurações > Tema e escolha entre Claro, Escuro ou Automático. O tema automático segue as configurações do seu dispositivo.',
    category: 'account'
  },
  {
    id: '10',
    question: 'Posso usar o app offline?',
    answer: 'Algumas funcionalidades funcionam offline, mas é recomendado ter conexão com internet para sincronização de dados e backup na nuvem.',
    category: 'troubleshooting'
  }
];

export default function HelpCenterScreen({ navigation }: HelpCenterScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = FAQ_ITEMS.filter(faq => {
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    setExpandedFAQ(null);
  };

  const handleFAQToggle = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contatar Suporte',
      'Não encontrou a resposta que procurava?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Enviar Email', 
          onPress: () => {
            // Em produção, abriria cliente de email
            Alert.alert('Email', 'Redirecionando para contato@personalmedicare.com');
          }
        }
      ]
    );
  };

  const handleVideoTutorials = () => {
    Alert.alert(
      'Tutoriais em Vídeo',
      'Em breve disponibilizaremos tutoriais em vídeo para facilitar o uso do aplicativo.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Central de Ajuda</Text>
        <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
          <Ionicons name="chatbubble" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            <Ionicons name="help-circle" size={32} color="#b081ee" />
            <Text style={styles.welcomeTitle}>Como podemos ajudar?</Text>
            <Text style={styles.welcomeText}>
              Encontre respostas para suas dúvidas ou entre em contato conosco.
            </Text>
          </View>

          {/* Search */}
          <View style={styles.searchCard}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar ajuda..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsCard}>
            <Text style={styles.quickActionsTitle}>🚀 Ações Rápidas</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickAction} onPress={handleVideoTutorials}>
                <Ionicons name="play-circle" size={24} color="#b081ee" />
                <Text style={styles.quickActionText}>Tutoriais</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={handleContactSupport}>
                <Ionicons name="mail" size={24} color="#b081ee" />
                <Text style={styles.quickActionText}>Contato</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('About')}>
                <Ionicons name="information-circle" size={24} color="#b081ee" />
                <Text style={styles.quickActionText}>Sobre</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Categories */}
          {!searchQuery && (
            <View style={styles.categoriesCard}>
              <Text style={styles.categoriesTitle}>📚 Categorias</Text>
              <View style={styles.categoriesGrid}>
                {HELP_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      selectedCategory === category.id && styles.categoryItemActive
                    ]}
                    onPress={() => handleCategorySelect(category.id)}
                  >
                    <View style={[
                      styles.categoryIcon,
                      selectedCategory === category.id && styles.categoryIconActive
                    ]}>
                      <Ionicons 
                        name={category.icon as any} 
                        size={20} 
                        color={selectedCategory === category.id ? '#fff' : '#b081ee'} 
                      />
                    </View>
                    <Text style={[
                      styles.categoryTitle,
                      selectedCategory === category.id && styles.categoryTitleActive
                    ]}>
                      {category.title}
                    </Text>
                    <Text style={[
                      styles.categoryDescription,
                      selectedCategory === category.id && styles.categoryDescriptionActive
                    ]}>
                      {category.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* FAQ */}
          <View style={styles.faqCard}>
            <Text style={styles.faqTitle}>
              ❓ Perguntas Frequentes
              {selectedCategory && (
                <Text style={styles.faqCategoryFilter}>
                  {' • '}{HELP_CATEGORIES.find(c => c.id === selectedCategory)?.title}
                </Text>
              )}
            </Text>

            {filteredFAQs.length === 0 ? (
              <View style={styles.noResults}>
                <Ionicons name="search" size={48} color="#ccc" />
                <Text style={styles.noResultsText}>
                  {searchQuery ? 'Nenhum resultado encontrado' : 'Selecione uma categoria acima'}
                </Text>
              </View>
            ) : (
              filteredFAQs.map((faq) => (
                <View key={faq.id} style={styles.faqItem}>
                  <TouchableOpacity
                    style={styles.faqQuestion}
                    onPress={() => handleFAQToggle(faq.id)}
                  >
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                    <Ionicons
                      name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                  {expandedFAQ === faq.id && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>

          {/* Still Need Help */}
          <View style={styles.stillNeedHelpCard}>
            <Ionicons name="headset" size={24} color="#b081ee" />
            <Text style={styles.stillNeedHelpTitle}>Ainda precisa de ajuda?</Text>
            <Text style={styles.stillNeedHelpText}>
              Nossa equipe de suporte está pronta para ajudar você.
            </Text>
            <TouchableOpacity style={styles.contactSupportButton} onPress={handleContactSupport}>
              <Ionicons name="mail" size={20} color="#fff" />
              <Text style={styles.contactSupportText}>Entrar em Contato</Text>
            </TouchableOpacity>
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
  contactButton: {
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
  searchCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    marginRight: 8,
  },
  quickActionsCard: {
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
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    minWidth: 80,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    fontWeight: '600',
  },
  categoriesCard: {
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
  categoriesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryItemActive: {
    backgroundColor: '#b081ee',
    borderColor: '#b081ee',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0eaff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryTitleActive: {
    color: '#fff',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  categoryDescriptionActive: {
    color: 'rgba(255,255,255,0.8)',
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
    marginBottom: 16,
  },
  faqCategoryFilter: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#b081ee',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    marginBottom: 8,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingBottom: 16,
    paddingRight: 32,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  stillNeedHelpCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stillNeedHelpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  stillNeedHelpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactSupportButton: {
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactSupportText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});