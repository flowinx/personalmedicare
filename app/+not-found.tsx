import { FontAwesome } from '@expo/vector-icons';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { fetchMedicationInfo } from '../services/gemini';

export default function MedicationDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const medicationName = params.medicationName as string;
  const medicationInfo = params.medicationInfo as string;
  const [aiMedicationInfo, setAiMedicationInfo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (medicationName && !hasSearched) {
      setHasSearched(true);
      fetchMedicationDetails();
    }
  }, [medicationName, hasSearched]);

  useEffect(() => {
    if (aiMedicationInfo) {
      setError('');
    }
  }, [aiMedicationInfo]);

  const fetchMedicationDetails = async () => {
    if (!medicationName) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const info = await fetchMedicationInfo(medicationName);
      setAiMedicationInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar informações');
    } finally {
      setLoading(false);
    }
  };

  // Se não recebeu parâmetros de medicamento, mostrar tela de erro padrão
  if (!medicationName) {
    return (
      <>
        <Stack.Screen options={{ title: 'Oops!' }} />
        <ThemedView style={styles.container}>
          <ThemedText type="title">This screen does not exist.</ThemedText>
          <Link href="/" style={styles.link}>
            <ThemedText type="link">Go to home screen!</ThemedText>
          </Link>
        </ThemedView>
      </>
    );
  }

  // Tela de detalhes do medicamento
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Detalhes do Medicamento',
        headerTintColor: '#2d1155',
        headerStyle: { backgroundColor: '#fff' },
      }} />
      <ThemedView style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#b081ee" />
            <ThemedText style={styles.loadingText}>Carregando informações...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <FontAwesome name="exclamation-triangle" size={40} color="#dc3545" />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={fetchMedicationDetails}>
              <ThemedText style={styles.retryButtonText}>Tentar Novamente</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Card - Informações do Medicamento */}
            <View style={styles.medicationCard}>
              <View style={styles.medicationHeader}>
                <FontAwesome name="medkit" size={24} color="#b081ee" />
                <View style={styles.medicationInfo}>
                  <ThemedText style={styles.medicationName}>{medicationName}</ThemedText>
                  <ThemedText style={styles.medicationSubtitle}>Informações Detalhadas</ThemedText>
                </View>
              </View>

              {/* Detalhes do medicamento */}
              <View style={styles.detailsList}>
                <View style={styles.detailItem}>
                  <FontAwesome name="info-circle" size={16} color="#8A8A8A" />
                  <ThemedText style={styles.detailLabel}>Tipo:</ThemedText>
                  <ThemedText style={styles.detailValue}>Medicamento</ThemedText>
                </View>
                <View style={styles.detailItem}>
                  <FontAwesome name="check-circle" size={16} color="#8A8A8A" />
                  <ThemedText style={styles.detailLabel}>Status:</ThemedText>
                  <ThemedText style={styles.detailValue}>Informações Disponíveis</ThemedText>
                </View>
                <View style={styles.detailItem}>
                  <FontAwesome name="database" size={16} color="#8A8A8A" />
                  <ThemedText style={styles.detailLabel}>Fonte:</ThemedText>
                  <ThemedText style={styles.detailValue}>Base de Dados</ThemedText>
                </View>
              </View>
            </View>

            {/* Card - Informações Gerais */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <FontAwesome name="info-circle" size={24} color="#b081ee" />
                <ThemedText style={styles.cardTitle}>Informações Gerais</ThemedText>
              </View>
              <ScrollView style={styles.infoContent}>
                <ThemedText style={styles.infoText}>
                  {aiMedicationInfo || 'Informações detalhadas do medicamento serão carregadas aqui. Esta seção incluirá dados sobre indicações, contraindicações, efeitos colaterais e outras informações importantes para o uso seguro do medicamento.'}
                </ThemedText>
              </ScrollView>
            </View>

            {/* Botões de ação */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => router.back()}
              >
                <FontAwesome name="arrow-left" size={18} color="#fff" />
                <ThemedText style={styles.backButtonText}>Voltar</ThemedText>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  medicationCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  medicationInfo: {
    flex: 1,
    marginLeft: 15,
  },
  medicationName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d1155',
    fontFamily: 'Inter',
  },
  medicationSubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    fontFamily: 'Inter',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  detailsList: {
    marginTop: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8A8A8A',
    marginLeft: 10,
    fontFamily: 'Inter',
    minWidth: 60,
  },
  detailValue: {
    fontSize: 14,
    color: '#2d1155',
    fontWeight: '500',
    marginLeft: 10,
    fontFamily: 'Inter',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#2d1155',
    fontFamily: 'Inter',
  },
  infoContent: {
    paddingTop: 5,
    maxHeight: 300,
  },
  infoText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  actionButtons: {
    width: '100%',
    marginTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#b081ee',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    fontFamily: 'Inter',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8A8A8A',
    fontFamily: 'Inter',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: '#b081ee',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
});
