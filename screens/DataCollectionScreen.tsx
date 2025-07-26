import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DataCollectionScreenProps {
  navigation: any;
}

export default function DataCollectionScreen({ navigation }: DataCollectionScreenProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sobre a Coleta de Dados</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.introSection}>
            <View style={styles.introCard}>
              <Ionicons name="information-circle" size={48} color="#b081ee" />
              <Text style={styles.introTitle}>Transparência Total</Text>
              <Text style={styles.introText}>
                Explicamos de forma clara e detalhada quais dados coletamos, por que coletamos e como os utilizamos para melhorar sua experiência.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Dados que Coletamos</Text>
            
            <View style={styles.dataCategory}>
              <View style={styles.categoryHeader}>
                <Ionicons name="person" size={24} color="#34C759" />
                <Text style={styles.categoryTitle}>Informações Pessoais</Text>
              </View>
              <Text style={styles.categoryText}>
                • Nome completo{'\n'}
                • Email e telefone{'\n'}
                • Data de nascimento{'\n'}
                • Foto de perfil (opcional)
              </Text>
              <Text style={styles.purposeText}>
                <Text style={styles.purposeLabel}>Por quê:</Text> Para criar e personalizar sua conta, permitir login seguro e facilitar o contato quando necessário.
              </Text>
            </View>

            <View style={styles.dataCategory}>
              <View style={styles.categoryHeader}>
                <Ionicons name="medical" size={24} color="#FF6B6B" />
                <Text style={styles.categoryTitle}>Dados de Saúde</Text>
              </View>
              <Text style={styles.categoryText}>
                • Informações dos membros da família{'\n'}
                • Medicamentos e dosagens{'\n'}
                • Horários de tratamento{'\n'}
                • Histórico médico{'\n'}
                • Alergias e condições especiais
              </Text>
              <Text style={styles.purposeText}>
                <Text style={styles.purposeLabel}>Por quê:</Text> Para fornecer lembretes precisos, gerar relatórios de saúde e facilitar o acompanhamento médico familiar.
              </Text>
            </View>

            <View style={styles.dataCategory}>
              <View style={styles.categoryHeader}>
                <Ionicons name="phone-portrait" size={24} color="#4ECDC4" />
                <Text style={styles.categoryTitle}>Dados do Dispositivo</Text>
              </View>
              <Text style={styles.categoryText}>
                • Modelo e sistema operacional{'\n'}
                • Versão do aplicativo{'\n'}
                • Configurações de notificação{'\n'}
                • Logs de erro (anônimos)
              </Text>
              <Text style={styles.purposeText}>
                <Text style={styles.purposeLabel}>Por quê:</Text> Para garantir compatibilidade, corrigir bugs e melhorar a performance do aplicativo.
              </Text>
            </View>

            <View style={styles.dataCategory}>
              <View style={styles.categoryHeader}>
                <Ionicons name="analytics" size={24} color="#FFD93D" />
                <Text style={styles.categoryTitle}>Dados de Uso</Text>
              </View>
              <Text style={styles.categoryText}>
                • Funcionalidades mais utilizadas{'\n'}
                • Tempo de uso do aplicativo{'\n'}
                • Padrões de navegação{'\n'}
                • Preferências de configuração
              </Text>
              <Text style={styles.purposeText}>
                <Text style={styles.purposeLabel}>Por quê:</Text> Para entender como você usa o app e desenvolver melhorias que realmente importam para você.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔒 Como Protegemos seus Dados</Text>
            
            <View style={styles.protectionItem}>
              <Ionicons name="lock-closed" size={20} color="#34C759" />
              <View style={styles.protectionContent}>
                <Text style={styles.protectionTitle}>Criptografia de Ponta a Ponta</Text>
                <Text style={styles.protectionText}>Todos os dados são criptografados antes de serem armazenados</Text>
              </View>
            </View>

            <View style={styles.protectionItem}>
              <Ionicons name="shield-checkmark" size={20} color="#34C759" />
              <View style={styles.protectionContent}>
                <Text style={styles.protectionTitle}>Servidores Seguros</Text>
                <Text style={styles.protectionText}>Hospedagem em infraestrutura certificada e monitorada 24/7</Text>
              </View>
            </View>

            <View style={styles.protectionItem}>
              <Ionicons name="key" size={20} color="#34C759" />
              <View style={styles.protectionContent}>
                <Text style={styles.protectionTitle}>Acesso Restrito</Text>
                <Text style={styles.protectionText}>Apenas você e familiares autorizados podem acessar seus dados</Text>
              </View>
            </View>

            <View style={styles.protectionItem}>
              <Ionicons name="refresh" size={20} color="#34C759" />
              <View style={styles.protectionContent}>
                <Text style={styles.protectionTitle}>Backups Seguros</Text>
                <Text style={styles.protectionText}>Backups automáticos criptografados para prevenir perda de dados</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Controle Total</Text>
            <Text style={styles.text}>
              Você tem controle total sobre seus dados:
            </Text>
            
            <View style={styles.controlItem}>
              <Ionicons name="eye" size={20} color="#b081ee" />
              <Text style={styles.controlText}>Ver todos os dados que temos sobre você</Text>
            </View>

            <View style={styles.controlItem}>
              <Ionicons name="create" size={20} color="#b081ee" />
              <Text style={styles.controlText}>Editar ou corrigir informações a qualquer momento</Text>
            </View>

            <View style={styles.controlItem}>
              <Ionicons name="download" size={20} color="#b081ee" />
              <Text style={styles.controlText}>Exportar seus dados em formato CSV ou JSON</Text>
            </View>

            <View style={styles.controlItem}>
              <Ionicons name="trash" size={20} color="#b081ee" />
              <Text style={styles.controlText}>Excluir sua conta e todos os dados permanentemente</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚫 O que NÃO Fazemos</Text>
            
            <View style={styles.dontItem}>
              <Ionicons name="close-circle" size={20} color="#FF6B6B" />
              <Text style={styles.dontText}>Não vendemos seus dados para terceiros</Text>
            </View>

            <View style={styles.dontItem}>
              <Ionicons name="close-circle" size={20} color="#FF6B6B" />
              <Text style={styles.dontText}>Não compartilhamos sem sua autorização</Text>
            </View>

            <View style={styles.dontItem}>
              <Ionicons name="close-circle" size={20} color="#FF6B6B" />
              <Text style={styles.dontText}>Não usamos para publicidade externa</Text>
            </View>

            <View style={styles.dontItem}>
              <Ionicons name="close-circle" size={20} color="#FF6B6B" />
              <Text style={styles.dontText}>Não acessamos sem necessidade técnica</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📞 Dúvidas sobre seus Dados?</Text>
            <Text style={styles.text}>
              Nossa equipe de privacidade está sempre disponível para esclarecer qualquer dúvida sobre como tratamos seus dados.
            </Text>
            <Text style={styles.contactText}>
              📧 privacidade@personalmedicare.com{'\n'}
              📱 (11) 9999-9999{'\n'}
              🕒 Segunda a Sexta, 9h às 18h
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerCard}>
              <Ionicons name="heart" size={32} color="#FF6B6B" />
              <Text style={styles.footerTitle}>Compromisso com Você</Text>
              <Text style={styles.footerText}>
                Seus dados de saúde são sagrados para nós. Trabalhamos todos os dias para merecer sua confiança e proteger o que é mais importante: sua privacidade e a de sua família.
              </Text>
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
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  introSection: {
    marginBottom: 32,
  },
  introCard: {
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
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  dataCategory: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  purposeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  purposeLabel: {
    fontWeight: 'bold',
    color: '#b081ee',
  },
  protectionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  protectionContent: {
    flex: 1,
    marginLeft: 12,
  },
  protectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  protectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  text: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 16,
  },
  controlItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  controlText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  dontItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  dontText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  contactText: {
    fontSize: 15,
    color: '#b081ee',
    lineHeight: 24,
    fontWeight: '500',
  },
  footer: {
    marginTop: 20,
    marginBottom: 20,
  },
  footerCard: {
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
  footerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});