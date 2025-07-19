import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { getAllTreatments, Treatment } from '../../db/index';
import { getMemberById, Member } from '../../db/members';

interface TreatmentWithAdherence extends Treatment {
  totalDoses: number;
  takenDoses: number;
}

export default function MemberReportScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const memberId = (route.params as any)?.id as string | undefined;
  const [member, setMember] = useState<Member | null>(null);
  const [treatments, setTreatments] = useState<TreatmentWithAdherence[]>([]);
  const [loading, setLoading] = useState(true);
  const [iaAnalysis, setIaAnalysis] = useState('');
  const [loadingIa, setLoadingIa] = useState(false);

  useEffect(() => {
    if (!memberId) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const memberData = await getMemberById(memberId);
        setMember(memberData);

        if (!memberData) {
          throw new Error('Membro não encontrado');
        }

        const allTreatments = await getAllTreatments();
        const memberTreatments = allTreatments.filter(treatment => treatment.member_id === memberId);

        // Por enquanto, vamos simular dados de adesão até implementarmos o sistema de schedule
        const treatmentsWithAdherence: TreatmentWithAdherence[] = memberTreatments.map(treatment => ({
          ...treatment,
          notes: treatment.notes || '',
          totalDoses: 0, // TODO: Implementar contagem real de doses
          takenDoses: 0, // TODO: Implementar contagem real de doses tomadas
        }));
        
        setTreatments(treatmentsWithAdherence);
      } catch (error) {
        console.error("Failed to fetch member report data:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados do dossiê.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [memberId]);

  // Limpa a análise da IA ao trocar de membro
  useEffect(() => {
    setIaAnalysis('');
  }, [memberId, treatments.length]);

  // Função para análise IA
  const gerarAnaliseIA = async () => {
    if (treatments.length === 0) return;
    
    setLoadingIa(true);
    setIaAnalysis('');
    
    try {
      const historico = treatments.map(t =>
        `- ${t.medication} (${t.dosage || 'dose não informada'}, a cada ${t.frequency_value || ''} ${t.frequency_unit || ''}, ${t.duration || 'duração não informada'}) [${t.status}]`
      ).join('\n');
      
      const prompt = `Considere o seguinte histórico de medicamentos consumidos:\n${historico}\n\nFaça uma análise detalhada sobre a situação do paciente, possíveis riscos, recomendações e pontos de atenção. Responda de forma clara e objetiva. Use frases curtas, destaque pontos importantes com emojis e, o mais importante, NÃO utilize nenhuma formatação markdown (como **, *, #, etc.).`;
      
      console.log('[MemberReport] Gerando relatório com Gemini...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDLL64gXACWEcnmSSJyjZV_pdVSTDn5yus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Resposta da IA:', data);
      const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      setIaAnalysis(texto);
    } catch (e) {
      console.error('Erro na análise IA:', e);
      setIaAnalysis('Erro ao buscar análise da IA.');
      Alert.alert('Erro', 'Erro ao buscar análise da IA.');
    } finally {
      setLoadingIa(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#b081ee" style={{ marginTop: 40 }} />
        ) : (
          <>
            {member && (
              <View style={styles.memberInfo}>
                <ThemedText style={styles.memberName} lightColor="#2d1155" darkColor="#2d1155">{member.name}</ThemedText>
                <ThemedText style={styles.memberRelation} lightColor="#2d1155" darkColor="#2d1155">{member.relation}</ThemedText>
              </View>
            )}
            <ThemedText style={styles.sectionTitle}>Relatório de Adesão</ThemedText>
            {treatments.length === 0 ? (
              <ThemedText style={styles.emptyText}>Nenhum tratamento registrado.</ThemedText>
            ) : (
              treatments.map(t => {
                const adherence = t.totalDoses > 0 ? (t.takenDoses / t.totalDoses) : 0;
                const adherencePercentage = (adherence * 100).toFixed(0);
                return (
                  <View key={t.id} style={styles.treatmentCard}>
                    <ThemedText style={styles.treatmentName} lightColor="#2d1155" darkColor="#2d1155">{t.medication}</ThemedText>
                    <ThemedText style={styles.treatmentInfo} lightColor="#2d1155" darkColor="#2d1155">Status: {t.status}</ThemedText>
                    <View style={styles.adherenceContainer}>
                      <ThemedText style={styles.adherenceText} lightColor="#2d1155" darkColor="#2d1155">Adesão: {t.takenDoses} / {t.totalDoses} ({adherencePercentage}%)</ThemedText>
                      <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarFill, { width: `${adherencePercentage}%` } as any]} />
                      </View>
                    </View>
                  </View>
                );
              })
            )}
            {treatments.length > 0 && (
              <TouchableOpacity style={styles.iaButton} onPress={gerarAnaliseIA} disabled={loadingIa}>
                <ThemedText style={styles.iaButtonText} lightColor="#fff" darkColor="#fff">{loadingIa ? 'Analisando...' : 'Gerar Análise com IA'}</ThemedText>
              </TouchableOpacity>
            )}
            {loadingIa && <ActivityIndicator size="large" color="#b081ee" style={{ marginVertical: 20 }} />}
            {iaAnalysis ? (
              <View style={styles.iaCard}>
                <ThemedText style={styles.iaCardTitle} lightColor="#2d1155" darkColor="#2d1155">Análise da IA</ThemedText>
                <ThemedText style={styles.iaCardText} lightColor="#2d1155" darkColor="#2d1155">{iaAnalysis}</ThemedText>
              </View>
            ) : null}
          </>
        )}
        <TouchableOpacity style={styles.backButton} onPress={() => (navigation as any).navigate('Dossiê')}>
          <ThemedText style={styles.backButtonText} lightColor="#b081ee" darkColor="#b081ee">Voltar</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  memberInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberRelation: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 30,
  },
  treatmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  treatmentInfo: {
    fontSize: 14,
  },
  treatmentNotes: {
    fontSize: 13,
    color: '#8A8A8A',
    marginTop: 4,
  },
  backButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  backButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  iaButton: {
    backgroundColor: '#b081ee',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  iaButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  iaCard: {
    backgroundColor: '#fff9f0',
    borderRadius: 12,
    padding: 18,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f3e1c7',
  },
  iaCardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  iaCardText: {
    lineHeight: 20,
  },
  adherenceContainer: {
    marginTop: 10,
  },
  adherenceText: {
    fontSize: 14,
    marginBottom: 5,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#b081ee',
  },
}); 