import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Image, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signInWithApple, signInWithEmail, signInWithGoogle } from '../services/firebase';
import { useEntranceAnimation } from '../utils/animations';

const { width: screenWidth } = Dimensions.get('window');

interface LoginScreenProps {
  navigation?: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { fadeAnim, slideAnim, scaleAnim, startAnimation } = useEntranceAnimation();

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  // Validação em tempo real
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('');
    } else if (!emailRegex.test(email)) {
      setEmailError('Email inválido');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('');
    } else if (password.length < 6) {
      setPasswordError('Senha deve ter pelo menos 6 caracteres');
    } else {
      setPasswordError('');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    validateEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePassword(text);
  };

  const isFormValid = () => {
    return email && password && !emailError && !passwordError;
  };

  const handleLogin = async () => {
    if (!isFormValid()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos corretamente.');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('[Login] Tentando fazer login com:', email);
      await signInWithEmail(email, password);
      console.log('[Login] Login realizado com sucesso');
      // A navegação será feita automaticamente pelo AuthContext
    } catch (error: any) {
      console.error('[Login] Erro no login:', error);
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      console.log('[Login] Tentando login com Google');
      await signInWithGoogle();
      console.log('[Login] Login com Google realizado com sucesso');
      // A navegação será feita automaticamente pelo AuthContext
    } catch (error: any) {
      console.error('[Login] Erro no login com Google:', error);
      Alert.alert('Erro', 'Erro ao fazer login com Google. Tente novamente.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsAppleLoading(true);
    try {
      console.log('[Login] Tentando login com Apple');
      await signInWithApple();
      console.log('[Login] Login com Apple realizado com sucesso');
      // A navegação será feita automaticamente pelo AuthContext
    } catch (error: any) {
      console.error('[Login] Erro no login com Apple:', error);
      Alert.alert('Erro', 'Erro ao fazer login com Apple. Tente novamente.');
    } finally {
      setIsAppleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implementar tela de recuperação de senha
    Alert.alert('Em breve', 'Funcionalidade de recuperação de senha será implementada em breve.');
  };

  const handleSignUp = () => {
    // TODO: Implementar tela de cadastro
    Alert.alert('Em breve', 'Funcionalidade de cadastro será implementada em breve.');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header Roxo */}
      <View style={styles.header}>
        <View style={styles.headerBottom}>
        </View>
        
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo do Personal Medi Care"
          />
          <Animated.Text
            style={[
              styles.appName,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            PERSONAL MEDICARE
          </Animated.Text>
        </Animated.View>
      </View>

      {/* Conteúdo Principal */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Animated.View
            style={[
              styles.cardContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.topSection}>
              <Text style={styles.welcomeTitle}>Bem-vindo de volta</Text>
              <Text style={styles.welcomeSubtitle}>Digite seus dados abaixo</Text>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[
                styles.inputWrapper,
                emailError ? styles.inputError : null
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu email"
                  placeholderTextColor="#8A8A8A"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  accessibilityLabel="Campo de email"
                  accessibilityHint="Digite seu endereço de email"
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Senha</Text>
              <View style={[
                styles.inputWrapper,
                passwordError ? styles.inputError : null
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#8A8A8A"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  textContentType="password"
                  accessibilityLabel="Campo de senha"
                  accessibilityHint="Digite sua senha"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  <FontAwesome 
                    name={showPassword ? "eye-slash" : "eye"} 
                    size={20} 
                    color="#8A8A8A" 
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
            </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.signInButton,
                !isFormValid() || isLoading ? styles.signInButtonDisabled : null
              ]}
              onPress={handleLogin}
              disabled={!isFormValid() || isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#A78BFA', '#8B5CF6']}
                style={styles.signInButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.signInButtonText}>Entrando...</Text>
                  </View>
                ) : (
                  <Text style={styles.signInButtonText}>Entrar</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>Ou entre com</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleLogin}
                disabled={isGoogleLoading || isAppleLoading}
              >
                <FontAwesome name="google" size={20} color="#DB4437" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleAppleLogin}
                  disabled={isGoogleLoading || isAppleLoading}
                >
                  <FontAwesome name="apple" size={20} color="#000000" />
                  <Text style={styles.socialButtonText}>Apple</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.signupSection}>
              <Text style={styles.signupText}>Não tem uma conta? </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.signupLink}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
       header: {
    height: 240,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: '#A78BFA',
    justifyContent: 'space-between',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTime: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  signalIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginRight: 5,
  },
  wifiIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginRight: 5,
  },
  batteryIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 5,
  },
  headerButton: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
       content: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: '#A78BFA',
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
       card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    flex: 1,
    marginBottom: 20,
  },
  cardContent: {
    alignItems: 'stretch',
    flex: 1,
    justifyContent: 'flex-start',
  },
  topSection: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  formSection: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#8A8A8A',
    fontSize: 14,
  },
  signupLink: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    marginBottom: 15,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 12,
  },
  inputLabel: {
    color: '#333333',
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    color: '#333333',
    fontSize: 16,
    paddingRight: 40, // Espaço para o ícone do olho
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#b081ee',
    fontWeight: '600',
    fontSize: 14,
  },
  signInButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    marginHorizontal: 0,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignSelf: 'stretch',
  },
  signInButtonGradient: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E9ECEF',
  },
  orText: {
    color: '#8A8A8A',
    marginHorizontal: 15,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '45%',
    justifyContent: 'center',
  },
  socialButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 5,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1.5,
  },
});