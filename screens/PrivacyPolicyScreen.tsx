import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PrivacyPolicyScreenProps {
  navigation: any;
}

export default function PrivacyPolicyScreen({ navigation }: PrivacyPolicyScreenProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Política de Privacidade</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.lastUpdated}>Última atualização: Janeiro de 2025</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Introdução</Text>
            <Text style={styles.text}>
              O Personal MediCare está comprometido em proteger sua privacidade e dados pessoais. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações quando você usa nosso aplicativo.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Informações que Coletamos</Text>
            <Text style={styles.subsectionTitle}>2.1 Informações Pessoais</Text>
            <Text style={styles.text}>
              • Nome completo e informações de contato{'\n'}
              • Dados de saúde dos membros da família{'\n'}
              • Informações sobre medicamentos e tratamentos{'\n'}
              • Dados de autenticação (email e senha criptografada)
            </Text>
            
            <Text style={styles.subsectionTitle}>2.2 Informações de Uso</Text>
            <Text style={styles.text}>
              • Dados de navegação no aplicativo{'\n'}
              • Logs de atividade e interações{'\n'}
              • Informações do dispositivo (modelo, sistema operacional){'\n'}
              • Dados de localização (apenas se autorizado)
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Como Usamos suas Informações</Text>
            <Text style={styles.text}>
              • Fornecer e melhorar nossos serviços{'\n'}
              • Enviar lembretes de medicamentos{'\n'}
              • Gerar relatórios de saúde personalizados{'\n'}
              • Facilitar o compartilhamento familiar de dados{'\n'}
              • Garantir a segurança e integridade do aplicativo{'\n'}
              • Cumprir obrigações legais
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Compartilhamento de Dados</Text>
            <Text style={styles.text}>
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
            </Text>
            <Text style={styles.text}>
              • Com membros da família autorizados{'\n'}
              • Para cumprir obrigações legais{'\n'}
              • Para proteger nossos direitos e segurança{'\n'}
              • Com provedores de serviços confiáveis (sob acordos de confidencialidade)
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Segurança dos Dados</Text>
            <Text style={styles.text}>
              Implementamos medidas de segurança robustas:
            </Text>
            <Text style={styles.text}>
              • Criptografia de ponta a ponta{'\n'}
              • Autenticação segura{'\n'}
              • Armazenamento em servidores seguros{'\n'}
              • Monitoramento contínuo de segurança{'\n'}
              • Backups regulares e seguros
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Seus Direitos</Text>
            <Text style={styles.text}>
              Você tem o direito de:
            </Text>
            <Text style={styles.text}>
              • Acessar seus dados pessoais{'\n'}
              • Corrigir informações incorretas{'\n'}
              • Excluir seus dados{'\n'}
              • Exportar seus dados{'\n'}
              • Revogar consentimentos{'\n'}
              • Solicitar portabilidade de dados
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Retenção de Dados</Text>
            <Text style={styles.text}>
              Mantemos seus dados apenas pelo tempo necessário para fornecer nossos serviços ou conforme exigido por lei. Você pode solicitar a exclusão de seus dados a qualquer momento.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Cookies e Tecnologias Similares</Text>
            <Text style={styles.text}>
              Utilizamos tecnologias de armazenamento local para melhorar sua experiência, incluindo preferências de usuário e dados de sessão.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Alterações nesta Política</Text>
            <Text style={styles.text}>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças significativas através do aplicativo ou por email.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Contato</Text>
            <Text style={styles.text}>
              Para dúvidas sobre esta Política de Privacidade, entre em contato:
            </Text>
            <Text style={styles.text}>
              • Email: privacidade@personalmedicare.com{'\n'}
              • Telefone: (11) 9999-9999{'\n'}
              • Endereço: São Paulo, SP, Brasil
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerCard}>
              <Ionicons name="shield-checkmark" size={32} color="#34C759" />
              <Text style={styles.footerTitle}>Compromisso com sua Privacidade</Text>
              <Text style={styles.footerText}>
                Sua privacidade é nossa prioridade. Estamos comprometidos em proteger suas informações de saúde com os mais altos padrões de segurança.
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
  section: {
    marginBottom: 24,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  text: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 8,
  },
  footer: {
    marginTop: 32,
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