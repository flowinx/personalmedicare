import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FilterType, SortType, MedicamentoLocal } from '../types';

interface FiltersAndSortProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sortBy: SortType;
  onSortByChange: (sort: SortType) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  medicamentos: MedicamentoLocal[];
  expiredCount: number;
  expiringSoonCount: number;
}

export default function FiltersAndSort({
  activeFilter,
  onFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  medicamentos,
  expiredCount,
  expiringSoonCount,
}: FiltersAndSortProps) {
  const activeCount = medicamentos.length - expiredCount - expiringSoonCount;

  const handleSortPress = (newSortBy: SortType) => {
    if (sortBy === newSortBy) {
      onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortByChange(newSortBy);
      onSortOrderChange('asc');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {/* Filtros por Status */}
        <FilterButton
          icon="list"
          text={`Todos (${medicamentos.length})`}
          active={activeFilter === 'todos'}
          onPress={() => onFilterChange('todos')}
          color="#667eea"
        />

        <FilterButton
          icon="checkmark-circle"
          text={`Ativos (${activeCount})`}
          active={activeFilter === 'ativos'}
          onPress={() => onFilterChange('ativos')}
          color="#4CAF50"
        />

        <FilterButton
          icon="time"
          text={`Vencendo (${expiringSoonCount})`}
          active={activeFilter === 'vencendo'}
          onPress={() => onFilterChange('vencendo')}
          color="#FFB800"
        />

        <FilterButton
          icon="warning"
          text={`Vencidos (${expiredCount})`}
          active={activeFilter === 'vencidos'}
          onPress={() => onFilterChange('vencidos')}
          color="#FF6B6B"
        />

        {/* Separador */}
        <View style={styles.separator} />

        {/* Ordenação */}
        <SortButton
          icon="text"
          text="Nome"
          active={sortBy === 'nome'}
          sortOrder={sortBy === 'nome' ? sortOrder : undefined}
          onPress={() => handleSortPress('nome')}
        />

        <SortButton
          icon="calendar"
          text="Vencimento"
          active={sortBy === 'vencimento'}
          sortOrder={sortBy === 'vencimento' ? sortOrder : undefined}
          onPress={() => handleSortPress('vencimento')}
        />

        <SortButton
          icon="cube"
          text="Quantidade"
          active={sortBy === 'quantidade'}
          sortOrder={sortBy === 'quantidade' ? sortOrder : undefined}
          onPress={() => handleSortPress('quantidade')}
        />
      </ScrollView>
    </View>
  );
}

interface FilterButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  active: boolean;
  onPress: () => void;
  color: string;
}

function FilterButton({ icon, text, active, onPress, color }: FilterButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={16} color={active ? '#fff' : color} />
      <Text style={[styles.filterButtonText, active && styles.filterButtonTextActive, { color: active ? '#fff' : color }]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

interface SortButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  active: boolean;
  sortOrder?: 'asc' | 'desc';
  onPress: () => void;
}

function SortButton({ icon, text, active, sortOrder, onPress }: SortButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.sortButton, active && styles.sortButtonActive]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={16} color={active ? '#fff' : '#667eea'} />
      <Text style={[styles.sortButtonText, active && styles.sortButtonTextActive]}>
        {text}
      </Text>
      {active && sortOrder && (
        <Ionicons
          name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'}
          size={12}
          color="#fff"
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollView: {
    flexGrow: 0,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 12,
    alignSelf: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  sortButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  sortButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#667eea',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
});