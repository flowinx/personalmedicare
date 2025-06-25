import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signInWithApple, signInWithGoogle } from '../../services/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);

  const handleLogin = () => {
    // Por enquanto, apenas exibimos um alerta com os dados
    Alert.alert('Login Info', `Email: ${email}\nPassword: ${password}`);
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      const result = await signInWithGoogle();
      // Aqui você pode enviar o token para o backend e navegar/logar o usuário
      Alert.alert('Login Google', JSON.stringify(result));
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Erro ao fazer login com Google.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoadingApple(true);
    try {
      const result = await signInWithApple();
      // Aqui você pode enviar o token para o backend e navegar/logar o usuário
      Alert.alert('Login Apple', JSON.stringify(result));
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Erro ao fazer login com Apple.');
    } finally {
      setLoadingApple(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>PersonalMediCare</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Endereço de e-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="seuemail@exemplo.com"
          placeholderTextColor="#BDBDBD"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          placeholderTextColor="#BDBDBD"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Link href="/(auth)/forgotPassword" asChild>
            <TouchableOpacity>
                <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
            </TouchableOpacity>
        </Link>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Entrar</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>Ou</Text>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} disabled={loadingGoogle}>
        <Text style={styles.googleButtonText}>{loadingGoogle ? 'Entrando...' : 'G Entrar com Google'}</Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' && (
        <TouchableOpacity style={[styles.googleButton, { marginTop: 10 }]} onPress={handleAppleLogin} disabled={loadingApple}>
          <Text style={styles.googleButtonText}>{loadingApple ? 'Entrando...' : ' Entrar com Apple'}</Text>
        </TouchableOpacity>
      )}

      <Link href="/(auth)/signup" asChild>
        <TouchableOpacity>
          <Text style={styles.signupText}>
            Não tem uma conta? <Text style={{fontWeight: 'bold', color: '#b081ee'}}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#b081ee',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: '#333333',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    color: '#333333',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  forgotPassword: {
    color: '#b081ee',
    textAlign: 'right',
    marginTop: 10,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#b081ee',
    borderRadius: 10,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  orText: {
    color: '#BDBDBD',
    marginVertical: 20,
  },
  googleButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  googleButtonText: {
    color: '#333333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupText: {
    color: '#8A8A8A',
    marginTop: 30,
  },
}); 