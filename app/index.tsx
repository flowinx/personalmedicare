import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  console.log('[Index] Componente renderizado - user:', user ? 'existe' : 'null', 'loading:', loading);

  useEffect(() => {
    console.log('[Index] useEffect executado - loading:', loading, 'user:', user ? 'existe' : 'null');
    
    if (!loading) {
      if (user) {
        console.log('[Index] Usuário autenticado, redirecionando para drawer');
        router.replace('/(drawer)');
      } else {
        console.log('[Index] Usuário não autenticado, redirecionando para login');
        router.replace('/(auth)/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    console.log('[Index] Mostrando tela de loading');
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#b081ee" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  console.log('[Index] Retornando null - redirecionamento deve acontecer');
  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Inicializando aplicativo...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
}); 