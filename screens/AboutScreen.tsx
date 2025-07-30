import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AboutScreenProps {
  navigation: any;
}

interface AppInfo {
  name: string;
  version: string;
  buildNumber: string;
  description: string;
  developer: string;
  email: string;
  website: string;
  releaseDate: string;
}

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

const APP_INFO: AppInfo = {
  name: 'Personal Medicare',
  version: '1.0.0',
  buildNumber: '2025.07.25',
  description: 'Aplicativo para gerenciamento de cuidados médicos familiares, tratamentos e lembretes de medicamentos.',
  developer: 'Personal Medicare Team',
  email: 'suporte@personalmedicare.flowinx.com',
  website: 'https://personalmedicare.com',
  releaseDate: '25 de Julho de 2025'
};

const MAIN_FEATURES: FeatureItem[] = [
  {
    icon: 'people',
    title: 'Gestão Familiar',
    description: 'Gerencie dados médicos de toda a família em um só lugar'
  },
  {
    icon: 'medical',
    title: 'Controle de Tratamentos',
    description: 'Acompanhe medicamentos, dosagens e horários'
  },
  {
    icon: 'notifications',
    title: 'Lembretes Inteligentes',
    description: 'Notificações personalizadas para não esquecer medicamentos'
  },
  {
    icon: 'analytics',
    title: 'Relatórios Detalhados',
    description: 'Visualize estatísticas e histórico de tratamentos'
  },
  {
    icon: 'shield-checkmark',
    title: 'Segurança Total',
    description: 'Dados criptografados e armazenados com segurança'
  },
  {
    icon: 'cloud-upload',
    title: 'Backup e Sincronização',
    description: 'Seus dados seguros na nuvem e sincronizados'
  }
];

const TECH_STACK = [
  'React Native',
  'TypeScript',
  'Firebase',
  'Expo',
  'AsyncStorage',
  'React Navigation'
];

