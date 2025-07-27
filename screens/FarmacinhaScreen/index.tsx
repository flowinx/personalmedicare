import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Importações do Firebase
import {
  addMedication,
  getAllMedications,
  updateMedication,
  deleteMedication,
} from '../../db/medications';

// Importações para a API Gemini
import { getMedicationCompleteInfo, extractActiveIngredient } from '../../services/gemini';

// Componentes
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import Dashboard from './components/Dashboard';
import SearchBar from './components/SearchBar';
import FiltersAndSort from './components/FiltersAndSort';
import MedicationList from './components/MedicationList';
import AddEditModal from './components/AddEditModal';
import DetailsModal from './components/DetailsModal';

// Types
import { MedicamentoLocal, FilterType, SortType } from './types';

// Utils
import { isExpired, isExpiringSoon } from './utils/dateUtils';

const { height } = Dimensions.get('window');

export default function FarmacinhaScreen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  // Estados principais
  const [medicamentos, setMedicamentos] = useState<MedicamentoLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Estados para filtros e ordenação
  const [activeFilter, setActiveFilter] = useState<FilterType>('todos');
  const [sortBy, setSortBy] = useState<SortType>('nome');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Estados do modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMedicamento, setEditingMedicamento] = useState<MedicamentoLocal | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMedicamento, setSelectedMedicamento] = useState<MedicamentoLocal | null>(null);

  useEffect(() => {
    loadMedicamentos();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Função para carregar medicamentos do Firebase
  const loadMedicamentos = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const firebaseMedications = await getAllMedications();
      const localMedications: MedicamentoLocal[] = firebaseMedications.map(med => ({
        id: med.id,
        nome: med.nome || '',
        categoria: med.categoria || 'Outros',
        quantidade: med.quantidade || '0',
        unidade: med.unidade || 'unidades',
        dataVencimento: med.dataVencimento || '',
        localizacao: med.localizacao || 'Não especificado',
        principioAtivo: med.principioAtivo || undefined,
        observacoes: med.observacoes || undefined,
        adicionadoEm: med.adicionadoEm || new Date().toISOString()
      }));

      setMedicamentos(localMedications);
    } catch (error) {
      console.error('❌ Erro ao carregar medicamentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os medicamentos. Tente novamente.');
    } finally {
      if (showLoading) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  // Função para usar medicamento (diminuir quantidade)
  const handleUseMedication = async (medicamento: MedicamentoLocal) => {
    const currentQuantity = parseInt(medicamento.quantidade);

    if (currentQuantity <= 0) {
      Alert.alert('Aviso', 'Este medicamento já está sem estoque.');
      return;
    }

    Alert.alert(
      'Usar Medicamento',
      `Diminuir 1 unidade de "${medicamento.nome}"?\n\nQuantidade atual: ${currentQuantity} ${medicamento.unidade}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Usar',
          onPress: async () => {
            try {
              const newQuantity = Math.max(0, currentQuantity - 1);
              const updatedData = {
                ...medicamento,
                quantidade: newQuantity.toString(),
                ultimoUso: new Date().toISOString()
              };

              await updateMedication(medicamento.id, updatedData);

              const updatedMedicamentos = medicamentos.map(med =>
                med.id === medicamento.id
                  ? { ...med, quantidade: newQuantity.toString(), ultimoUso: new Date().toISOString() }
                  : med
              );
              setMedicamentos(updatedMedicamentos);

              if (newQuantity === 0) {
                Alert.alert('Estoque Zerado', `O medicamento "${medicamento.nome}" ficou sem estoque!`);
              } else if (newQuantity <= 5) {
                Alert.alert('Estoque Baixo', `Restam apenas ${newQuantity} ${medicamento.unidade} de "${medicamento.nome}".`);
              }
            } catch (error) {
              console.error('Erro ao usar medicamento:', error);
              Alert.alert('Erro', 'Não foi possível atualizar o medicamento.');
            }
          }
        }
      ]
    );
  };

  // Função para deletar medicamento
  const handleDelete = async (medicamento: MedicamentoLocal) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir "${medicamento.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMedication(medicamento.id);
              await loadMedicamentos();
              Alert.alert('Sucesso', 'Medicamento excluído com sucesso!');
            } catch (error) {
              console.error('Erro ao deletar medicamento:', error);
              Alert.alert('Erro', 'Não foi possível excluir o medicamento.');
            }
          }
        }
      ]
    );
  };

  // Função para abrir modal de adição
  const openAddModal = () => {
    setEditingMedicamento(null);
    setModalVisible(true);
    animateModal(true);
  };

  // Função para abrir modal de edição
  const openEditModal = (medicamento: MedicamentoLocal) => {
    setEditingMedicamento(medicamento);
    setModalVisible(true);
    animateModal(true);
  };

  // Função para fechar modal
  const closeModal = () => {
    animateModal(false, () => {
      setModalVisible(false);
      setEditingMedicamento(null);
    });
  };

  // Animação do modal
  const animateModal = (show: boolean, callback?: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: show ? 1 : 0,
        duration: show ? 300 : 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: show ? 0 : height,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start(callback);
  };

  // Função para salvar medicamento
  const handleSave = async (medicamentoData: any) => {
    try {
      if (editingMedicamento) {
        await updateMedication(editingMedicamento.id, medicamentoData);
        const updatedMedicamentos = medicamentos.map(med =>
          med.id === editingMedicamento.id ? { ...med, ...medicamentoData } : med
        );
        setMedicamentos(updatedMedicamentos);
        Alert.alert('Sucesso', 'Medicamento atualizado com sucesso!');
      } else {
        await addMedication(medicamentoData);
        Alert.alert('Sucesso', 'Medicamento adicionado com sucesso!');
        loadMedicamentos(false);
      }
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar medicamento:', error);
      Alert.alert('Erro', 'Não foi possível salvar o medicamento. Tente novamente.');
    }
  };

  // Calcular estatísticas
  const expiredCount = medicamentos.filter(m => isExpired(m.dataVencimento)).length;
  const expiringSoonCount = medicamentos.filter(m => isExpiringSoon(m.dataVencimento) && !isExpired(m.dataVencimento)).length;

  // Função para aplicar filtros
  const applyFilters = (meds: MedicamentoLocal[]) => {
    return meds.filter(med => {
      const matchesSearch = med.nome.toLowerCase().includes(searchText.toLowerCase()) ||
        med.categoria.toLowerCase().includes(searchText.toLowerCase()) ||
        med.localizacao.toLowerCase().includes(searchText.toLowerCase()) ||
        (med.principioAtivo && med.principioAtivo.toLowerCase().includes(searchText.toLowerCase()));

      if (!matchesSearch) return false;

      switch (activeFilter) {
        case 'vencidos':
          return isExpired(med.dataVencimento);
        case 'vencendo':
          return isExpiringSoon(med.dataVencimento) && !isExpired(med.dataVencimento);
        case 'ativos':
          return !isExpired(med.dataVencimento) && !isExpiringSoon(med.dataVencimento);
        default:
          return true;
      }
    });
  };

  // Função para ordenar medicamentos
  const sortMedicamentos = (meds: MedicamentoLocal[]) => {
    return [...meds].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'nome':
          comparison = a.nome.localeCompare(b.nome);
          break;
        case 'vencimento':
          comparison = new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime();
          break;
        case 'quantidade':
          comparison = parseInt(a.quantidade) - parseInt(b.quantidade);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const filteredAndSortedMedicamentos = sortMedicamentos(applyFilters(medicamentos));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        onBack={() => navigation.goBack()} 
        onAdd={openAddModal} 
      />

      <StatsCards 
        expiredCount={expiredCount}
        expiringSoonCount={expiringSoonCount}
        fadeAnim={fadeAnim}
      />

      <Dashboard 
        totalCount={medicamentos.length}
        expiredCount={expiredCount}
        expiringSoonCount={expiringSoonCount}
      />

      <SearchBar 
        searchText={searchText}
        onSearchChange={setSearchText}
      />

      <FiltersAndSort
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        medicamentos={medicamentos}
        expiredCount={expiredCount}
        expiringSoonCount={expiringSoonCount}
      />

      <MedicationList
        medicamentos={filteredAndSortedMedicamentos}
        refreshing={refreshing}
        onRefresh={() => loadMedicamentos(false)}
        onUseMedication={handleUseMedication}
        onEditMedication={openEditModal}
        onDeleteMedication={handleDelete}
        onShowDetails={(med) => {
          setSelectedMedicamento(med);
          setShowDetailsModal(true);
        }}
        searchText={searchText}
        activeFilter={activeFilter}
      />

      <AddEditModal
        visible={modalVisible}
        editingMedicamento={editingMedicamento}
        onClose={closeModal}
        onSave={handleSave}
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
        getMedicationCompleteInfo={getMedicationCompleteInfo}
        extractActiveIngredient={extractActiveIngredient}
      />

      <DetailsModal
        visible={showDetailsModal}
        medicamento={selectedMedicamento}
        onClose={() => setShowDetailsModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
});