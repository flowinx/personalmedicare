import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getAllMembers, getAllTreatments, Member, Treatment } from '../services/firebase';
import StatisticsService, { UserStatistics } from '../services/statistics';
import { generateMedicalDossier } from '../services/groq';

const { width: screenWidth } = Dimensions.get('window');

interface ReportsScreenProps {
  navigation: any;
  route?: {
    params?: {
      memberId?: string;
    };
  };
}

interface TreatmentReport {
  member: Member;
  treatments: Treatment[];
  activeTreatments: number;
  completedTreatments: number;
  totalMedications: number;
}

export default function ReportsScreen({ navigation, route }: ReportsScreenProps) {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [memberReports, setMemberReports] = useState<TreatmentReport[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [medicalDossier, setMedicalDossier] = useState<string>('');
  const [loadingDossier, setLoadingDossier] = useState(false);

  // Função para formatar o texto removendo tags markdown
  const formatDossierText = (text: string): string => {
    if (!text) return text;
    
    return text
      // Remove tags de cabeçalho (# ## ### etc.)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove tags de negrito (**texto** ou __texto__)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      // Remove tags de itálico (*texto* ou _texto_)
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      // Remove tags de código (`código`)
      .replace(/`(.*?)`/g, '$1')
      // Remove blocos de código (```código```)
      .replace(/```[\s\S]*?```/g, '')
      // Remove links [texto](url)
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      // Remove listas (* item ou - item)
      .replace(/^[\s]*[\*\-]\s+/gm, '• ')
      // Remove listas numeradas (1. item)
      .replace(/^[\s]*\d+\.\s+/gm, '')
      // Remove linhas horizontais (--- ou ***)
      .replace(/^[\s]*[-\*]{3,}[\s]*$/gm, '')
      // Remove quebras de linha excessivas
      .replace(/\n{3,}/g, '\n\n')
      // Remove espaços em branco no início e fim
      .trim();
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log('ReportsScreen: Loading data for memberId:', route?.params?.memberId);
      loadReportData().then(() => {
        if (route?.params?.memberId) {
          console.log('ReportsScreen: Generating dossier for memberId:', route?.params?.memberId);
          generateMemberDossier();
        }
      });
    }, [selectedPeriod, route?.params?.memberId])
  );

  const generateMemberDossier = async () => {
    if (!route?.params?.memberId || memberReports.length === 0) {
      return;
    }
    
    setLoadingDossier(true);
    try {
      // Find the specific member by ID instead of assuming it's the first one
      const memberReport = memberReports.find(report => report.member.id === route?.params?.memberId);
      if (!memberReport) {
        setMedicalDossier('Membro não encontrado para gerar o dossiê.');
        return;
      }
      
      const member = memberReport.member;
      const treatments = memberReport.treatments || [];
      
      // Calculate age
      const calculateAge = (dob: string) => {
        if (!dob) return 0;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        return age > 0 ? age : 0;
      };

      const memberData = {
        name: member?.name || 'Nome não informado',
        age: calculateAge(member?.dob || ''),
        bloodType: member?.bloodType || member?.blood_type,
        weight: member?.weight,
        height: member?.height,
        relation: member?.relation || 'Não informado',
        treatments: treatments.map(t => ({
          medication: t.medication,
          dosage: t.dosage,
          frequency_value: t.frequency_value,
          frequency_unit: t.frequency_unit,
          duration: t.duration,
          status: t.status,
          notes: t.notes,
        })),
        notes: member?.notes,
      };
      
      const dossier = await generateMedicalDossier(memberData);
      setMedicalDossier(dossier);
    } catch (error) {
      console.error('Erro ao gerar dossiê:', error);
      if (error instanceof Error) {
        setMedicalDossier(`Erro ao gerar dossiê médico: ${error.message}`);
      } else {
        setMedicalDossier('Erro desconhecido ao gerar dossiê médico.');
      }
    } finally {
      setLoadingDossier(false);
    }
  };

  const loadReportData = async () => {
    try {
      const [members, treatments, stats] = await Promise.all([
        getAllMembers(),
        getAllTreatments(),
        StatisticsService.getUserStatistics()
      ]);

      // Filter by specific member if memberId is provided
      const filteredMembers = route?.params?.memberId 
        ? members.filter(m => m.id === route.params?.memberId)
        : members;

      const filteredTreatments = route?.params?.memberId
        ? treatments.filter(t => t.member_id === route.params?.memberId)
        : treatments;

      console.log('ReportsScreen: Total members:', members.length);
      console.log('ReportsScreen: Filtered members:', filteredMembers.length);
      console.log('ReportsScreen: Total treatments:', treatments.length);
      console.log('ReportsScreen: Filtered treatments:', filteredTreatments.length);
      if (route?.params?.memberId) {
        console.log('ReportsScreen: Looking for member with ID:', route.params.memberId);
        console.log('ReportsScreen: Found member:', filteredMembers[0]?.name || 'Not found');
      }

      // Update statistics for specific member if filtered
      const memberStats = route?.params?.memberId ? {
        ...stats,
        totalMembers: filteredMembers.length,
        totalTreatments: filteredTreatments.length,
        activeTreatments: filteredTreatments.filter(t => t.status === 'ativo').length,
        completedTreatments: filteredTreatments.filter(t => t.status === 'finalizado').length,
        todayScheduleCount: filteredTreatments.filter(t => t.status === 'ativo').length, // Simplified
        completedTodayCount: 0, // Would need more complex logic for actual today's data
        pendingTodayCount: filteredTreatments.filter(t => t.status === 'ativo').length,
        overdueTodayCount: 0,
      } : stats;

      setStatistics(memberStats);

      // Generate member reports
      const reports: TreatmentReport[] = filteredMembers.map(member => {
        const memberTreatments = treatments.filter(t => t.member_id === member.id);
        
        return {
          member,
          treatments: memberTreatments,
          activeTreatments: memberTreatments.filter(t => t.status === 'ativo').length,
          completedTreatments: memberTreatments.filter(t => t.status === 'finalizado').length,
          totalMedications: memberTreatments.length,
        };
      });

      setMemberReports(reports);
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAdherenceRate = () => {
    if (!statistics || statistics.todayScheduleCount === 0) return 0;
    return Math.round((statistics.completedTodayCount / statistics.todayScheduleCount) * 100);
  };

  const getAdherenceColor = (rate: number) => {
    if (rate >= 80) return '#34C759';
    if (rate >= 60) return '#FF9500';
    return '#ff6b6b';
  };

  const PeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['week', 'month', 'all'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.periodButtonTextActive
          ]}>
            {period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Todos'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const OverviewCard = () => {
    // If viewing specific member, show member profile card
    if (route?.params?.memberId && memberReports.length > 0) {
      // Find the specific member by ID instead of assuming it's the first one
      const memberReport = memberReports.find(report => report.member.id === route?.params?.memberId);
      if (!memberReport) {
        console.error('Member not found in reports for overview:', route?.params?.memberId);
        return null;
      }
      
      const member = memberReport.member;
      
      const calculateAge = (dob: string): string => {
        if (!dob || dob.trim() === '') {
          return '-';
        }

        let birthDate: Date;
        
        // Tenta diferentes formatos de data
        if (dob.includes('/')) {
          // Formato DD/MM/YYYY
          const parts = dob.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexado
            const year = parseInt(parts[2], 10);
            birthDate = new Date(year, month, day);
          } else {
            return 'Data inválida';
          }
        } else {
          // Tenta formato ISO ou outros formatos
          birthDate = new Date(dob);
        }
        
        // Verifica se a data é válida
        if (isNaN(birthDate.getTime())) {
          return 'Data inválida';
        }
        
        const today = new Date();
        
        // Verifica se a data de nascimento não é no futuro
        if (birthDate > today) {
          return 'Data inválida';
        }
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 0) {
          return 'Data inválida';
        } else if (age === 0) {
          // Calcula meses para bebês
          const months = today.getMonth() - birthDate.getMonth() + 
                        (12 * (today.getFullYear() - birthDate.getFullYear()));
          if (months === 0) {
            const days = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
            return days === 0 ? 'Recém-nascido' : `${days} dias`;
          }
          return `${months} meses`;
        } else {
          return `${age} anos`;
        }
      };

      return (
        <View style={styles.memberProfileCard}>
          <View style={styles.memberProfileHeader}>
            <View style={styles.memberAvatarContainer}>
              {member?.avatar_uri ? (
                <Image source={{ uri: member.avatar_uri }} style={styles.memberAvatar} />
              ) : (
                <View style={styles.memberAvatarPlaceholder}>
                  <Ionicons name="person" size={32} color="#b081ee" />
                </View>
              )}
            </View>
            <View style={styles.memberBasicInfo}>
              <Text style={styles.memberProfileName}>{member?.name || 'Nome não informado'}</Text>
              <Text style={styles.memberProfileRelation}>{member?.relation || 'Relação não informada'}</Text>
            </View>
          </View>

          <View style={styles.memberDetailsGrid}>
            <View style={styles.memberDetailItem}>
              <Ionicons name="calendar-outline" size={20} color="#b081ee" />
              <View style={styles.memberDetailInfo}>
                <Text style={styles.memberDetailLabel}>Idade</Text>
                <Text style={styles.memberDetailValue}>{calculateAge(member?.dob)}</Text>
              </View>
            </View>

            <View style={styles.memberDetailItem}>
              <Ionicons name="water-outline" size={20} color="#FF6B6B" />
              <View style={styles.memberDetailInfo}>
                <Text style={styles.memberDetailLabel}>Tipo Sanguíneo</Text>
                <Text style={styles.memberDetailValue}>{member?.bloodType || member?.blood_type || 'Não informado'}</Text>
              </View>
            </View>

            <View style={styles.memberDetailItem}>
              <Ionicons name="fitness-outline" size={20} color="#34C759" />
              <View style={styles.memberDetailInfo}>
                <Text style={styles.memberDetailLabel}>Peso</Text>
                <Text style={styles.memberDetailValue}>{member?.weight ? `${member.weight} kg` : 'Não informado'}</Text>
              </View>
            </View>

            <View style={styles.memberDetailItem}>
              <Ionicons name="resize-outline" size={20} color="#FF9500" />
              <View style={styles.memberDetailInfo}>
                <Text style={styles.memberDetailLabel}>Altura</Text>
                <Text style={styles.memberDetailValue}>{member?.height ? `${member.height} cm` : 'Não informado'}</Text>
              </View>
            </View>

            <View style={styles.memberDetailItem}>
              <Ionicons name="medical-outline" size={20} color="#b081ee" />
              <View style={styles.memberDetailInfo}>
                <Text style={styles.memberDetailLabel}>Tratamentos</Text>
                <Text style={styles.memberDetailValue}>{statistics?.totalTreatments || 0}</Text>
              </View>
            </View>

            <View style={styles.memberDetailItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#34C759" />
              <View style={styles.memberDetailInfo}>
                <Text style={styles.memberDetailLabel}>Ativos</Text>
                <Text style={styles.memberDetailValue}>{statistics?.activeTreatments || 0}</Text>
              </View>
            </View>
          </View>

          {member?.notes && (
            <View style={styles.memberNotesSection}>
              <View style={styles.memberNotesHeader}>
                <Ionicons name="document-text-outline" size={16} color="#b081ee" />
                <Text style={styles.memberNotesTitle}>Observações</Text>
              </View>
              <Text style={styles.memberNotesText}>{member.notes}</Text>
            </View>
          )}
        </View>
      );
    }

    // Default overview for general reports
    return (
      <View style={styles.overviewCard}>
        <Text style={styles.cardTitle}>Visão Geral</Text>
        
        <View style={styles.overviewGrid}>
          <View style={styles.overviewItem}>
            <Ionicons name="people" size={24} color="#b081ee" />
            <Text style={styles.overviewNumber}>{statistics?.totalMembers || 0}</Text>
            <Text style={styles.overviewLabel}>Membros</Text>
          </View>
          
          <View style={styles.overviewItem}>
            <Ionicons name="medical" size={24} color="#b081ee" />
            <Text style={styles.overviewNumber}>{statistics?.totalTreatments || 0}</Text>
            <Text style={styles.overviewLabel}>Tratamentos</Text>
          </View>
          
          <View style={styles.overviewItem}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            <Text style={styles.overviewNumber}>{statistics?.activeTreatments || 0}</Text>
            <Text style={styles.overviewLabel}>Ativos</Text>
          </View>
          
          <View style={styles.overviewItem}>
            <Ionicons name="calendar" size={24} color="#FF9500" />
            <Text style={styles.overviewNumber}>{statistics?.todayScheduleCount || 0}</Text>
            <Text style={styles.overviewLabel}>Hoje</Text>
          </View>
        </View>
      </View>
    );
  };

  const AdherenceCard = () => {
    const adherenceRate = getAdherenceRate();
    const adherenceColor = getAdherenceColor(adherenceRate);

    return (
      <View style={styles.adherenceCard}>
        <Text style={styles.cardTitle}>Taxa de Adesão - Hoje</Text>
        
        <View style={styles.adherenceContent}>
          <View style={styles.adherenceCircle}>
            <Text style={[styles.adherencePercentage, { color: adherenceColor }]}>
              {adherenceRate}%
            </Text>
          </View>
          
          <View style={styles.adherenceDetails}>
            <View style={styles.adherenceRow}>
              <View style={[styles.adherenceDot, { backgroundColor: '#34C759' }]} />
              <Text style={styles.adherenceText}>
                Tomados: {statistics?.completedTodayCount || 0}
              </Text>
            </View>
            <View style={styles.adherenceRow}>
              <View style={[styles.adherenceDot, { backgroundColor: '#FF9500' }]} />
              <Text style={styles.adherenceText}>
                Pendentes: {statistics?.pendingTodayCount || 0}
              </Text>
            </View>
            <View style={styles.adherenceRow}>
              <View style={[styles.adherenceDot, { backgroundColor: '#ff6b6b' }]} />
              <Text style={styles.adherenceText}>
                Atrasados: {statistics?.overdueTodayCount || 0}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const MemberReportsCard = () => (
    <View style={styles.memberReportsCard}>
      <Text style={styles.cardTitle}>Relatório por Membro</Text>
      
      {memberReports.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Nenhum membro cadastrado</Text>
        </View>
      ) : (
        memberReports.map((report, index) => (
          <TouchableOpacity
            key={report.member.id}
            style={styles.memberReportItem}
            onPress={() => navigation.navigate('MemberDetail', { id: report.member.id })}
          >
            <View style={styles.memberReportHeader}>
              <View style={styles.memberReportInfo}>
                <Text style={styles.memberReportName}>{report.member.name}</Text>
                <Text style={styles.memberReportRelation}>{report.member.relation}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
            
            <View style={styles.memberReportStats}>
              <View style={styles.memberReportStat}>
                <Text style={styles.memberReportStatNumber}>{report.totalMedications}</Text>
                <Text style={styles.memberReportStatLabel}>Total</Text>
              </View>
              <View style={styles.memberReportStat}>
                <Text style={[styles.memberReportStatNumber, { color: '#34C759' }]}>
                  {report.activeTreatments}
                </Text>
                <Text style={styles.memberReportStatLabel}>Ativos</Text>
              </View>
              <View style={styles.memberReportStat}>
                <Text style={[styles.memberReportStatNumber, { color: '#8E8E93' }]}>
                  {report.completedTreatments}
                </Text>
                <Text style={styles.memberReportStatLabel}>Finalizados</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const InsightsCard = () => {
    if (!statistics) return null;
    
    const insights = StatisticsService.getInsights(statistics);
    
    return (
      <View style={styles.insightsCard}>
        <Text style={styles.cardTitle}>Insights e Recomendações</Text>
        
        {insights.length === 0 ? (
          <Text style={styles.noInsights}>
            Continue usando o app para receber insights personalizados!
          </Text>
        ) : (
          insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <Ionicons name="bulb" size={16} color="#b081ee" />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))
        )}
      </View>
    );
  };

  const MedicalDossierCard = () => {
    if (!route?.params?.memberId) return null;

    return (
      <View style={styles.medicalDossierCard}>
        <View style={styles.medicalDossierHeader}>
          <Ionicons name="medical" size={24} color="#b081ee" />
          <Text style={styles.medicalDossierTitle}>Dossiê Médico Especializado</Text>
          <View style={styles.aiIndicator}>
            <Ionicons name="sparkles" size={16} color="#FF9500" />
            <Text style={styles.aiIndicatorText}>IA</Text>
          </View>
        </View>
        
        <Text style={styles.medicalDossierSubtitle}>
          Análise médica completa gerada por inteligência artificial especializada
        </Text>

        {loadingDossier ? (
          <View style={styles.dossierLoadingContainer}>
            <ActivityIndicator size="large" color="#b081ee" />
            <Text style={styles.dossierLoadingText}>
              Gerando análise médica especializada...
            </Text>
            <Text style={styles.dossierLoadingSubtext}>
              Nossa IA está analisando todos os dados médicos do paciente
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.dossierContent} nestedScrollEnabled={true}>
            <Text style={styles.dossierText}>
              {formatDossierText(medicalDossier) || 'Dossiê médico não disponível no momento.'}
            </Text>
          </ScrollView>
        )}

        <View style={styles.dossierDisclaimer}>
          <Ionicons name="information-circle" size={16} color="#FF9500" />
          <Text style={styles.dossierDisclaimerText}>
            Este dossiê é gerado por IA e não substitui consulta médica profissional.
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b081ee" />
        <Text style={styles.loadingText}>Gerando relatórios...</Text>
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
        <Text style={styles.headerTitle}>
          {route?.params?.memberId ? 'Dossiê do Membro' : 'Relatórios'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {!route?.params?.memberId && <PeriodSelector />}
          <OverviewCard />
          <AdherenceCard />
          {!route?.params?.memberId && <MemberReportsCard />}
          <InsightsCard />
          <MedicalDossierCard />
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
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#b081ee',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  adherenceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  adherenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adherenceCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  adherencePercentage: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  adherenceDetails: {
    flex: 1,
  },
  adherenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  adherenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  adherenceText: {
    fontSize: 14,
    color: '#666',
  },
  memberReportsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  memberReportItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  memberReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberReportInfo: {
    flex: 1,
  },
  memberReportName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  memberReportRelation: {
    fontSize: 14,
    color: '#b081ee',
    fontWeight: '600',
  },
  memberReportStats: {
    flexDirection: 'row',
    gap: 20,
  },
  memberReportStat: {
    alignItems: 'center',
  },
  memberReportStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  memberReportStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  insightsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  noInsights: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  // Member Profile Card Styles
  memberProfileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  memberProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  memberAvatarContainer: {
    marginRight: 16,
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#b081ee',
  },
  memberAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0eaff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#b081ee',
  },
  memberBasicInfo: {
    flex: 1,
  },
  memberProfileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  memberProfileRelation: {
    fontSize: 16,
    color: '#b081ee',
    fontWeight: '600',
  },
  memberDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  memberDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    minWidth: '45%',
    flex: 1,
  },
  memberDetailInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  memberDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  memberNotesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  memberNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberNotesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  memberNotesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  // Medical Dossier Card Styles
  medicalDossierCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#b081ee',
  },
  medicalDossierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicalDossierTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  aiIndicatorText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  medicalDossierSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  dossierLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  dossierLoadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  dossierLoadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  dossierContent: {
    maxHeight: 400,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dossierText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    textAlign: 'left',
  },
  dossierDisclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  dossierDisclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#B45309',
    lineHeight: 16,
    fontWeight: '500',
  },
});