import { getAllMembers, getAllTreatments, Member, Treatment } from './firebase';

export interface UserStatistics {
  totalMembers: number;
  totalTreatments: number;
  activeTreatments: number;
  pausedTreatments: number;
  completedTreatments: number;
  todayScheduleCount: number;
  completedTodayCount: number;
  pendingTodayCount: number;
  overdueTodayCount: number;
  memberWithMostTreatments: {
    member: Member | null;
    treatmentCount: number;
  };
  mostUsedMedication: {
    medication: string;
    count: number;
  };
  treatmentsByStatus: {
    ativo: number;
    pausado: number;
    finalizado: number;
  };
  treatmentsByFrequency: {
    horas: number;
    dias: number;
  };
  recentActivity: {
    newMembersThisWeek: number;
    newTreatmentsThisWeek: number;
  };
}

class StatisticsService {
  private static instance: StatisticsService;

  static getInstance(): StatisticsService {
    if (!StatisticsService.instance) {
      StatisticsService.instance = new StatisticsService();
    }
    return StatisticsService.instance;
  }

  async getUserStatistics(): Promise<UserStatistics> {
    try {
      const [members, treatments] = await Promise.all([
        getAllMembers(),
        getAllTreatments()
      ]);

      const todaySchedule = this.generateTodaysSchedule(treatments, members);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Estatísticas básicas
      const totalMembers = members.length;
      const totalTreatments = treatments.length;
      const activeTreatments = treatments.filter(t => t.status === 'ativo').length;
      const pausedTreatments = treatments.filter(t => t.status === 'pausado').length;
      const completedTreatments = treatments.filter(t => t.status === 'finalizado').length;

      // Estatísticas da agenda de hoje
      const todayScheduleCount = todaySchedule.length;
      const completedTodayCount = todaySchedule.filter(s => s.status === 'tomado').length;
      const pendingTodayCount = todaySchedule.filter(s => s.status === 'pendente').length;
      const now = new Date();
      const overdueTodayCount = todaySchedule.filter(s => 
        s.status === 'pendente' && new Date(s.scheduled_time) < now
      ).length;

      // Membro com mais tratamentos
      const memberTreatmentCounts = new Map<string, number>();
      treatments.forEach(treatment => {
        const count = memberTreatmentCounts.get(treatment.member_id) || 0;
        memberTreatmentCounts.set(treatment.member_id, count + 1);
      });

      let memberWithMostTreatments = { member: null as Member | null, treatmentCount: 0 };
      memberTreatmentCounts.forEach((count, memberId) => {
        if (count > memberWithMostTreatments.treatmentCount) {
          const member = members.find(m => m.id === memberId);
          if (member) {
            memberWithMostTreatments = { member, treatmentCount: count };
          }
        }
      });

      // Medicamento mais usado
      const medicationCounts = new Map<string, number>();
      treatments.forEach(treatment => {
        const count = medicationCounts.get(treatment.medication) || 0;
        medicationCounts.set(treatment.medication, count + 1);
      });

      let mostUsedMedication = { medication: '', count: 0 };
      medicationCounts.forEach((count, medication) => {
        if (count > mostUsedMedication.count) {
          mostUsedMedication = { medication, count };
        }
      });

      // Tratamentos por status
      const treatmentsByStatus = {
        ativo: activeTreatments,
        pausado: pausedTreatments,
        finalizado: completedTreatments,
      };

      // Tratamentos por frequência
      const treatmentsByFrequency = {
        horas: treatments.filter(t => t.frequency_unit === 'horas').length,
        dias: treatments.filter(t => t.frequency_unit === 'dias').length,
      };

      // Atividade recente
      const newMembersThisWeek = members.filter(m => 
        m.createdAt && m.createdAt >= oneWeekAgo
      ).length;

      const newTreatmentsThisWeek = treatments.filter(t => 
        t.createdAt && t.createdAt >= oneWeekAgo
      ).length;

      return {
        totalMembers,
        totalTreatments,
        activeTreatments,
        pausedTreatments,
        completedTreatments,
        todayScheduleCount,
        completedTodayCount,
        pendingTodayCount,
        overdueTodayCount,
        memberWithMostTreatments,
        mostUsedMedication,
        treatmentsByStatus,
        treatmentsByFrequency,
        recentActivity: {
          newMembersThisWeek,
          newTreatmentsThisWeek,
        },
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return this.getEmptyStatistics();
    }
  }

  private generateTodaysSchedule(treatments: Treatment[], members: Member[]) {
    const today = new Date();
    const schedule: any[] = [];

    treatments.forEach(treatment => {
      if (treatment.status !== 'ativo') return;

      const member = members.find(m => m.id === treatment.member_id);
      if (!member) return;

      const startDate = new Date(treatment.start_datetime);
      if (startDate > today) return;

      // Generate schedule items for today based on frequency
      const frequencyHours = treatment.frequency_unit === 'horas' ? treatment.frequency_value : treatment.frequency_value * 24;
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      let currentTime = new Date(startDate);

      // Calculate next time based on frequency
      if (currentTime < todayStart) {
        const timeDiff = todayStart.getTime() - currentTime.getTime();
        const frequencyMs = frequencyHours * 60 * 60 * 1000;
        const periodsPassed = Math.floor(timeDiff / frequencyMs) + 1;
        currentTime = new Date(currentTime.getTime() + (periodsPassed * frequencyMs));
      }

      // Generate times for today
      while (currentTime <= todayEnd) {
        schedule.push({
          id: `${treatment.id}_${currentTime.getTime()}`,
          scheduled_time: currentTime.toISOString(),
          status: 'pendente', // In a real app, this would be stored
          treatment_id: treatment.id,
          medication: treatment.medication,
          dosage: treatment.dosage,
          member_name: member.name,
          member_avatar_uri: member.avatar_uri || '',
        });

        currentTime = new Date(currentTime.getTime() + (frequencyHours * 60 * 60 * 1000));
      }
    });

    return schedule.sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());
  }

