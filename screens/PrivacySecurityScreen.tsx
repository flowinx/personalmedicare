import React, { useState } from 'react';
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

interface PrivacySecurityScreenProps {
  navigation: any;
}

export default function PrivacySecurityScreen({ navigation }: PrivacySecurityScreenProps) {
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [autoLock, setAutoLock] = useState(true);
  const [dataEncryption, setDataEncryption] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);
  const [locationAccess, setLocationAccess] = useState(false);

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
                subtitle="Use impressão digital ou Face ID"
                onPress={() => {}}
                showArrow={false}
                rightComponent={
                  <Switch 
                    value={biometricAuth} 
                    onValueChange={(value) => {
                      setBiometricAuth(value);
                      handleNotImplemented('Autenticação Biométrica');
                    }} 
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
              <SettingItem
                icon="key"
                title="Alterar Senha"
                subtitle="Atualizar sua senha de acesso"
                onPress={() => handleNotImplemented('Alterar Senha')}
              />
              <SettingItem
                icon="shield-checkmark"
                title="Verificação em Duas Etapas"
                subtitle="Adicionar camada extra de segurança"
                onPress={() => handleNotImplemented('Verificação em Duas Etapas')}
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
              <SettingItem
                icon="analytics"
                title="Compartilhar Dados de Uso"
                subtitle="Ajudar a melhorar o aplicativo"
                onPress={() => {}}
                showArrow={false}
                rightComponent={
                  <Switch 
                    value={shareAnalytics} 
                    onValueChange={(value) => {
                      setShareAnalytics(value);
                      handleNotImplemented('Compartilhar Dados de Uso');
                    }} 
                  />
                }
              />
              <SettingItem
                icon="location"
                title="Acesso à Localização"
                subtitle="Para lembretes baseados em local"
                onPress={() => {}}
                showArrow={false}
                rightComponent={
                  <Switch 
                    value={locationAccess} 
                    onValueChange={(value) => {
                      setLocationAccess(value);
                      handleNotImplemented('Acesso à Localização');
                    }} 
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
                onPress={() => handleNotImplemented('Exportar Dados')}
              />
              <SettingItem
                icon="trash"
                title="Excluir Todos os Dados"
                subtitle="Remover permanentemente seus dados"
                onPress={() => {
                  Alert.alert(
                    'Excluir Dados',
                    'Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { 
                        text: 'Excluir', 
                        style: 'destructive',
                        onPress: () => handleNotImplemented('Excluir Dados')
                      }
                    ]
                  );
                }}
              />
              <SettingItem
                icon="time"
                title="Histórico de Atividades"
                subtitle="Ver suas atividades recentes"
                onPress={() => handleNotImplemented('Histórico de Atividades')}
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
                onPress={() => handleNotImplemented('Política de Privacidade')}
              />
              <SettingItem
                icon="document"
                title="Termos de Uso"
                subtitle="Condições de uso do aplicativo"
                onPress={() => handleNotImplemented('Termos de Uso')}
              />
              <SettingItem
                icon="information-circle"
                title="Sobre a Coleta de Dados"
                subtitle="Quais dados coletamos e por quê"
                onPress={() => handleNotImplemented('Sobre a Coleta de Dados')}
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