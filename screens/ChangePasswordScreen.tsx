import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

interface ChangePasswordScreenProps {
  navigation: any;
}

export default function ChangePasswordScreen({ navigation }: ChangePasswordScreenProps) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Callbacks otimizados para evitar re-renderizações
  const handleCurrentPasswordChange = useCallback((text: string) => {
    setCurrentPassword(text);
  }, []);

  const handleNewPasswordChange = useCallback((text: string) => {
    setNewPassword(text);
  }, []);

  const handleConfirmPasswordChange = useCallback((text: string) => {
    setConfirmPassword(text);
  }, []);

  const toggleCurrentPasswordVisibility = useCallback(() => {
    setShowCurrentPassword(prev => !prev);
  }, []);

  const toggleNewPasswordVisibility = useCallback(() => {
    setShowNewPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'A senha deve conter pelo menos uma letra minúscula';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'A senha deve conter pelo menos uma letra maiúscula';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'A senha deve conter pelo menos um número';
    }
    return null;
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Erro', 'Digite sua senha atual');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Erro', 'Digite a nova senha');
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert('Erro', 'Confirme a nova senha');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Erro', 'A nova senha deve ser diferente da senha atual');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      Alert.alert('Senha inválida', passwordError);
      return;
    }

    if (!user || !user.email) {
      Alert.alert('Erro', 'Usuário não encontrado');
      return;
    }

    setLoading(true);
    try {
      // Reautenticar o usuário com a senha atual
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Atualizar a senha
      await updatePassword(user, newPassword);

      Alert.alert(
        'Sucesso',
        'Senha alterada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      
      let errorMessage = 'Erro ao alterar senha. Tente novamente.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha atual incorreta';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A nova senha é muito fraca';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por segurança, faça login novamente antes de alterar a senha';
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };



  // Verificar se o usuário usa login social
  const isEmailUser = user?.providerData.some(provider => provider.providerId === 'password');

  if (!isEmailUser) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alterar Senha</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.socialLoginMessage}>
          <Ionicons name="information-circle" size={48} color="#b081ee" />
          <Text style={styles.socialLoginTitle}>Login Social Detectado</Text>
          <Text style={styles.socialLoginText}>
            Você fez login usando {user?.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Apple'}. 
            Para alterar sua senha, acesse as configurações da sua conta {user?.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Apple'}.
          </Text>
          <TouchableOpacity
            style={styles.backToSettingsButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToSettingsText}>Voltar às Configurações</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alterar Senha</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={24} color="#b081ee" />
            <Text style={styles.infoTitle}>Segurança da Conta</Text>
            <Text style={styles.infoText}>
              Para sua segurança, você precisará confirmar sua senha atual antes de definir uma nova senha.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            {/* Senha Atual */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha Atual</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={currentPassword}
                  onChangeText={handleCurrentPasswordChange}
                  placeholder="Digite sua senha atual"
                  placeholderTextColor="#999"
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={toggleCurrentPasswordVisibility}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Nova Senha */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nova Senha</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={handleNewPasswordChange}
                  placeholder="Digite a nova senha"
                  placeholderTextColor="#999"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  textContentType="newPassword"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={toggleNewPasswordVisibility}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar Nova Senha */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Nova Senha</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  placeholder="Confirme a nova senha"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  textContentType="newPassword"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={toggleConfirmPasswordVisibility}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsCard}>
              <Text style={styles.requirementsTitle}>Requisitos da Senha:</Text>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={newPassword.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={16} 
                  color={newPassword.length >= 6 ? '#34C759' : '#999'} 
                />
                <Text style={[styles.requirementText, newPassword.length >= 6 && styles.requirementMet]}>
                  Pelo menos 6 caracteres
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/(?=.*[a-z])/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={16} 
                  color={/(?=.*[a-z])/.test(newPassword) ? '#34C759' : '#999'} 
                />
                <Text style={[styles.requirementText, /(?=.*[a-z])/.test(newPassword) && styles.requirementMet]}>
                  Uma letra minúscula
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/(?=.*[A-Z])/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={16} 
                  color={/(?=.*[A-Z])/.test(newPassword) ? '#34C759' : '#999'} 
                />
                <Text style={[styles.requirementText, /(?=.*[A-Z])/.test(newPassword) && styles.requirementMet]}>
                  Uma letra maiúscula
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/(?=.*\d)/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={16} 
                  color={/(?=.*\d)/.test(newPassword) ? '#34C759' : '#999'} 
                />
                <Text style={[styles.requirementText, /(?=.*\d)/.test(newPassword) && styles.requirementMet]}>
                  Um número
                </Text>
              </View>
            </View>

            {/* Change Password Button */}
            <TouchableOpacity
              style={[styles.changeButton, loading && styles.changeButtonDisabled]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="key" size={20} color="#fff" />
                  <Text style={styles.changeButtonText}>Alterar Senha</Text>
                </>
              )}
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
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 12,
  },
  requirementsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  requirementMet: {
    color: '#34C759',
    fontWeight: '500',
  },
  changeButton: {
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  changeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialLoginMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  socialLoginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  socialLoginText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  backToSettingsButton: {
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backToSettingsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});