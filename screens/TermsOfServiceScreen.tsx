import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TermsOfServiceScreenProps {
  navigation: any;
}

export default function TermsOfServiceScreen({ navigation }: TermsOfServiceScreenProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termos de Uso</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.lastUpdated}>Última atualização: Janeiro de 2025</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Aceitação dos Termos</Text>
            <Text style={styles.text}>
              Ao usar o Personal MediCare, você concorda com estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve usar nosso aplicativo.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Descrição do Serviço</Text>
            <Text style={styles.text}>
              O Personal MediCare é um aplicativo de gerenciamento de saúde familiar que permite:
            </Text>
            <Text style={styles.text}>
              • Cadastrar e gerenciar informações de membros da família{'\n'}
              • Acompanhar medicamentos e tratamentos{'\n'}
              • Configurar lembretes de medicação{'\n'}
              • Gerar relatórios de saúde{'\n'}
              • Compartilhar dados com familiares autorizados{'\n'}
              • Exportar dados pessoais
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Elegibilidade</Text>
            <Text style={styles.text}>
              Para usar o Personal MediCare, você deve:
            </Text>
            <Text style={styles.text}>
              • Ter pelo menos 18 anos de idade{'\n'}
              • Fornecer informações precisas e atualizadas{'\n'}
              • Manter a confidencialidade de sua conta{'\n'}
              • Usar o serviço apenas para fins legais
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Responsabilidades do Usuário</Text>
            <Text style={styles.subsectionTitle}>4.1 Uso Adequado</Text>
            <Text style={styles.text}>
              Você se compromete a:
            </Text>
            <Text style={styles.text}>
              • Usar o aplicativo de forma responsável{'\n'}
              • Não compartilhar credenciais de acesso{'\n'}
              • Manter informações atualizadas{'\n'}
              • Respeitar a privacidade de outros usuários{'\n'}
              • Não usar o serviço para fins ilegais
            </Text>

            <Text style={styles.subsectionTitle}>4.2 Informações Médicas</Text>
            <Text style={styles.text}>
              • O aplicativo não substitui consultas médicas{'\n'}
              • Sempre consulte profissionais de saúde{'\n'}
              • Você é responsável pela precisão dos dados inseridos{'\n'}
              • Não use o aplicativo para emergências médicas
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Propriedade Intelectual</Text>
            <Text style={styles.text}>
              O Personal MediCare e todo seu conteúdo são protegidos por direitos autorais e outras leis de propriedade intelectual. Você não pode:
            </Text>
            <Text style={styles.text}>
              • Copiar, modificar ou distribuir o aplicativo{'\n'}
              • Fazer engenharia reversa do código{'\n'}
              • Usar nossa marca sem autorização{'\n'}
              • Criar trabalhos derivados
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Privacidade e Dados</Text>
            <Text style={styles.text}>
              Sua privacidade é importante para nós. O uso de seus dados é regido por nossa Política de Privacidade, que faz parte integrante destes termos.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Limitação de Responsabilidade</Text>
            <Text style={styles.text}>
              O Personal MediCare é fornecido "como está". Não garantimos:
            </Text>
            <Text style={styles.text}>
              • Funcionamento ininterrupto do serviço{'\n'}
              • Ausência de erros ou bugs{'\n'}
              • Compatibilidade com todos os dispositivos{'\n'}
              • Resultados específicos de saúde
            </Text>
            <Text style={styles.text}>
              Não somos responsáveis por danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso do aplicativo.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Suspensão e Encerramento</Text>
            <Text style={styles.text}>
              Podemos suspender ou encerrar sua conta se:
            </Text>
            <Text style={styles.text}>
              • Você violar estes termos{'\n'}
              • Usar o serviço de forma inadequada{'\n'}
              • Fornecer informações falsas{'\n'}
              • Por razões de segurança
            </Text>
            <Text style={styles.text}>
              Você pode encerrar sua conta a qualquer momento através das configurações do aplicativo.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Modificações dos Termos</Text>
            <Text style={styles.text}>
              Podemos modificar estes termos a qualquer momento. Mudanças significativas serão comunicadas através do aplicativo ou por email. O uso continuado após as modificações constitui aceitação dos novos termos.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Lei Aplicável</Text>
            <Text style={styles.text}>
              Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida nos tribunais competentes do Brasil.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Contato</Text>
            <Text style={styles.text}>
              Para dúvidas sobre estes Termos de Uso:
            </Text>
            <Text style={styles.text}>
              • Email: legal@personalmedicare.com{'\n'}
              • Telefone: (11) 9999-9999{'\n'}
              • Endereço: São Paulo, SP, Brasil
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerCard}>
              <Ionicons name="document-text" size={32} color="#b081ee" />
              <Text style={styles.footerTitle}>Termos Claros e Transparentes</Text>
              <Text style={styles.footerText}>
                Nossos termos são escritos de forma clara para que você entenda exatamente seus direitos e responsabilidades ao usar o Personal MediCare.
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