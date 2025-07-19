import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { fetchMedicationInfo } from '../../services/gemini';

export default function MedicationDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  
  const [medicationName, setMedicationName] = useState<string>('');
  const [medicationInfo, setMedicationInfo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const params = route.params as any;
    
    if (params?.medicationName) {
      setMedicationName(params.medicationName);
    }
    
    if (params?.medicationInfo) {
      setMedicationInfo(params.medicationInfo);
    }
    
    // Se não recebeu informações via parâmetros, buscar via IA
    if (params?.medicationName && !params?.medicationInfo) {
      fetchMedicationDetails(params.medicationName);
    }
  }, [route.params]);

  useEffect(() => {
    navigation.setOptions({ title: 'Detalhes do Medicamento' });
  }, [navigation]);

  const fetchMedicationDetails = async (name: string) => {
    if (!name) return;
    
    setLoading(true);
    setError('');

    try {
      const info = await fetchMedicationInfo(name);
      setMedicationInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar informações');
    } finally {
      setLoading(false);
    }
  };

  const handleTestButton = () => {
    // Função de teste
  };

  return (
    <ThemedView style={styles.container}>
      {/* Teste super simples */}
      <View style={{ 
        flex: 1, 
        backgroundColor: 'red', 
        justifyContent: 'center', 
        alignItems: 'center',
        zIndex: 99999 
      }}>
        <ThemedText style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
          TELA FUNCIONANDO!
        </ThemedText>
        <ThemedText style={{ color: 'white', fontSize: 16, marginTop: 10 }}>
          Medicamento: {medicationName || 'Nenhum'}
        </ThemedText>
        <TouchableOpacity 
          style={{ 
            backgroundColor: 'white', 
            padding: 15, 
            borderRadius: 10, 
            marginTop: 20 
          }} 
          onPress={() => {
            Alert.alert('Teste', 'Tela funcionando!');
          }}
        >
          <ThemedText style={{ color: 'red', fontWeight: 'bold' }}>
            CLIQUE AQUI PARA TESTE
          </ThemedText>
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
    zIndex: 9999, // Forçar ficar no topo
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#2d1155',
  },
  medicationCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  medicationNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  medicationNameContainer: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d1155',
  },
  medicationSubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  medicationDetailsList: {
    marginTop: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8A8A8A',
    marginLeft: 10,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  descriptionSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d1155',
    marginLeft: 10,
  },
  descriptionContent: {
    paddingHorizontal: 10,
  },
  medicationInfoText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'left',
    paddingVertical: 5,
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
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
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
  },
}); 