  private getEmptyStatistics(): UserStatistics {
    return {
      totalMembers: 0,
      totalTreatments: 0,
      activeTreatments: 0,
      pausedTreatments: 0,
      completedTreatments: 0,
      todayScheduleCount: 0,
      completedTodayCount: 0,
      pendingTodayCount: 0,
      overdueTodayCount: 0,
      memberWithMostTreatments: { member: null, treatmentCount: 0 },
      mostUsedMedication: { medication: '', count: 0 },
      treatmentsByStatus: { ativo: 0, pausado: 0, finalizado: 0 },
      treatmentsByFrequency: { horas: 0, dias: 0 },
      recentActivity: { newMembersThisWeek: 0, newTreatmentsThisWeek: 0 },
    };
  }

  // Função para calcular a taxa de adesão (quantos medicamentos foram tomados no prazo)
  calculateAdherenceRate(completedCount: number, totalCount: number): number {
    if (totalCount === 0) return 0;
    return Math.round((completedCount / totalCount) * 100);
  }

  // Função para obter insights baseados nas estatísticas
  getInsights(stats: UserStatistics): string[] {
    const insights: string[] = [];

    if (stats.overdueTodayCount > 0) {
      insights.push(`Você tem ${stats.overdueTodayCount} medicamento(s) em atraso hoje.`);
    }

    if (stats.activeTreatments === 0 && stats.totalMembers > 0) {
      insights.push('Nenhum tratamento ativo. Considere adicionar tratamentos para seus membros.');
    }

    if (stats.recentActivity.newTreatmentsThisWeek > 0) {
      insights.push(`Você adicionou ${stats.recentActivity.newTreatmentsThisWeek} novo(s) tratamento(s) esta semana.`);
    }

    if (stats.memberWithMostTreatments.member && stats.memberWithMostTreatments.treatmentCount > 1) {
      insights.push(`${stats.memberWithMostTreatments.member.name} tem o maior número de tratamentos (${stats.memberWithMostTreatments.treatmentCount}).`);
    }

    const adherenceRate = this.calculateAdherenceRate(stats.completedTodayCount, stats.todayScheduleCount);
    if (adherenceRate >= 80) {
      insights.push(`Excelente! Você tem ${adherenceRate}% de adesão aos medicamentos hoje.`);
    } else if (adherenceRate >= 60) {
      insights.push(`Boa adesão! ${adherenceRate}% dos medicamentos foram tomados hoje.`);
    } else if (stats.todayScheduleCount > 0) {
      insights.push(`Atenção: apenas ${adherenceRate}% dos medicamentos foram tomados hoje.`);
    }

    return insights;
  }
}

export default StatisticsService.getInstance();