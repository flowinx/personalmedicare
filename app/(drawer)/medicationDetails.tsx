import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { fetchMedicationInfo } from '../../services/gemini';

export default function MedicationDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const router = useRouter();
  
  const [medicationName, setMedicationName] = useState<string>('');
  const [medicationInfo, setMedicationInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const params = route.params as any;
    
    console.log('[MedicationDetails] Parâmetros recebidos:', params);
    
    if (params?.medicationName) {
      setMedicationName(params.medicationName);
      fetchMedicationDetails(params.medicationName);
    }
  }, [route.params]);

  useEffect(() => {
    navigation.setOptions({ title: 'Detalhes do Medicamento' });
  }, [navigation]);

  const fetchMedicationDetails = async (name: string) => {
    if (!name) return;

    setIsLoading(true);
    try {
      const info = await fetchMedicationInfo(name);
      setMedicationInfo(info);
      console.log('Informações do medicamento:', info);
    } catch (err) {
      console.error('Erro ao buscar informações do medicamento:', err);
      setMedicationInfo('Não foi possível buscar informações sobre este medicamento no momento. Consulte seu médico ou farmacêutico.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    console.log('[MedicationDetails] Função handleGoBack chamada');
    console.log('[MedicationDetails] Tentando voltar...');
    console.log('[MedicationDetails] Navigation object:', navigation);
    console.log('[MedicationDetails] Router object:', router);
    
    try {
      // Tentar usar navigation.navigate para voltar para Novo Tratamento
      console.log('[MedicationDetails] Usando navigation.navigate para Novo Tratamento');
      (navigation as any).navigate('Novo Tratamento');
      console.log('[MedicationDetails] Navegação executada com sucesso');
    } catch (error) {
      console.error('[MedicationDetails] Erro ao voltar:', error);
      // Fallback: tentar router.back()
      console.log('[MedicationDetails] Usando fallback - router.back()');
      try {
        router.back();
        console.log('[MedicationDetails] Fallback executado com sucesso');
      } catch (fallbackError) {
        console.error('[MedicationDetails] Erro no fallback:', fallbackError);
        Alert.alert('Erro', 'Não foi possível voltar. Use o botão voltar do dispositivo.');
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header fixo */}
      <View style={styles.header}>
        <FontAwesome name="medkit" size={24} color="#b081ee" />
        <ThemedText style={styles.headerTitle}>{medicationName}</ThemedText>
      </View>
      
      {/* Conteúdo com scroll */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#b081ee" />
              <ThemedText style={styles.loadingText}>Buscando informações...</ThemedText>
            </View>
          ) : (
            <View style={styles.infoContainer}>
              <ThemedText style={styles.medicationInfoText}>{medicationInfo}</ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Botão fixo na parte inferior */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <FontAwesome name="arrow-left" size={16} color="#fff" />
          <ThemedText style={styles.backButtonText}>Voltar</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#2d1155',
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 80, // Espaço para o botão fixo
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#b081ee',
  },
  infoContainer: {
    paddingHorizontal: 10,
  },
  medicationInfoText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'left',
    paddingVertical: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
  },
}); 