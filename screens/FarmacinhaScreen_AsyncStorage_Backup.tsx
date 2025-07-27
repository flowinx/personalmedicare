import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMedicationInfo } from '../services/gemini';

const { width } = Dimensions.get('window');

interface FarmacinhaScreenProps {
  navigation: any;
}

interface Medicamento {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  dataVencimento: string;
  localizacao: string;
  observacoes?: string;
  adicionadoEm: string;
}

const CATEGORIAS = [
  'Analgésicos',
  'Anti-inflamatórios',
  'Antibióticos',
  'Antialérgicos',
  'Vitaminas',
  'Digestivos',
  'Respiratórios',
  'Cardiovasculares',
  'Dermatológicos',
  'Outros'
];

const UNIDADES = ['Comprimidos', 'Cápsulas', 'ml', 'Gotas', 'Sachês', 'Ampolas', 'Frascos'];

export default function FarmacinhaScreen({ navigation }: FarmacinhaScreenProps) {
  console.log('🚀 FARMACINHA SCREEN CARREGADA - VERSÃO NOVA!');

  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMedicamento, setEditingMedicamento] = useState<Medicamento | null>(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Outros');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('Comprimidos');
  const [dataVencimento, setDataVencimento] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // AI states
  const [showMedicationInfoModal, setShowMedicationInfoModal] = useState(false);
  const [medicationInfo, setMedicationInfo] = useState('');
  const [loadingMedicationInfo, setLoadingMedicationInfo] = useState(false);
  const [stockAlert, setStockAlert] = useState<string | null>(null);

  // Details modal states
  const [selectedMedicamento, setSelectedMedicamento] = useState<Medicamento | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Animation
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadMedicamentos();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadMedicamentos = async () => {
    try {
      const stored = await AsyncStorage.getItem('farmacinha_medicamentos');
      if (stored) {
        setMedicamentos(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erro ao carregar medicamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMedicamentos = async (newMedicamentos: Medicamento[]) => {
    try {
      await AsyncStorage.setItem('farmacinha_medicamentos', JSON.stringify(newMedicamentos));
      setMedicamentos(newMedicamentos);
    } catch (error) {
      console.error('Erro ao salvar medicamentos:', error);
      Alert.alert('Erro', 'Não foi possível salvar o medicamento.');
    }
  };

  const openAddModal = () => {
    console.log('🎯 ABRINDO MODAL DE ADICIONAR MEDICAMENTO - VERSÃO NOVA!');
    resetForm();
    setEditingMedicamento(null);
    setModalVisible(true);
  };

  const openEditModal = (medicamento: Medicamento) => {
    setNome(medicamento.nome);
    setCategoria(medicamento.categoria);
    setQuantidade(medicamento.quantidade.toString());
    setUnidade(medicamento.unidade);
    setDataVencimento(medicamento.dataVencimento);
    setLocalizacao(medicamento.localizacao);
    setObservacoes(medicamento.observacoes || '');
    setEditingMedicamento(medicamento);
    setModalVisible(true);
  };

  const resetForm = () => {
    setNome('');
    setCategoria('Outros');
    setQuantidade('');
    setUnidade('Comprimidos');
    setDataVencimento('');
    setLocalizacao('');
    setObservacoes('');
    setStockAlert(null);
    setMedicationInfo('');
  };

  const handleMedicationInfo = async () => {
    if (!nome.trim()) {
      Alert.alert('Nome Necessário', 'Digite o nome do medicamento primeiro.');
      return;
    }

    setLoadingMedicationInfo(true);
    setShowMedicationInfoModal(true);

    try {
      const info = await fetchMedicationInfo(nome.trim());
      setMedicationInfo(info);
    } catch (error) {
      console.error('Erro ao buscar informações:', error);
      setMedicationInfo('Não foi possível obter informações sobre este medicamento no momento.');
    } finally {
      setLoadingMedicationInfo(false);
    }
  };

  const checkStockByActiveIngredient = async (medicationName: string) => {
    if (!medicationName.trim() || medicamentos.length === 0) {
      return;
    }

    setTimeout(() => {
      if (medicamentos.some(m => m.nome.toLowerCase().includes(medicationName.toLowerCase().split(' ')[0]))) {
        setStockAlert(`⚠️ Medicamento similar encontrado no estoque!`);
      } else {
        setStockAlert(null);
      }
    }, 1000);
  };

  const handleNomeChange = (text: string) => {
    setNome(text);
    if (text.length >= 3) {
      setTimeout(() => checkStockByActiveIngredient(text), 1000);
    } else {
      setStockAlert(null);
    }
  };

  const handleSave = () => {
    if (!nome.trim() || !quantidade.trim() || !dataVencimento.trim() || !localizacao.trim()) {
      Alert.alert('Campos Obrigatórios', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const medicamento: Medicamento = {
      id: editingMedicamento?.id || Date.now().toString(),
      nome: nome.trim(),
      categoria,
      quantidade: parseInt(quantidade),
      unidade,
      dataVencimento,
      localizacao: localizacao.trim(),
      observacoes: observacoes.trim(),
      adicionadoEm: editingMedicamento?.adicionadoEm || new Date().toISOString(),
    };

    let newMedicamentos;
    if (editingMedicamento) {
      newMedicamentos = medicamentos.map(m => m.id === editingMedicamento.id ? medicamento : m);
    } else {
      newMedicamentos = [...medicamentos, medicamento];
    }

    saveMedicamentos(newMedicamentos);
    setModalVisible(false);
    resetForm();

    Alert.alert(
      '🎉 Sucesso!',
      `${editingMedicamento ? 'Medicamento atualizado' : 'Medicamento adicionado'} com sucesso!`,
      [{ text: 'OK' }]
    );
  };

  const handleDelete = (medicamento: Medicamento) => {
    Alert.alert(
      'Remover Medicamento',
      `Tem certeza que deseja remover "${medicamento.nome}" da farmacinha?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            const newMedicamentos = medicamentos.filter(m => m.id !== medicamento.id);
            saveMedicamentos(newMedicamentos);
          }
        }
      ]
    );
  };

  const filteredMedicamentos = medicamentos.filter(medicamento => {
    const matchesSearch = medicamento.nome.toLowerCase().includes(searchText.toLowerCase()) ||
      medicamento.categoria.toLowerCase().includes(searchText.toLowerCase()) ||
      medicamento.localizacao.toLowerCase().includes(searchText.toLowerCase());

    return matchesSearch;
  });

  const isExpiringSoon = (dataVencimento: string) => {
    const today = new Date();
    const expiry = new Date(dataVencimento);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  const isExpired = (dataVencimento: string) => {
    const today = new Date();
    const expiry = new Date(dataVencimento);
    return expiry < today;
  };

  const getCategoryColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      'Analgésicos': '#FF6B6B',
      'Anti-inflamatórios': '#FF8E53',
      'Antibióticos': '#4ECDC4',
      'Antialérgicos': '#45B7D1',
      'Vitaminas': '#96CEB4',
      'Digestivos': '#FFEAA7',
      'Respiratórios': '#74B9FF',
      'Cardiovasculares': '#FD79A8',
      'Dermatológicos': '#FDCB6E',
      'Outros': '#A29BFE'
    };
    return colors[categoria] || '#A29BFE';
  };

  const getCategoryIcon = (categoria: string) => {
    const icons: { [key: string]: string } = {
      'Analgésicos': 'medical',
      'Anti-inflamatórios': 'flame',
      'Antibióticos': 'shield-checkmark',
      'Antialérgicos': 'leaf',
      'Vitaminas': 'nutrition',
      'Digestivos': 'restaurant',
      'Respiratórios': 'lung',
      'Cardiovasculares': 'heart',
      'Dermatológicos': 'hand-left',
      'Outros': 'ellipsis-horizontal'
    };
    return icons[categoria] || 'medical';
  };

  const openDetailsModal = (medicamento: Medicamento) => {
    console.log('🔍 ABRINDO DETALHES DO MEDICAMENTO:', medicamento.nome);
    setSelectedMedicamento(medicamento);
    setShowDetailsModal(true);
  };

  const renderMedicamentoRow = ({ item }: { item: Medicamento }) => {
    const expired = isExpired(item.dataVencimento);
    const expiringSoon = isExpiringSoon(item.dataVencimento);
    const categoryColor = getCategoryColor(item.categoria);
    const categoryIcon = getCategoryIcon(item.categoria);

    const getStatusColor = () => {
      if (expired) return '#FF6B6B';
      if (expiringSoon) return '#FFB800';
      return '#4CAF50';
    };

    const getStatusText = () => {
      if (expired) return 'Vencido';
      if (expiringSoon) return 'Vence em breve';
      return 'OK';
    };

    return (
      <TouchableOpacity
        style={styles.tableRow}
        onPress={() => openDetailsModal(item)}
        activeOpacity={0.7}
      >
        {/* Ícone da Categoria */}
        <View style={styles.tableCell}>
          <View style={[styles.categoryIconSmall, { backgroundColor: categoryColor }]}>
            <Ionicons name={categoryIcon} size={16} color="#fff" />
          </View>
        </View>

        {/* Nome do Medicamento */}
        <View style={[styles.tableCell, styles.tableCellExpanded]}>
          <Text style={styles.tableCellTextBold} numberOfLines={1}>
            {item.nome}
          </Text>
          <Text style={[styles.tableCellTextSmall, { color: categoryColor }]} numberOfLines={1}>
            {item.categoria}
          </Text>
        </View>

        {/* Quantidade */}
        <View style={styles.tableCell}>
          <Text style={styles.tableCellText}>{item.quantidade}</Text>
          <Text style={styles.tableCellTextSmall}>{item.unidade}</Text>
        </View>

        {/* Vencimento */}
        <View style={styles.tableCell}>
          <Text style={styles.tableCellText}>
            {new Date(item.dataVencimento).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit'
            })}
          </Text>
          <Text style={styles.tableCellTextSmall}>
            {new Date(item.dataVencimento).getFullYear()}
          </Text>
        </View>

        {/* Status */}
        <View style={styles.tableCell}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        {/* Ações */}
        <View style={styles.tableCell}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const expiredCount = medicamentos.filter(m => isExpired(m.dataVencimento)).length;
  const expiringSoonCount = medicamentos.filter(m => isExpiringSoon(m.dataVencimento) && !isExpired(m.dataVencimento)).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b081ee" />
        <Text style={styles.loadingText}>Carregando farmacinha...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Melhorado */}
      <View style={styles.headerEnhanced}>
        <TouchableOpacity style={styles.backButtonEnhanced} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleEnhanced}>💊 Farmacinha</Text>
          <Text style={styles.headerSubtitle}>Controle inteligente de medicamentos</Text>
        </View>
        <TouchableOpacity style={styles.addButtonEnhanced} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Melhorados */}
      {(expiredCount > 0 || expiringSoonCount > 0) && (
        <Animated.View style={[styles.statsContainerEnhanced, { opacity: fadeAnim }]}>
          {expiredCount > 0 && (
            <View style={[styles.statCardEnhanced, styles.expiredStatCard]}>
              <Ionicons name="warning" size={20} color="#fff" />
              <Text style={styles.statTextEnhanced}>{expiredCount} vencido(s)</Text>
            </View>
          )}
          {expiringSoonCount > 0 && (
            <View style={[styles.statCardEnhanced, styles.expiringSoonStatCard]}>
              <Ionicons name="time" size={20} color="#fff" />
              <Text style={styles.statTextEnhanced}>{expiringSoonCount} vence(m) em breve</Text>
            </View>
          )}
        </Animated.View>
      )}

      {/* Dashboard com Estatísticas */}
      <View style={styles.dashboardContainer}>
        <View style={styles.dashboardCard}>
          <View style={styles.dashboardItem}>
            <View style={styles.dashboardIconContainer}>
              <Ionicons name="medical" size={24} color="#4ECDC4" />
            </View>
            <View style={styles.dashboardInfo}>
              <Text style={styles.dashboardNumber}>{medicamentos.length}</Text>
              <Text style={styles.dashboardLabel}>Total</Text>
            </View>
          </View>

          <View style={styles.dashboardItem}>
            <View style={[styles.dashboardIconContainer, { backgroundColor: '#FFE5E5' }]}>
              <Ionicons name="warning" size={24} color="#FF6B6B" />
            </View>
            <View style={styles.dashboardInfo}>
              <Text style={styles.dashboardNumber}>{expiredCount}</Text>
              <Text style={styles.dashboardLabel}>Vencidos</Text>
            </View>
          </View>

          <View style={styles.dashboardItem}>
            <View style={[styles.dashboardIconContainer, { backgroundColor: '#FFF4E5' }]}>
              <Ionicons name="time" size={24} color="#FFB800" />
            </View>
            <View style={styles.dashboardInfo}>
              <Text style={styles.dashboardNumber}>{expiringSoonCount}</Text>
              <Text style={styles.dashboardLabel}>Vencendo</Text>
            </View>
          </View>

          <View style={styles.dashboardItem}>
            <View style={[styles.dashboardIconContainer, { backgroundColor: '#E8F5E8' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
            <View style={styles.dashboardInfo}>
              <Text style={styles.dashboardNumber}>{medicamentos.length - expiredCount - expiringSoonCount}</Text>
              <Text style={styles.dashboardLabel}>OK</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search Melhorado */}
      <View style={styles.searchContainerEnhanced}>
        <View style={styles.searchBoxEnhanced}>
          <Ionicons name="search" size={20} color="#b081ee" />
          <TextInput
            style={styles.searchInputEnhanced}
            placeholder="🔍 Buscar por nome, categoria ou localização..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearSearchButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabela de Medicamentos */}
      {filteredMedicamentos.length > 0 && (
        <View style={styles.tableContainer}>
          {/* Cabeçalho da Tabela */}
          <View style={styles.tableHeader}>
            <View style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderText}>Tipo</Text>
            </View>
            <View style={[styles.tableHeaderCell, styles.tableHeaderCellExpanded]}>
              <Text style={styles.tableHeaderText}>Medicamento</Text>
            </View>
            <View style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderText}>Qtd</Text>
            </View>
            <View style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderText}>Vence</Text>
            </View>
            <View style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderText}>Status</Text>
            </View>
            <View style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderText}>Ações</Text>
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={filteredMedicamentos}
        renderItem={renderMedicamentoRow}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Animated.View style={[styles.emptyContainerEnhanced, { opacity: fadeAnim }]}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="medical-outline" size={64} color="#b081ee" />
            </View>
            <Text style={styles.emptyTitleEnhanced}>Farmacinha Vazia</Text>
            <Text style={styles.emptyTextEnhanced}>
              {searchText
                ? 'Nenhum medicamento encontrado com a busca aplicada.'
                : 'Adicione medicamentos à sua farmacinha para começar o controle de estoque inteligente.'
              }
            </Text>
            <TouchableOpacity style={styles.emptyActionButton} onPress={openAddModal}>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.emptyActionText}>Adicionar Primeiro Medicamento</Text>
            </TouchableOpacity>
          </Animated.View>
        }
      />

      {/* Modal de Adicionar/Editar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainerEnhanced}>
          {/* Header do Modal */}
          <View style={styles.modalHeaderEnhanced}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>

            <View style={styles.modalTitleContainerEnhanced}>
              <Text style={styles.modalTitleEnhanced}>
                {editingMedicamento ? '✏️ Editar Medicamento' : '➕ Novo Medicamento'}
              </Text>
              <Text style={styles.modalSubtitleEnhanced}>
                {editingMedicamento ? 'Atualize as informações' : 'Adicione um novo medicamento à sua farmacinha'}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.modalContentEnhanced} showsVerticalScrollIndicator={false}>
            {/* Nome do Medicamento */}
            <View style={styles.formSectionEnhanced}>
              <Text style={styles.sectionTitleEnhanced}>💊 Medicamento</Text>
              <View style={styles.formGroupEnhanced}>
                <View style={styles.labelRowEnhanced}>
                  <Text style={styles.labelEnhanced}>Nome do Medicamento *</Text>
                  <TouchableOpacity
                    style={styles.infoButtonEnhanced}
                    onPress={handleMedicationInfo}
                  >
                    <Ionicons name="information-circle" size={20} color="#b081ee" />
                  </TouchableOpacity>
                </View>
                <View style={styles.inputContainerEnhanced}>
                  <Ionicons name="medical-outline" size={20} color="#b081ee" style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputEnhanced}
                    value={nome}
                    onChangeText={handleNomeChange}
                    placeholder="Ex: Dipirona 500mg"
                    placeholderTextColor="#999"
                  />
                </View>

                {stockAlert && (
                  <View style={styles.stockAlertEnhanced}>
                    <Ionicons name="warning" size={20} color="#FFB800" />
                    <Text style={styles.stockAlertTextEnhanced}>{stockAlert}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Categoria */}
            <View style={styles.formSectionEnhanced}>
              <Text style={styles.sectionTitleEnhanced}>🏷️ Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIAS.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryChipEnhanced, categoria === cat && styles.selectedCategoryChipEnhanced]}
                    onPress={() => setCategoria(cat)}
                  >
                    <Text style={[styles.categoryChipTextEnhanced, categoria === cat && styles.selectedCategoryChipTextEnhanced]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Quantidade e Unidade */}
            <View style={styles.formSectionEnhanced}>
              <Text style={styles.sectionTitleEnhanced}>📊 Quantidade</Text>
              <View style={styles.rowContainer}>
                <View style={styles.quantityContainer}>
                  <Text style={styles.labelEnhanced}>Quantidade *</Text>
                  <View style={styles.inputContainerEnhanced}>
                    <Ionicons name="calculator-outline" size={20} color="#b081ee" style={styles.inputIcon} />
                    <TextInput
                      style={styles.inputEnhanced}
                      value={quantidade}
                      onChangeText={setQuantidade}
                      placeholder="0"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.unitContainer}>
                  <Text style={styles.labelEnhanced}>Unidade</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {UNIDADES.map(unit => (
                      <TouchableOpacity
                        key={unit}
                        style={[styles.unitChipEnhanced, unidade === unit && styles.selectedUnitChipEnhanced]}
                        onPress={() => setUnidade(unit)}
                      >
                        <Text style={[styles.unitChipTextEnhanced, unidade === unit && styles.selectedUnitChipTextEnhanced]}>
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* Vencimento e Localização */}
            <View style={styles.formSectionEnhanced}>
              <Text style={styles.sectionTitleEnhanced}>📅 Detalhes</Text>

              <View style={styles.formGroupEnhanced}>
                <Text style={styles.labelEnhanced}>Data de Vencimento *</Text>
                <View style={styles.inputContainerEnhanced}>
                  <Ionicons name="calendar-outline" size={20} color="#b081ee" style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputEnhanced}
                    value={dataVencimento}
                    onChangeText={setDataVencimento}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.formGroupEnhanced}>
                <Text style={styles.labelEnhanced}>Localização *</Text>
                <View style={styles.inputContainerEnhanced}>
                  <Ionicons name="location-outline" size={20} color="#b081ee" style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputEnhanced}
                    value={localizacao}
                    onChangeText={setLocalizacao}
                    placeholder="Ex: Armário do banheiro, Gaveta da cozinha"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            </View>

            {/* Observações */}
            <View style={styles.formSectionEnhanced}>
              <Text style={styles.sectionTitleEnhanced}>📝 Observações</Text>
              <View style={styles.textAreaContainerEnhanced}>
                <Ionicons name="create-outline" size={20} color="#b081ee" style={styles.textAreaIcon} />
                <TextInput
                  style={styles.textAreaEnhanced}
                  value={observacoes}
                  onChangeText={setObservacoes}
                  placeholder="Informações adicionais sobre o medicamento..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Botões de Ação */}
            <View style={styles.actionButtonsContainerEnhanced}>
              <TouchableOpacity
                style={styles.cancelButtonEnhanced}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close-circle-outline" size={20} color="#666" />
                <Text style={styles.cancelButtonTextEnhanced}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButtonEnhanced}
                onPress={handleSave}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveButtonTextEnhanced}>
                  {editingMedicamento ? 'Atualizar' : 'Adicionar'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de Detalhes do Medicamento */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.detailsModalContainer}>
          <View style={styles.detailsModalHeader}>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <Text style={styles.detailsCloseButton}>Fechar</Text>
            </TouchableOpacity>
            <Text style={styles.detailsModalTitle}>📋 Detalhes do Medicamento</Text>
            <TouchableOpacity onPress={() => {
              setShowDetailsModal(false);
              if (selectedMedicamento) {
                openEditModal(selectedMedicamento);
              }
            }}>
              <Text style={styles.editButton}>Editar</Text>
            </TouchableOpacity>
          </View>

          {selectedMedicamento && (
            <ScrollView style={styles.detailsModalContent}>
              {/* Header do Medicamento */}
              <View style={styles.detailsHeader}>
                <View style={[styles.detailsCategoryIcon, { backgroundColor: getCategoryColor(selectedMedicamento.categoria) }]}>
                  <Ionicons name={getCategoryIcon(selectedMedicamento.categoria)} size={32} color="#fff" />
                </View>
                <View style={styles.detailsHeaderInfo}>
                  <Text style={styles.detailsMedicationName}>{selectedMedicamento.nome}</Text>
                  <Text style={[styles.detailsCategory, { color: getCategoryColor(selectedMedicamento.categoria) }]}>
                    {selectedMedicamento.categoria}
                  </Text>
                </View>
              </View>

              {/* Status do Medicamento */}
              <View style={styles.detailsStatusContainer}>
                {(() => {
                  const expired = isExpired(selectedMedicamento.dataVencimento);
                  const expiringSoon = isExpiringSoon(selectedMedicamento.dataVencimento);

                  if (expired) {
                    return (
                      <View style={[styles.detailsStatusBadge, { backgroundColor: '#FF6B6B' }]}>
                        <Ionicons name="warning" size={20} color="#fff" />
                        <Text style={styles.detailsStatusText}>MEDICAMENTO VENCIDO</Text>
                      </View>
                    );
                  } else if (expiringSoon) {
                    return (
                      <View style={[styles.detailsStatusBadge, { backgroundColor: '#FFB800' }]}>
                        <Ionicons name="time" size={20} color="#fff" />
                        <Text style={styles.detailsStatusText}>VENCE EM BREVE</Text>
                      </View>
                    );
                  } else {
                    return (
                      <View style={[styles.detailsStatusBadge, { backgroundColor: '#4CAF50' }]}>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={styles.detailsStatusText}>MEDICAMENTO OK</Text>
                      </View>
                    );
                  }
                })()}
              </View>

              {/* Informações Detalhadas */}
              <View style={styles.detailsInfoContainer}>
                <View style={styles.detailsInfoRow}>
                  <View style={styles.detailsInfoItem}>
                    <Ionicons name="calculator-outline" size={20} color="#b081ee" />
                    <Text style={styles.detailsInfoLabel}>Quantidade</Text>
                    <Text style={styles.detailsInfoValue}>{selectedMedicamento.quantidade} {selectedMedicamento.unidade}</Text>
                  </View>

                  <View style={styles.detailsInfoItem}>
                    <Ionicons name="calendar-outline" size={20} color="#b081ee" />
                    <Text style={styles.detailsInfoLabel}>Vencimento</Text>
                    <Text style={styles.detailsInfoValue}>
                      {new Date(selectedMedicamento.dataVencimento).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsInfoRow}>
                  <View style={styles.detailsInfoItem}>
                    <Ionicons name="location-outline" size={20} color="#b081ee" />
                    <Text style={styles.detailsInfoLabel}>Localização</Text>
                    <Text style={styles.detailsInfoValue}>{selectedMedicamento.localizacao}</Text>
                  </View>

                  <View style={styles.detailsInfoItem}>
                    <Ionicons name="time-outline" size={20} color="#b081ee" />
                    <Text style={styles.detailsInfoLabel}>Adicionado em</Text>
                    <Text style={styles.detailsInfoValue}>
                      {new Date(selectedMedicamento.adicionadoEm).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </View>

                {selectedMedicamento.observacoes && (
                  <View style={styles.detailsObservationsContainer}>
                    <View style={styles.detailsObservationsHeader}>
                      <Ionicons name="create-outline" size={20} color="#b081ee" />
                      <Text style={styles.detailsObservationsTitle}>Observações</Text>
                    </View>
                    <Text style={styles.detailsObservationsText}>{selectedMedicamento.observacoes}</Text>
                  </View>
                )}
              </View>

              {/* Ações Rápidas */}
              <View style={styles.detailsActionsContainer}>
                <TouchableOpacity
                  style={styles.detailsActionButton}
                  onPress={() => {
                    setShowDetailsModal(false);
                    if (selectedMedicamento) {
                      openEditModal(selectedMedicamento);
                    }
                  }}
                >
                  <Ionicons name="create-outline" size={20} color="#b081ee" />
                  <Text style={styles.detailsActionText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.detailsActionButton, styles.detailsDeleteButton]}
                  onPress={() => {
                    setShowDetailsModal(false);
                    if (selectedMedicamento) {
                      handleDelete(selectedMedicamento);
                    }
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                  <Text style={[styles.detailsActionText, styles.detailsDeleteText]}>Remover</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Modal de Informações do Medicamento */}
      <Modal
        visible={showMedicationInfoModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.infoModalContainer}>
          <View style={styles.infoModalHeader}>
            <TouchableOpacity onPress={() => setShowMedicationInfoModal(false)}>
              <Text style={styles.infoCloseButton}>Fechar</Text>
            </TouchableOpacity>
            <Text style={styles.infoModalTitle}>💊 Informações do Medicamento</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.infoModalContent}>
            {loadingMedicationInfo ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#b081ee" />
                <Text style={styles.loadingText}>Buscando informações...</Text>
              </View>
            ) : (
              <View style={styles.medicationInfoContainer}>
                <Text style={styles.medicationInfoText}>{medicationInfo}</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    fontWeight: '500',
  },
  headerEnhanced: {
    backgroundColor: '#b081ee',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButtonEnhanced: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitleEnhanced: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  addButtonEnhanced: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statsContainerEnhanced: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCardEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  expiredStatCard: {
    backgroundColor: '#FF6B6B',
  },
  expiringSoonStatCard: {
    backgroundColor: '#FFD93D',
  },
  statTextEnhanced: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  dashboardContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dashboardCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dashboardItem: {
    alignItems: 'center',
    flex: 1,
  },
  dashboardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5F9F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dashboardInfo: {
    alignItems: 'center',
  },
  dashboardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dashboardLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  searchContainerEnhanced: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBoxEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInputEnhanced: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  clearSearchButton: {
    padding: 4,
  },
  tableContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tableHeaderCellExpanded: {
    flex: 2,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tableCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tableCellExpanded: {
    flex: 2,
    alignItems: 'flex-start',
  },
  tableCellTextBold: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  tableCellText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  tableCellTextSmall: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  categoryIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  actionButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#FFE5E5',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainerEnhanced: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0e6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitleEnhanced: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyTextEnhanced: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#b081ee',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContainerEnhanced: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeaderEnhanced: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  modalTitleContainerEnhanced: {
    alignItems: 'center',
  },
  modalTitleEnhanced: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitleEnhanced: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContentEnhanced: {
    flex: 1,
    padding: 20,
  },
  formSectionEnhanced: {
    marginBottom: 32,
  },
  sectionTitleEnhanced: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  formGroupEnhanced: {
    marginBottom: 20,
  },
  labelRowEnhanced: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelEnhanced: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoButtonEnhanced: {
    padding: 4,
  },
  inputContainerEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputEnhanced: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  stockAlertEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  stockAlertTextEnhanced: {
    flex: 1,
    fontSize: 14,
    color: '#B8860B',
    marginLeft: 12,
    fontWeight: '500',
  },
  categoryChipEnhanced: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCategoryChipEnhanced: {
    backgroundColor: '#b081ee',
    borderColor: '#b081ee',
  },
  categoryChipTextEnhanced: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  selectedCategoryChipTextEnhanced: {
    color: '#fff',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  quantityContainer: {
    flex: 1,
  },
  unitContainer: {
    flex: 2,
  },
  unitChipEnhanced: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  selectedUnitChipEnhanced: {
    backgroundColor: '#b081ee',
    borderColor: '#b081ee',
  },
  unitChipTextEnhanced: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedUnitChipTextEnhanced: {
    color: '#fff',
  },
  textAreaContainerEnhanced: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textAreaIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  textAreaEnhanced: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionButtonsContainerEnhanced: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
  },
  cancelButtonEnhanced: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e9ecef',
    gap: 8,
  },
  cancelButtonTextEnhanced: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButtonEnhanced: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 15,
    backgroundColor: '#b081ee',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonTextEnhanced: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacing: {
    height: 40,
  },
  infoModalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  infoCloseButton: {
    fontSize: 16,
    color: '#b081ee',
    fontWeight: 'bold',
  },
  infoModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 60,
  },
  infoModalContent: {
    flex: 1,
    padding: 20,
  },
  medicationInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  medicationInfoText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  detailsModalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  detailsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  detailsCloseButton: {
    fontSize: 16,
    color: '#b081ee',
    fontWeight: 'bold',
  },
  detailsModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    fontSize: 16,
    color: '#b081ee',
    fontWeight: 'bold',
  },
  detailsModalContent: {
    flex: 1,
    padding: 20,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsCategoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailsHeaderInfo: {
    flex: 1,
  },
  detailsMedicationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  detailsCategory: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsStatusContainer: {
    marginBottom: 20,
  },
  detailsStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  detailsStatusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  detailsInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailsInfoItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  detailsInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  detailsInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  detailsObservationsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  detailsObservationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  detailsObservationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  detailsObservationsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  detailsActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  detailsActionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#b081ee',
    gap: 8,
  },
  detailsDeleteButton: {
    borderColor: '#FF6B6B',
  },
  detailsActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#b081ee',
  },
  detailsDeleteText: {
    color: '#FF6B6B',
  },
}); 