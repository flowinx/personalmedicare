import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MedicamentoLocal, FilterType } from '../types';
import { isExpired } from '../utils/dateUtils';

interface MedicationListProps {
  medicamentos: MedicamentoLocal[];
  refreshing: boolean;
  onRefresh: () => void;
  onUseMedication: (medicamento: MedicamentoLocal) => void;
  onEditMedication: (medicamento: MedicamentoLocal) => void;
  onDeleteMedication: (medicamento: MedicamentoLocal) => void;
  onShowDetails: (medicamento: MedicamentoLocal) => void;
  searchText: string;
  activeFilter: FilterType;
}

export default function MedicationList({
  medicamentos,
  refreshing,
  onRefresh,
  onUseMedication,
  onEditMedication,
  onDeleteMedication,
  onShowDetails,
  searchText,
  activeFilter,
}: MedicationListProps) {
  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <View style={styles.nameColumn}>
        <View style={styles.headerWithIcon}>
          <Ionicons name="medical" size={16} color="#64748b" style={styles.headerIcon} />
          <Text style={styles.tableHeaderText}>Medicamento</Text>
        </View>
      </View>
      <View style={styles.statusColumn}>
        <View style={styles.headerWithIconCentered}>
          <Ionicons name="checkmark-circle" size={16} color="#64748b" style={styles.headerIcon} />
          <Text style={styles.tableHeaderTextCentered}>Status</Text>
        </View>
      </View>
      <View style={styles.actionsColumn}>
        <View style={styles.headerWithIconCentered}>
          <Ionicons name="settings" size={16} color="#64748b" style={styles.headerIcon} />
          <Text style={styles.tableHeaderTextCentered}>Ações</Text>
        </View>
      </View>
    </View>
  );

  const renderMedicamentoItem = ({ item }: { item: MedicamentoLocal }) => {
    const expired = isExpired(item.dataVencimento);
    const isActive = !expired;

    return (
      <TouchableOpacity
        style={[styles.tableRow, !isActive && styles.inactiveRow]}
        onPress={() => onShowDetails(item)}
      >
        <View style={styles.nameColumn}>
          <View style={styles.medicamentoNameContainer}>
            <TouchableOpacity
              style={styles.useButtonInline}
              onPress={(e) => {
                e.stopPropagation();
                onUseMedication(item);
              }}
            >
              <Ionicons name="remove-circle" size={18} color="#4CAF50" />
            </TouchableOpacity>
            <Text style={[styles.tableCellText, !isActive && styles.inactiveText]}>
              {item.nome}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusColumn}>
          <View style={styles.statusCell}>
            <View style={[
              styles.statusBadgeTable,
              {
                backgroundColor: isActive ? '#f0fdf4' : '#fef2f2',
                borderWidth: 1,
                borderColor: isActive ? '#bbf7d0' : '#fecaca',
              }
            ]}>
              <Text style={[
                styles.statusTextTable,
                { color: isActive ? '#16a34a' : '#dc2626' }
              ]}>
                {isActive ? 'Ativo' : 'Vencido'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.actionsColumn}>
          <View style={styles.actionsCell}>
            <TouchableOpacity
              style={styles.editButtonTable}
              onPress={(e) => {
                e.stopPropagation();
                onEditMedication(item);
              }}
            >
              <Ionicons name="pencil" size={14} color="#64748b" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButtonTable}
              onPress={(e) => {
                e.stopPropagation();
                onDeleteMedication(item);
              }}
            >
              <Ionicons name="trash" size={14} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (medicamentos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="medical-outline" size={80} color="#C7C7CC" />
        <Text style={styles.emptyTitle}>Nenhum medicamento encontrado</Text>
        <Text style={styles.emptySubtitle}>
          {searchText || activeFilter !== 'todos' 
            ? 'Tente ajustar os filtros ou busca' 
            : 'Adicione seu primeiro medicamento'
          }
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.tableContainer}>
      <FlatList
        data={medicamentos}
        renderItem={renderMedicamentoItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderTableHeader}
        contentContainerStyle={styles.tableContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
            title="Atualizando medicamentos..."
            titleColor="#667eea"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tableContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tableContentContainer: {
    paddingBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
  },
  tableHeaderText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'left',
  },
  headerWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerWithIconCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableHeaderTextCentered: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerIcon: {
    marginRight: 6,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  inactiveRow: {
    backgroundColor: '#fef7f7',
  },
  tableCellText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  nameColumn: {
    flex: 4,
    alignItems: 'flex-start',
  },
  statusColumn: {
    flex: 2,
    alignItems: 'center',
  },
  actionsColumn: {
    flex: 2,
    alignItems: 'center',
  },
  statusCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  statusBadgeTable: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  statusTextTable: {
    fontSize: 12,
    fontWeight: '600',
  },

  useButtonInline: {
    backgroundColor: '#f0fdf4',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  editButtonTable: {
    backgroundColor: '#f1f5f9',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  deleteButtonTable: {
    backgroundColor: '#f1f5f9',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  medicamentoNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medicamentoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inactiveText: {
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8E8E93',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#C7C7CC',
    marginTop: 8,
    textAlign: 'center',
  },
});