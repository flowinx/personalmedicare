import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signUpWithEmail } from '../../services/firebase';

export default function SignupScreen() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    if (!agree) {
      Alert.alert('Termos e Política', 'Por favor, concorde com os termos e política de privacidade para continuar.');
      return;
    }
    if (!fullname.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    setLoading(true);
    try {
      await signUpWithEmail(email, password, fullname);
      Alert.alert('Sucesso', 'Cadastro realizado! Faça login para continuar.');
      router.replace('/(auth)/login');
    } catch (e: any) {
      console.error('Erro no cadastro:', e);
      let errorMessage = 'Erro ao cadastrar usuário.';
      
      if (e.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso.';
      } else if (e.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      } else if (e.code === 'auth/weak-password') {
        errorMessage = 'A senha é muito fraca.';
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Criar Conta</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome completo"
            placeholderTextColor="#BDBDBD"
            value={fullname}
            onChangeText={setFullname}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-mail</Text>
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
        </View>

        <View style={styles.agreeContainer}>
          <Switch
              value={agree}
              onValueChange={setAgree}
              trackColor={{ false: "#E0E0E0", true: "#b081ee" }}
              thumbColor={"#FFFFFF"}
          />
          <Text style={styles.agreeText}>Eu concordo com os termos e política de privacidade</Text>
        </View>

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={loading}>
          <Text style={styles.signupButtonText}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Text>
        </TouchableOpacity>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
              <Text style={styles.loginText}>
                  Já tem uma conta? <Text style={{fontWeight: 'bold', color: '#b081ee'}}>Faça login</Text>
              </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
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
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 40,
    alignSelf: 'flex-start'
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
  agreeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  agreeText: {
    color: '#8A8A8A',
    marginLeft: 10,
  },
  signupButton: {
    backgroundColor: '#b081ee',
    borderRadius: 10,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loginText: {
    color: '#8A8A8A',
    marginTop: 30,
  },
}); 