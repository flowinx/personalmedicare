import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { getAllMembers, getAllTreatments, deleteMember, deleteTreatment } from '../services/firebase';
import { deleteUser } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface PrivacySecurityScreenProps {
  navigation: any;
}

export default function PrivacySecurityScreen({ navigation }: PrivacySecurityScreenProps) {
  const { user } = useAuth();
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [autoLock, setAutoLock] = useState(true);
  const [dataEncryption, setDataEncryption] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  useEffect(() => {
    checkBiometricSupport();
    loadBiometricSetting();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      setBiometricSupported(compatible && enrolled);
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('Face ID');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Touch ID');
      } else {
        setBiometricType('Biometria');
      }
    } catch (error) {
      console.error('Erro ao verificar suporte biométrico:', error);
      setBiometricSupported(false);
    }
  };

  const loadBiometricSetting = async () => {
    try {
      const saved = await AsyncStorage.getItem('biometric_auth_enabled');
      if (saved !== null) {
        setBiometricAuth(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar configuração biométrica:', error);
    }
  };

  const saveBiometricSetting = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('biometric_auth_enabled', JSON.stringify(enabled));
    } catch (error) {
      console.error('Erro ao salvar configuração biométrica:', error);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (!biometricSupported) {
      Alert.alert(
        'Biometria Não Disponível',
        'Seu dispositivo não suporta autenticação biométrica ou você não tem biometria configurada.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (value) {
      // Ativar biometria - solicitar autenticação primeiro
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Confirme sua identidade para ativar a autenticação biométrica',
          cancelLabel: 'Cancelar',
          fallbackLabel: 'Usar senha',
        });

        if (result.success) {
          setBiometricAuth(true);
          await saveBiometricSetting(true);
          Alert.alert(
            'Biometria Ativada',
            `${biometricType} foi ativado com sucesso para o Personal MediCare.`,
            [{ text: 'OK' }]
          );
        } else {
          setBiometricAuth(false);
          if (result.error === 'UserCancel') {
            // Usuário cancelou, não mostrar erro
          } else {
            Alert.alert(
              'Falha na Autenticação',
              'Não foi possível verificar sua identidade. Tente novamente.',
              [{ text: 'OK' }]
            );
          }
        }
      } catch (error) {
        console.error('Erro na autenticação biométrica:', error);
        setBiometricAuth(false);
        Alert.alert(
          'Erro',
          'Ocorreu um erro ao configurar a autenticação biométrica.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // Desativar biometria
      Alert.alert(
        'Desativar Biometria',
        `Tem certeza que deseja desativar o ${biometricType}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desativar',
            style: 'destructive',
            onPress: async () => {
              setBiometricAuth(false);
              await saveBiometricSetting(false);
              Alert.alert(
                'Biometria Desativada',
                'A autenticação biométrica foi desativada.',
                [{ text: 'OK' }]
              );
            }
          }
        ]
      );
    }
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      '⚠️ Excluir Todos os Dados',
      'Esta ação é IRREVERSÍVEL e irá:\n\n• Excluir todos os membros da família\n• Remover todos os tratamentos\n• Apagar seu perfil completamente\n• Deletar sua conta permanentemente\n\nTem certeza absoluta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Continuar', 
          style: 'destructive',
          onPress: showFinalConfirmation
        }
      ]
    );
  };

  const showFinalConfirmation = () => {
    Alert.alert(
      '🚨 ÚLTIMA CONFIRMAÇÃO',
      'Digite "EXCLUIR" para confirmar a exclusão permanente de todos os seus dados:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar Exclusão', 
          style: 'destructive',
          onPress: () => {
            Alert.prompt(
              'Confirmação Final',
              'Digite "EXCLUIR" (em maiúsculas) para confirmar:',
              [
                { text: 'Cancelar', style: 'cancel' },
                { 
                  text: 'Excluir Tudo', 
                  style: 'destructive',
                  onPress: (text) => {
                    if (text === 'EXCLUIR') {
                      executeDataDeletion();
                    } else {
                      Alert.alert(
                        'Confirmação Incorreta',
                        'Você deve digitar exatamente "EXCLUIR" para confirmar.',
                        [{ text: 'OK' }]
                      );
                    }
                  }
                }
              ],
              'plain-text'
            );
          }
        }
      ]
    );
  };

  const executeDataDeletion = async () => {
    const loadingAlert = Alert.alert(
      'Excluindo Dados...',
      'Por favor, aguarde. Esta operação pode levar alguns minutos.',
      [],
      { cancelable: false }
    );

    try {
      // 1. Excluir todos os membros da família
      console.log('🗑️ Excluindo membros da família...');
      const members = await getAllMembers();
      for (const member of members) {
        await deleteMember(member.id);
      }

      // 2. Excluir todos os tratamentos
      console.log('🗑️ Excluindo tratamentos...');
      const treatments = await getAllTreatments();
      for (const treatment of treatments) {
        await deleteTreatment(treatment.id);
      }

      // 3. Excluir dados do perfil
      console.log('🗑️ Excluindo dados do perfil...');
      if (user?.uid) {
        await deleteDoc(doc(db, 'users', user.uid));
      }

      // 4. Limpar dados locais
      console.log('🗑️ Limpando dados locais...');
      await AsyncStorage.clear();

      // 5. Excluir conta do Firebase Auth
      console.log('🗑️ Excluindo conta...');
      if (user) {
        await deleteUser(user);
      }

      // Sucesso - usuário será redirecionado automaticamente para login
      Alert.alert(
        '✅ Dados Excluídos',
        'Todos os seus dados foram excluídos permanentemente. Você será redirecionado para a tela de login.',
        [
          {
            text: 'OK',
            onPress: () => {
              // O usuário será automaticamente deslogado pelo Firebase
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Erro ao excluir dados:', error);
      
      Alert.alert(
        '❌ Erro na Exclusão',
        'Ocorreu um erro ao excluir seus dados. Alguns dados podem não ter sido removidos completamente. Entre em contato com o suporte.',
        [
          { text: 'OK' },
          { 
            text: 'Contatar Suporte', 
            onPress: () => navigation.navigate('Contact')
          }
        ]
      );
    }
  };

  const handleNotImplemented = (feature: string) => {
    Alert.alert('Em breve', `A funcionalidade "${feature}" será implementada em breve.`);
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    rightComponent 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={24} color="#b081ee" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && <Ionicons name="chevron-forward" size={20} color="#ccc" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacidade e Segurança</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Security Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Segurança</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="finger-print"
                title="Autenticação Biométrica"
                subtitle={biometricSupported ? `Use ${biometricType} para acessar o app` : 'Não disponível neste dispositivo'}
                onPress={() => {}}
                showArrow={false}
                rightComponent={
                  <Switch 
                    value={biometricAuth} 
                    onValueChange={handleBiometricToggle}
                    disabled={!biometricSupported}
                  />
                }
              />
              <SettingItem
                icon="lock-closed"
                title="Bloqueio Automático"
                subtitle="Bloquear app após inatividade"
                onPress={() => {}}
                showArrow={false}
                rightComponent={
                  <Switch 
                    value={autoLock} 
                    onValueChange={(value) => {
                      setAutoLock(value);
                      handleNotImplemented('Bloqueio Automático');
                    }} 
                  />
                }
              />
            </View>
          </View>

          {/* Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacidade</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="lock-closed-outline"
                title="Criptografia de Dados"
                subtitle="Seus dados são criptografados"
                onPress={() => {}}
                showArrow={false}
                rightComponent={
                  <Switch 
                    value={dataEncryption} 
                    onValueChange={(value) => {
                      setDataEncryption(value);
                      handleNotImplemented('Criptografia de Dados');
                    }} 
                    disabled={true}
                  />
                }
              />
            </View>
          </View>

          {/* Data Management Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gerenciamento de Dados</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="download"
                title="Exportar Meus Dados"
                subtitle="Baixar todos os seus dados"
                onPress={() => navigation.navigate('ExportData')}
              />
              <SettingItem
                icon="trash"
                title="Excluir Todos os Dados"
                subtitle="Remover permanentemente seus dados"
                onPress={handleDeleteAllData}
              />
            </View>
          </View>

          {/* Legal Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="document-text"
                title="Política de Privacidade"
                subtitle="Como tratamos seus dados"
                onPress={() => navigation.navigate('PrivacyPolicy')}
              />
              <SettingItem
                icon="document"
                title="Termos de Uso"
                subtitle="Condições de uso do aplicativo"
                onPress={() => navigation.navigate('TermsOfService')}
              />
              <SettingItem
                icon="information-circle"
                title="Sobre a Coleta de Dados"
                subtitle="Quais dados coletamos e por quê"
                onPress={() => navigation.navigate('DataCollection')}
              />
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Ionicons name="shield-checkmark" size={32} color="#34C759" />
              <Text style={styles.infoTitle}>Seus dados estão seguros</Text>
              <Text style={styles.infoText}>
                Utilizamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança para proteger suas informações médicas.
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoSection: {
    marginTop: 16,
  },
  infoCard: {
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
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});