export default function AboutScreen({ navigation }: AboutScreenProps) {
  const [showTechDetails, setShowTechDetails] = useState(false);

  const handleEmailContact = async () => {
    const subject = encodeURIComponent(`Contato - ${APP_INFO.name} v${APP_INFO.version}`);
    const body = encodeURIComponent(`Olá,\n\nEstou entrando em contato sobre o aplicativo ${APP_INFO.name}.\n\n`);
    const emailUrl = `mailto:${APP_INFO.email}?subject=${subject}&body=${body}`;
    
    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert(
          'Email não disponível',
          `Copie nosso email: ${APP_INFO.email}`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Copiar', 
              onPress: () => {
                // Em produção, usar Clipboard API
                Alert.alert('Email copiado', APP_INFO.email);
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o cliente de email');
    }
  };

  const handleWebsiteOpen = async () => {
    try {
      const canOpen = await Linking.canOpenURL(APP_INFO.website);
      if (canOpen) {
        await Linking.openURL(APP_INFO.website);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o navegador');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o link');
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        title: APP_INFO.name,
        message: `Conheça o ${APP_INFO.name}!\n\n${APP_INFO.description}\n\nBaixe agora: ${APP_INFO.website}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleRateApp = () => {
    Alert.alert(
      'Avaliar Aplicativo',
      'Obrigado por usar o Personal Medicare! Sua avaliação nos ajuda a melhorar.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Avaliar', onPress: () => {
          // Em produção, abriria a loja de apps
          Alert.alert('Obrigado!', 'Em breve você será redirecionado para a loja de apps.');
        }}
      ]
    );
  };

  const handleLicenses = () => {
    Alert.alert(
      'Licenças de Software',
      'Este aplicativo utiliza bibliotecas de código aberto. Consulte a documentação completa em nosso site.',
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
        <Text style={styles.headerTitle}>Sobre</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShareApp}>
          <Ionicons name="share" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* App Logo and Info */}
          <View style={styles.appInfoCard}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={styles.appLogo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>{APP_INFO.name}</Text>
            <Text style={styles.appVersion}>Versão {APP_INFO.version}</Text>
            <Text style={styles.appDescription}>{APP_INFO.description}</Text>
          </View>

          {/* Main Features */}
          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>✨ Principais Funcionalidades</Text>
            {MAIN_FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon as any} size={20} color="#b081ee" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* App Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>📋 Informações Técnicas</Text>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Versão:</Text>
              <Text style={styles.detailValue}>{APP_INFO.version}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Build:</Text>
              <Text style={styles.detailValue}>{APP_INFO.buildNumber}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Lançamento:</Text>
              <Text style={styles.detailValue}>{APP_INFO.releaseDate}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Desenvolvedor:</Text>
              <Text style={styles.detailValue}>{APP_INFO.developer}</Text>
            </View>

            <TouchableOpacity 
              style={styles.techToggle}
              onPress={() => setShowTechDetails(!showTechDetails)}
            >
              <Text style={styles.techToggleText}>
                {showTechDetails ? 'Ocultar' : 'Mostrar'} Detalhes Técnicos
              </Text>
              <Ionicons 
                name={showTechDetails ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color="#b081ee" 
              />
            </TouchableOpacity>

            {showTechDetails && (
              <View style={styles.techDetails}>
                <Text style={styles.techTitle}>Tecnologias Utilizadas:</Text>
                <View style={styles.techStack}>
                  {TECH_STACK.map((tech, index) => (
                    <View key={index} style={styles.techItem}>
                      <Text style={styles.techText}>{tech}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Contact and Support */}
          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>📞 Contato e Suporte</Text>
            
            <TouchableOpacity style={styles.contactItem} onPress={handleEmailContact}>
              <View style={styles.contactIcon}>
                <Ionicons name="mail" size={20} color="#b081ee" />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{APP_INFO.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={handleWebsiteOpen}>
              <View style={styles.contactIcon}>
                <Ionicons name="globe" size={20} color="#b081ee" />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Website</Text>
                <Text style={styles.contactValue}>{APP_INFO.website}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View style={styles.actionsCard}>
            <Text style={styles.actionsTitle}>⚡ Ações</Text>
            
            <TouchableOpacity style={styles.actionItem} onPress={handleRateApp}>
              <View style={styles.actionIcon}>
                <Ionicons name="star" size={20} color="#FF9500" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Avaliar Aplicativo</Text>
                <Text style={styles.actionSubtitle}>Deixe sua avaliação na loja</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleShareApp}>
              <View style={styles.actionIcon}>
                <Ionicons name="share" size={20} color="#34C759" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Compartilhar App</Text>
                <Text style={styles.actionSubtitle}>Indique para amigos e família</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleLicenses}>
              <View style={styles.actionIcon}>
                <Ionicons name="document-text" size={20} color="#666" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Licenças</Text>
                <Text style={styles.actionSubtitle}>Software de terceiros</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Legal */}
          <View style={styles.legalCard}>
            <Text style={styles.legalTitle}>⚖️ Legal</Text>
            <Text style={styles.legalText}>
              © 2025 {APP_INFO.developer}. Todos os direitos reservados.
            </Text>
            <Text style={styles.legalText}>
              Este aplicativo é fornecido "como está" sem garantias de qualquer tipo. 
              Consulte sempre um profissional de saúde qualificado.
            </Text>
          </View>

          {/* Credits */}
          <View style={styles.creditsCard}>
            <Text style={styles.creditsTitle}>🙏 Agradecimentos</Text>
            <Text style={styles.creditsText}>
              Agradecemos a todos os profissionais de saúde que inspiraram este projeto 
              e às famílias que confiam em nossa solução para cuidar de quem mais amam.
            </Text>
            <Text style={styles.creditsText}>
              Ícones por Ionicons • Fontes por Google Fonts • Hospedagem por Firebase
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Feito com ❤️ para cuidar de quem você ama
            </Text>
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
  shareButton: {
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
  appInfoCard: {
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
  appLogo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    color: '#b081ee',
    fontWeight: '600',
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresCard: {
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
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0eaff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  detailsCard: {
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
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  techToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    gap: 8,
  },
  techToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b081ee',
  },
  techDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  techTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techItem: {
    backgroundColor: '#f0eaff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  techText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b081ee',
  },
  contactCard: {
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
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0eaff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 13,
    color: '#666',
  },
  actionsCard: {
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
  actionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  legalCard: {
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
  legalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  legalText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  creditsCard: {
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
  creditsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  creditsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#b081ee',
    fontWeight: '600',
    textAlign: 'center',
  },
});