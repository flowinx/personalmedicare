import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MedicamentoLocal, MedicationCompleteInfo } from '../types';

const { width, height } = Dimensions.get('window');

interface AddEditModalProps {
  visible: boolean;
  editingMedicamento: MedicamentoLocal | null;
  onClose: () => void;
  onSave: (data: any) => void;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  getMedicationCompleteInfo: (name: string) => Promise<MedicationCompleteInfo>;
  extractActiveIngredient: (name: string) => Promise<string>;
}

export default function AddEditModal({
  visible,
  editingMedicamento,
  onClose,
  onSave,
  fadeAnim,
  slideAnim,
  getMedicationCompleteInfo,
  extractActiveIngredient,
}: AddEditModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Estados do formulário
  const [nomeEDosagem, setNomeEDosagem] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [principioAtivo, setPrincipioAtivo] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');

  // Estados para IA
  const [aiLoading, setAiLoading] = useState(false);
  const [medicationInfo, setMedicationInfo] = useState<MedicationCompleteInfo | null>(null);
  const [showMedicationDetails, setShowMedicationDetails] = useState(false);
  const [aiSearchTriggered, setAiSearchTriggered] = useState(false);

  React.useEffect(() => {
    if (visible) {
      if (editingMedicamento) {
        setNomeEDosagem(editingMedicamento.nome);
        setQuantidade(editingMedicamento.quantidade);
        setPrincipioAtivo(editingMedicamento.principioAtivo || '');
        setLocalizacao(editingMedicamento.localizacao);
        setDataVencimento(editingMedicamento.dataVencimento);
        setMedicationInfo(null);
        setShowMedicationDetails(false);
        setAiSearchTriggered(false);
      } else {
        clearForm();
      }
    }
  }, [visible, editingMedicamento]);

  const clearForm = () => {
    setNomeEDosagem('');
    setQuantidade('');
    setPrincipioAtivo('');
    setLocalizacao('');
    setMedicationInfo(null);
    setShowMedicationDetails(false);
    setAiSearchTriggered(false);
    setDataVencimento('');
    scaleAnim.setValue(0);
  };

  const fetchMedicationInfo = async (medicationName: string) => {
    if (!medicationName.trim()) return;

    setAiLoading(true);
    setAiSearchTriggered(true);
    try {
      const info = await getMedicationCompleteInfo(medicationName);
      setMedicationInfo(info);
      setShowMedicationDetails(true);

      try {
        const principioAtivoExtraido = await extractActiveIngredient(medicationName);
        if (principioAtivoExtraido) {
          setPrincipioAtivo(principioAtivoExtraido);
        }
      } catch (error) {
        console.log('Fallback: usando extração local para princípio ativo');
      }

      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Erro ao buscar informações do medicamento:', error);
      Alert.alert('Aviso', 'Não foi possível buscar informações detalhadas do medicamento.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!nomeEDosagem.trim() || !quantidade.trim() || !dataVencimento.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!medicationInfo && !editingMedicamento) {
      Alert.alert('Erro', 'Busque as informações do medicamento primeiro.');
      return;
    }

    const medicamentoData = {
      nome: nomeEDosagem.trim(),
      categoria: medicationInfo?.categoria || editingMedicamento?.categoria || 'Outros',
      quantidade: quantidade.trim(),
      unidade: medicationInfo?.unidade || editingMedicamento?.unidade || 'unidades',
      dataVencimento: dataVencimento.trim(),
      localizacao: localizacao.trim() || 'Não especificado',
      principioAtivo: principioAtivo.trim() || undefined,
      observacoes: medicationInfo ?
        `${medicationInfo.descricao}\n\nIndicações: ${medicationInfo.indicacoes}\n\nContraindicações: ${medicationInfo.contraindicacoes}\n\nPosologia: ${medicationInfo.posologia}\n\nCuidados: ${medicationInfo.cuidados}` :
        editingMedicamento?.observacoes || '',
      adicionadoEm: editingMedicamento ? editingMedicamento.adicionadoEm : new Date().toISOString()
    };

    onSave(medicamentoData);
  };

  const formatDateInput = (text: string) => {
    let formatted = text.replace(/\D/g, '');
    if (formatted.length >= 2) {
      formatted = formatted.substring(0, 2) + '/' + formatted.substring(2);
    }
    if (formatted.length >= 5) {
      formatted = formatted.substring(0, 5) + '/' + formatted.substring(5, 9);
    }
    return formatted;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BlurView intensity={30} style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <View style={styles.modalTitleSection}>
                <View style={styles.modalIconContainer}>
                  <Ionicons
                    name={editingMedicamento ? "create" : "add-circle"}
                    size={24}
                    color="#fff"
                  />
                </View>
                <View>
                  <Text style={styles.modalTitle}>
                    {editingMedicamento ? 'Editar Medicamento' : 'Novo Medicamento'}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {editingMedicamento ? 'Atualize as informações' : 'Adicione à sua farmacinha'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Seção 1: Identificação do Medicamento */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="medical" size={20} color="#667eea" />
                </View>
                <Text style={styles.sectionTitle}>Identificação</Text>
              </View>

              {/* Campo Nome e Dosagem */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome e Dosagem *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="medical-outline" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, aiLoading && styles.textInputLoading]}
                    placeholder="Ex: Dipirona 500mg"
                    value={nomeEDosagem}
                    onChangeText={setNomeEDosagem}
                    onBlur={() => {
                      if (!editingMedicamento && nomeEDosagem.trim() && !aiSearchTriggered) {
                        fetchMedicationInfo(nomeEDosagem);
                      }
                    }}
                    placeholderTextColor="#94a3b8"
                    editable={!aiLoading}
                  />
                  {aiLoading && (
                    <View style={styles.loadingIndicator}>
                      <ActivityIndicator size="small" color="#667eea" />
                    </View>
                  )}
                  {!editingMedicamento && !aiLoading && nomeEDosagem.trim() && !showMedicationDetails && (
                    <TouchableOpacity
                      style={styles.manualSearchButton}
                      onPress={() => fetchMedicationInfo(nomeEDosagem)}
                    >
                      <Ionicons name="search" size={16} color="#667eea" />
                    </TouchableOpacity>
                  )}
                </View>
                {!editingMedicamento && (
                  <Text style={styles.inputHint}>
                    {aiLoading
                      ? '🔍 Buscando informações do medicamento...'
                      : showMedicationDetails
                        ? '✅ Informações encontradas! Continue preenchendo os campos.'
                        : '💡 Digite o nome completo e saia do campo para buscar informações automaticamente'
                    }
                  </Text>
                )}
              </View>

              {/* Informações da IA */}
              {showMedicationDetails && medicationInfo && (
                <Animated.View
                  style={[styles.aiInfoContainer, { transform: [{ scale: scaleAnim }] }]}
                >
                  <View style={styles.aiHeader}>
                    <Ionicons name="sparkles" size={20} color="#667eea" />
                    <Text style={styles.aiTitle}>Informações encontradas pela IA</Text>
                  </View>

                  <View style={styles.aiInfoGrid}>
                    <View style={styles.aiInfoItem}>
                      <View style={styles.aiInfoIconContainer}>
                        <Ionicons name="library" size={16} color="#667eea" />
                      </View>
                      <View>
                        <Text style={styles.aiInfoLabel}>Categoria</Text>
                        <Text style={styles.aiInfoValue}>{medicationInfo.categoria}</Text>
                      </View>
                    </View>
                    <View style={styles.aiInfoItem}>
                      <View style={styles.aiInfoIconContainer}>
                        <Ionicons name="cube" size={16} color="#667eea" />
                      </View>
                      <View>
                        <Text style={styles.aiInfoLabel}>Unidade</Text>
                        <Text style={styles.aiInfoValue}>{medicationInfo.unidade}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.aiDescription}>
                    <Text style={styles.aiDescriptionTitle}>📋 Descrição</Text>
                    <Text style={styles.aiDescriptionText}>{medicationInfo.descricao}</Text>
                  </View>
                </Animated.View>
              )}

              {/* Campo Princípio Ativo */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Princípio Ativo</Text>
                  {!editingMedicamento && nomeEDosagem.trim() && (
                    <TouchableOpacity
                      style={styles.extractButton}
                      onPress={async () => {
                        if (!nomeEDosagem.trim()) return;
                        setAiLoading(true);
                        try {
                          const principioAtivoExtraido = await extractActiveIngredient(nomeEDosagem);
                          if (principioAtivoExtraido) {
                            setPrincipioAtivo(principioAtivoExtraido);
                            Alert.alert('✨ Sucesso!', `Princípio ativo encontrado: ${principioAtivoExtraido}`);
                          }
                        } catch (error) {
                          Alert.alert('Aviso', 'Não foi possível extrair o princípio ativo automaticamente.');
                        } finally {
                          setAiLoading(false);
                        }
                      }}
                      disabled={aiLoading}
                    >
                      {aiLoading ? (
                        <ActivityIndicator size="small" color="#667eea" />
                      ) : (
                        <>
                          <Ionicons name="flask" size={14} color="#667eea" />
                          <Text style={styles.extractButtonText}>Extrair</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.inputContainer}>
                  <Ionicons name="flask-outline" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={[
                      styles.textInput,
                      principioAtivo && showMedicationDetails && styles.textInputFilled
                    ]}
                    placeholder="Ex: Paracetamol"
                    value={principioAtivo}
                    onChangeText={setPrincipioAtivo}
                    placeholderTextColor="#94a3b8"
                  />
                  {principioAtivo && showMedicationDetails && (
                    <View style={styles.autoFilledIndicator}>
                      <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Seção 2: Quantidade e Estoque */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="cube" size={20} color="#667eea" />
                </View>
                <Text style={styles.sectionTitle}>Estoque</Text>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.inputLabel}>Quantidade *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="calculator-outline" size={20} color="#667eea" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ex: 20"
                      value={quantidade}
                      onChangeText={setQuantidade}
                      keyboardType="numeric"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                </View>

                <View style={styles.inputGroupHalf}>
                  <Text style={styles.inputLabel}>Unidade</Text>
                  <View style={styles.unitDisplayContainer}>
                    <Text style={styles.unitDisplayText}>
                      {medicationInfo?.unidade || 'unidades'}
                    </Text>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  </View>
                </View>
              </View>
            </View>

            {/* Seção 3: Validade e Localização */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="calendar" size={20} color="#667eea" />
                </View>
                <Text style={styles.sectionTitle}>Validade & Localização</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Data de Vencimento *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="DD/MM/AAAA"
                    value={dataVencimento}
                    onChangeText={(text) => setDataVencimento(formatDateInput(text))}
                    keyboardType="numeric"
                    maxLength={10}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Localização</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: Gaveta da cozinha (opcional)"
                    value={localizacao}
                    onChangeText={setLocalizacao}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>
            </View>

            {/* Botões de Ação */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Ionicons name="close-circle-outline" size={20} color="#8E8E93" />
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!nomeEDosagem.trim() || !quantidade.trim() || !dataVencimento.trim() || (!medicationInfo && !editingMedicamento)) && styles.saveButtonDisabled
                ]}
                onPress={handleSave}
                disabled={!nomeEDosagem.trim() || !quantidade.trim() || !dataVencimento.trim() || (!medicationInfo && !editingMedicamento)}
              >
                <Ionicons
                  name={editingMedicamento ? "checkmark-circle" : "add-circle"}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.saveButtonText}>
                  {editingMedicamento ? 'Atualizar' : 'Adicionar'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width * 0.95,
    height: height * 0.85,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },
  modalHeader: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    height: 48,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingRight: 40,
  },
  textInputLoading: {
    backgroundColor: '#f8f9ff',
    borderColor: '#e8eaff',
  },
  textInputFilled: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroupHalf: {
    flex: 1,
  },
  unitDisplayContainer: {
    height: 48,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0fdf4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unitDisplayText: {
    fontSize: 16,
    color: '#16a34a',
    fontWeight: '500',
  },
  inputHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    fontStyle: 'italic',
  },
  loadingIndicator: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  manualSearchButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#f8f9ff',
  },
  aiInfoContainer: {
    backgroundColor: '#f8f9ff',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e8eaff',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  aiInfoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  aiInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  aiInfoIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f8f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiInfoLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiInfoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    marginTop: 2,
  },
  aiDescription: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  aiDescriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  aiDescriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  extractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8eaff',
    gap: 4,
  },
  extractButtonText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  autoFilledIndicator: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#667eea',
    gap: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacing: {
    height: 20,
  },
});