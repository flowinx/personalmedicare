import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { getAllMembers, getAllTreatments, Member, Treatment } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';

interface ExportDataScreenProps {
  navigation: any;
}

interface ExportOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  selected: boolean;
  dataType: 'members' | 'treatments' | 'profile' | 'all';
}

export default function ExportDataScreen({ navigation }: ExportDataScreenProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOption[]>([
    {
      id: '1',
      title: 'Dados Pessoais',
      subtitle: 'Informações do seu perfil',
      icon: 'person-outline',
      selected: true,
      dataType: 'profile'
    },
    {
      id: '2',
      title: 'Membros da Família',
      subtitle: 'Lista de todos os membros cadastrados',
      icon: 'people-outline',
      selected: true,
      dataType: 'members'
    },
    {
      id: '3',
      title: 'Tratamentos',
      subtitle: 'Histórico completo de medicamentos',
      icon: 'medical-outline',
      selected: true,
      dataType: 'treatments'
    },
    {
      id: '4',
      title: 'Dados Completos',
      subtitle: 'Exportar todos os dados em um arquivo',
      icon: 'document-text-outline',
      selected: false,
      dataType: 'all'
    }
  ]);

  const [stats, setStats] = useState({
    membersCount: 0,
    treatmentsCount: 0,
    activeTreatments: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [members, treatments] = await Promise.all([
        getAllMembers(),
        getAllTreatments()
      ]);

      setStats({
        membersCount: members.length,
        treatmentsCount: treatments.length,
        activeTreatments: treatments.filter(t => t.status === 'ativo').length,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const toggleOption = (optionId: string) => {
    setExportOptions(prev => prev.map(option => {
      if (option.id === optionId) {
        // Se selecionou "Dados Completos", desmarcar outros
        if (option.dataType === 'all') {
          return { ...option, selected: !option.selected };
        }
        return { ...option, selected: !option.selected };
      } else if (option.dataType === 'all' && optionId !== '4') {
        // Se selecionou outro, desmarcar "Dados Completos"
        return { ...option, selected: false };
      }
      return option;
    }));
  };

  const generateCSVContent = async (dataType: 'members' | 'treatments' | 'profile' | 'all') => {
    let csvContent = '';

    try {
      if (dataType === 'profile' || dataType === 'all') {
        csvContent += '=== DADOS PESSOAIS ===\n';
        csvContent += `Nome,${profile?.name || user?.displayName || 'Não informado'}\n`;
        csvContent += `Email,${profile?.email || user?.email || 'Não informado'}\n`;
        csvContent += `ID do Usuário,${user?.uid || 'Não informado'}\n`;
        csvContent += `Data de Exportação,${new Date().toLocaleDateString('pt-BR')}\n\n`;
      }

      if (dataType === 'members' || dataType === 'all') {
        const members = await getAllMembers();
        csvContent += '=== MEMBROS DA FAMÍLIA ===\n';
        csvContent += 'Nome,Relação,Data de Nascimento,Tipo Sanguíneo,Observações\n';
        
        members.forEach(member => {
          const name = member.name || 'Não informado';
          const relation = member.relation || 'Não informado';
          const dob = member.dob || 'Não informado';
          const bloodType = member.bloodType || member.blood_type || 'Não informado';
          const notes = member.notes || 'Nenhuma';
          
          csvContent += `"${name}","${relation}","${dob}","${bloodType}","${notes}"\n`;
        });
        csvContent += '\n';
      }

      if (dataType === 'treatments' || dataType === 'all') {
        const [members, treatments] = await Promise.all([
          getAllMembers(),
          getAllTreatments()
        ]);

        csvContent += '=== TRATAMENTOS ===\n';
        csvContent += 'Membro,Medicamento,Dosagem,Frequência,Duração,Status,Data de Início,Observações\n';
        
        treatments.forEach(treatment => {
          const member = members.find(m => m.id === treatment.member_id);
          const memberName = member?.name || 'Membro não encontrado';
          const medication = treatment.medication || 'Não informado';
          const dosage = treatment.dosage || 'Não informado';
          const frequency = `${treatment.frequency_value || 'N/A'} ${treatment.frequency_unit || ''}`.trim();
          const duration = treatment.duration || 'Não informado';
          const status = treatment.status || 'Não informado';
          const startDate = treatment.start_date || 'Não informado';
          const notes = treatment.notes || 'Nenhuma';
          
          csvContent += `"${memberName}","${medication}","${dosage}","${frequency}","${duration}","${status}","${startDate}","${notes}"\n`;
        });
        csvContent += '\n';
      }

      return csvContent;
    } catch (error) {
      console.error('Erro ao gerar conteúdo CSV:', error);
      throw error;
    }
  };

  const generateJSONContent = async () => {
    try {
      const [members, treatments] = await Promise.all([
        getAllMembers(),
        getAllTreatments()
      ]);

      const exportData = {
        exportInfo: {
          date: new Date().toISOString(),
          version: '1.0.0',
          user: {
            id: user?.uid,
            name: profile?.name || user?.displayName,
            email: profile?.email || user?.email,
          }
        },
        profile: {
          name: profile?.name || user?.displayName,
          email: profile?.email || user?.email,
          avatar_uri: profile?.avatar_uri,
        },
        members: members.map(member => ({
          id: member.id,
          name: member.name,
          relation: member.relation,
          dob: member.dob,
          bloodType: member.bloodType || member.blood_type,
          notes: member.notes,
          avatar_uri: member.avatar_uri,
        })),
        treatments: treatments.map(treatment => ({
          id: treatment.id,
          member_id: treatment.member_id,
          medication: treatment.medication,
          dosage: treatment.dosage,
          frequency_value: treatment.frequency_value,
          frequency_unit: treatment.frequency_unit,
          duration: treatment.duration,
          status: treatment.status,
          start_date: treatment.start_date,
          notes: treatment.notes,
        })),
        statistics: {
          totalMembers: members.length,
          totalTreatments: treatments.length,
          activeTreatments: treatments.filter(t => t.status === 'ativo').length,
          completedTreatments: treatments.filter(t => t.status === 'finalizado').length,
        }
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Erro ao gerar conteúdo JSON:', error);
      throw error;
    }
  };

  const exportData = async (format: 'csv' | 'json') => {
    const selectedOptions = exportOptions.filter(option => option.selected);
    
    if (selectedOptions.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um tipo de dados para exportar.');
      return;
    }

    setLoading(true);
    try {
      let content = '';
      let fileName = '';
      let mimeType = '';

      if (format === 'csv') {
        // Para CSV, combinar todos os tipos selecionados
        const allOption = selectedOptions.find(opt => opt.dataType === 'all');
        if (allOption) {
          content = await generateCSVContent('all');
          fileName = `personal_medicare_dados_completos_${new Date().toISOString().split('T')[0]}.csv`;
        } else {
          for (const option of selectedOptions) {
            const optionContent = await generateCSVContent(option.dataType);
            content += optionContent;
          }
          fileName = `personal_medicare_dados_${new Date().toISOString().split('T')[0]}.csv`;
        }
        mimeType = 'text/csv';
      } else {
        // Para JSON, sempre exportar dados completos
        content = await generateJSONContent();
        fileName = `personal_medicare_backup_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      // Salvar arquivo
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Compartilhar arquivo usando Share API nativa
      await Share.share({
        url: fileUri,
        title: 'Dados Exportados - Personal Medicare',
        message: `Arquivo exportado: ${fileName}`,
      });

      Alert.alert(
        'Exportação Concluída',
        `Seus dados foram exportados com sucesso em formato ${format.toUpperCase()}.`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      Alert.alert(
        'Erro na Exportação',
        'Não foi possível exportar os dados. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exportar Dados</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="download" size={24} color="#b081ee" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Exportação de Dados</Text>
              <Text style={styles.infoText}>
                Baixe seus dados em formato CSV (planilha) ou JSON (backup completo) para usar em outros aplicativos ou fazer backup.
              </Text>
            </View>
          </View>

          {/* Stats Card */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Resumo dos Dados</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={20} color="#b081ee" />
                <Text style={styles.statNumber}>{stats.membersCount}</Text>
                <Text style={styles.statLabel}>Membros</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="medical" size={20} color="#b081ee" />
                <Text style={styles.statNumber}>{stats.treatmentsCount}</Text>
                <Text style={styles.statLabel}>Tratamentos</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.statNumber}>{stats.activeTreatments}</Text>
                <Text style={styles.statLabel}>Ativos</Text>
              </View>
            </View>
          </View>

          {/* Export Options */}
          <View style={styles.optionsCard}>
            <Text style={styles.optionsTitle}>Selecionar Dados</Text>
            {exportOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionItem}
                onPress={() => toggleOption(option.id)}
              >
                <View style={styles.optionLeft}>
                  <View style={styles.optionIcon}>
                    <Ionicons name={option.icon as any} size={20} color="#b081ee" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                  </View>
                </View>
                <View style={styles.checkbox}>
                  {option.selected && (
                    <Ionicons name="checkmark" size={16} color="#b081ee" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Export Buttons */}
          <View style={styles.exportCard}>
            <Text style={styles.exportTitle}>Formato de Exportação</Text>
            
            <TouchableOpacity
              style={[styles.exportButton, styles.csvButton]}
              onPress={() => exportData('csv')}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="grid-outline" size={20} color="#fff" />
                  <Text style={styles.exportButtonText}>Exportar como CSV</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.exportDescription}>
              Formato de planilha compatível com Excel, Google Sheets
            </Text>

            <TouchableOpacity
              style={[styles.exportButton, styles.jsonButton]}
              onPress={() => exportData('json')}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="code-outline" size={20} color="#fff" />
                  <Text style={styles.exportButtonText}>Exportar como JSON</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.exportDescription}>
              Backup completo para importar em outros dispositivos
            </Text>
          </View>

          {/* Privacy Notice */}
          <View style={styles.privacyCard}>
            <Ionicons name="shield-checkmark" size={20} color="#34C759" />
            <Text style={styles.privacyText}>
              Seus dados são exportados localmente e compartilhados apenas através dos aplicativos que você escolher. Nenhuma informação é enviada para servidores externos.
            </Text>
          </View>
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
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsCard: {
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
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  optionsCard: {
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
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0eaff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#b081ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportCard: {
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
  exportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 8,
    gap: 8,
  },
  csvButton: {
    backgroundColor: '#34C759',
  },
  jsonButton: {
    backgroundColor: '#b081ee',
    marginTop: 12,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exportDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  privacyCard: {
    backgroundColor: '#f0fff4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  privacyText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});