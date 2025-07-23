import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getAllMembers, getAllTreatments, Member, Treatment } from '../services/firebase';
import StatisticsService, { UserStatistics } from '../services/statistics';

const { width: screenWidth } = Dimensions.get('window');

interface ReportsScreenProps {
  navigation: any;
}

interface TreatmentReport {
  member: Member;
  treatments: Treatment[];
  activeTreatments: number;
  completedTreatments: number;
  totalMedications: number;
}

export default function ReportsScreen({ navigation }: ReportsScreenProps) {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [memberReports, setMemberReports] = useState<TreatmentReport[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  useFocusEffect(
    React.useCallback(() => {
      loadReportData();
    }, [selectedPeriod])
  );

  const loadReportData = async () => {
    try {
      const [members, treatments, stats] = await Promise.all([
        getAllMembers(),
        getAllTreatments(),
        StatisticsService.getUserStatistics()
      ]);

      setStatistics(stats);

      // Generate member reports
      const reports: TreatmentReport[] = members.map(member => {
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

  const OverviewCard = () => (
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b081ee" />
        <Text style={styles.loadingText}>Gerando relatórios...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <PeriodSelector />
        <OverviewCard />
        <AdherenceCard />
        <MemberReportsCard />
        <InsightsCard />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
});