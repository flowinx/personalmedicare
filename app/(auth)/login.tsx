import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Animated, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AnimatedButton } from '../../components/AnimatedButton';
import { AnimatedCard } from '../../components/AnimatedCard';
import { signInWithApple, signInWithEmail, signInWithGoogle } from '../../services/firebase';
import { useEntranceAnimation } from '../../utils/animations';

export default function LoginScreen() {
  const router = useRouter();
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
      
      // Aguardar um pouco para o AuthContext atualizar
      setTimeout(() => {
        console.log('[Login] Redirecionando para drawer...');
        router.replace('/(drawer)');
      }, 1000);
      
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
      
      setTimeout(() => {
        router.replace('/(drawer)');
      }, 1000);
      
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
      
      setTimeout(() => {
        router.replace('/(drawer)');
      }, 1000);
      
    } catch (error: any) {
      console.error('[Login] Erro no login com Apple:', error);
      Alert.alert('Erro', 'Erro ao fazer login com Apple. Tente novamente.');
    } finally {
      setIsAppleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgotPassword');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo do Personal Medi Care"
          />
          <Animated.Text
            style={[
              styles.title,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            Personal Medi Care
          </Animated.Text>
          <Animated.Text
            style={[
              styles.subtitle,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            Sua saúde em suas mãos
          </Animated.Text>
        </Animated.View>

        <AnimatedCard
          delay={200}
          style={styles.formContainer}
          backgroundColor="transparent"
          elevation={0}
        >
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={[
              styles.inputWrapper,
              emailError ? styles.inputError : null
            ]}>
              <FontAwesome name="envelope" size={20} color={emailError ? "#FF6B6B" : "#8A8A8A"} style={styles.inputIcon} />
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
            <Text style={styles.label}>Senha</Text>
            <View style={[
              styles.inputWrapper,
              passwordError ? styles.inputError : null
            ]}>
              <FontAwesome name="lock" size={20} color={passwordError ? "#FF6B6B" : "#8A8A8A"} style={styles.inputIcon} />
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
            <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <AnimatedButton
            title="Entrar"
            onPress={handleLogin}
            variant="primary"
            size="large"
            loading={isLoading}
            disabled={!isFormValid() || isLoading}
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.orText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <AnimatedButton
            title="Entre com Google"
            onPress={handleGoogleLogin}
            variant="outline"
            size="large"
            loading={isGoogleLoading}
            disabled={isGoogleLoading || isAppleLoading}
            icon={<FontAwesome name="google" size={20} color="#DB4437" />}
            style={styles.socialButton}
          />

          {Platform.OS === 'ios' && (
            <AnimatedButton
              title="Entre com Apple"
              onPress={handleAppleLogin}
              variant="outline"
              size="large"
              loading={isAppleLoading}
              disabled={isGoogleLoading || isAppleLoading}
              icon={<FontAwesome name="apple" size={20} color="#000000" />}
              style={styles.socialButton}
            />
          )}

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signupLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#b081ee',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8A8A8A',
    textAlign: 'center',
    marginTop: 5,
  },
  formContainer: {
    padding: 0,
    margin: 0,
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
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
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#333333',
    fontSize: 16,
    paddingRight: 40, // Espaço para o ícone do olho
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#b081ee',
    fontWeight: '600',
    fontSize: 14,
  },
  loginButton: {
    marginBottom: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
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
  anonymousButton: {
    marginBottom: 30,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#8A8A8A',
    fontSize: 16,
  },
  signupLink: {
    color: '#b081ee',
    fontWeight: 'bold',
    fontSize: 16,
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
  socialButton: {
    marginBottom: 15,
  },
}); 