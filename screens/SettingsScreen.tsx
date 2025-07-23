import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface SettingsScreenProps {
  navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Erro', 'Erro ao fazer logout');
            }
          }
        }
      ]
    );
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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="person-outline"
              title="Perfil"
              subtitle="Editar informações pessoais"
              onPress={() => navigation.navigate('Profile')}
            />
            <SettingItem
              icon="shield-checkmark-outline"
              title="Privacidade e Segurança"
              subtitle="Configurações de privacidade"
              onPress={() => handleNotImplemented('Privacidade e Segurança')}
            />
            <SettingItem
              icon="key-outline"
              title="Alterar Senha"
              subtitle="Atualizar sua senha"
              onPress={() => handleNotImplemented('Alterar Senha')}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="notifications-outline"
              title="Notificações Push"
              subtitle="Receber lembretes de medicamentos"
              onPress={() => {}}
              showArrow={false}
              rightComponent={<Switch value={true} onValueChange={() => handleNotImplemented('Notificações Push')} />}
            />
            <SettingItem
              icon="alarm-outline"
              title="Lembretes"
              subtitle="Configurar horários de lembrete"
              onPress={() => handleNotImplemented('Lembretes')}
            />
            <SettingItem
              icon="mail-outline"
              title="Notificações por Email"
              subtitle="Receber relatórios por email"
              onPress={() => {}}
              showArrow={false}
              rightComponent={<Switch value={false} onValueChange={() => handleNotImplemented('Email')} />}
            />
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="download-outline"
              title="Exportar Dados"
              subtitle="Baixar seus dados em PDF"
              onPress={() => handleNotImplemented('Exportar Dados')}
            />
            <SettingItem
              icon="cloud-upload-outline"
              title="Backup"
              subtitle="Fazer backup dos dados"
              onPress={() => handleNotImplemented('Backup')}
            />
            <SettingItem
              icon="sync-outline"
              title="Sincronização"
              subtitle="Sincronizar entre dispositivos"
              onPress={() => handleNotImplemented('Sincronização')}
            />
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aplicativo</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="color-palette-outline"
              title="Tema"
              subtitle="Claro, escuro ou automático"
              onPress={() => handleNotImplemented('Tema')}
            />
            <SettingItem
              icon="language-outline"
              title="Idioma"
              subtitle="Português (Brasil)"
              onPress={() => handleNotImplemented('Idioma')}
            />
            <SettingItem
              icon="information-circle-outline"
              title="Sobre"
              subtitle="Versão 1.0.0"
              onPress={() => handleNotImplemented('Sobre')}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="help-circle-outline"
              title="Central de Ajuda"
              subtitle="FAQ e tutoriais"
              onPress={() => handleNotImplemented('Central de Ajuda')}
            />
            <SettingItem
              icon="chatbubble-outline"
              title="Contato"
              subtitle="Fale conosco"
              onPress={() => handleNotImplemented('Contato')}
            />
            <SettingItem
              icon="star-outline"
              title="Avaliar App"
              subtitle="Deixe sua avaliação"
              onPress={() => handleNotImplemented('Avaliar App')}
            />
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={24} color="#ff6b6b" />
              <Text style={styles.logoutText}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Personal Medi Care</Text>
          <Text style={styles.footerVersion}>Versão 1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b6b',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b081ee',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: '#999',
  },
});