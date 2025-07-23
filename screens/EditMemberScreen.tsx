import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Modal, FlatList } from 'react-native';
import { getMemberById, updateMember, Member } from '../services/firebase';
import { useEntranceAnimation } from '../utils/animations';

interface EditMemberScreenProps {
  navigation: any;
  route: {
    params: {
      memberId: string;
    };
  };
}

export default function EditMemberScreen({ navigation, route }: EditMemberScreenProps) {
  const [member, setMember] = useState<Member | null>(null);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [dob, setDob] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBloodTypeModal, setShowBloodTypeModal] = useState(false);
  const { startAnimation } = useEntranceAnimation();

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    startAnimation();
    loadMember();
  }, [startAnimation]);

  const loadMember = async () => {
    try {
      const memberData = await getMemberById(route.params.memberId);
      if (memberData) {
        setMember(memberData);
        setName(memberData.name);
        setRelation(memberData.relation);
        setDob(memberData.dob || '');
        setBloodType(memberData.bloodType || '');
        setNotes(memberData.notes || '');
        setAvatarUri(memberData.avatar_uri || null);
        setEmergencyPhone(memberData.emergencyPhone || '');
        setHeight(memberData.height || '');
        setWeight(memberData.weight || '');
        setMedicalConditions(memberData.medicalConditions || '');
      } else {
        Alert.alert('Erro', 'Membro não encontrado');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar dados do membro');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar a data automaticamente
  const formatDate = useCallback((text: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = text.replace(/\D/g, '');
    
    // Aplica a máscara DD/MM/AAAA
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
    } else {
      // Limita a 8 dígitos (DD/MM/AAAA)
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  }, []);

  const handleDateChange = useCallback((text: string) => {
    const formatted = formatDate(text);
    setDob(formatted);
  }, [formatDate]);

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim() || !relation.trim()) {
      Alert.alert('Erro', 'Nome e parentesco são obrigatórios');
      return;
    }

    if (!member) return;

    setSaving(true);
    try {
      const memberData = {
        name: name.trim(),
        relation: relation.trim(),
        dob: dob.trim(),
        bloodType: bloodType.trim() || undefined,
        notes: notes.trim(),
        avatar_uri: avatarUri || undefined,
        emergencyPhone: emergencyPhone.trim() || undefined,
        height: height.trim() || undefined,
        weight: weight.trim() || undefined,
        medicalConditions: medicalConditions.trim() || undefined,
      };
      await updateMember(member.id, memberData);

      Alert.alert(
        'Sucesso',
        'Membro atualizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao atualizar dados: ' + error.message);
    } finally {
      setSaving(false);
    }
  }, [name, relation, dob, bloodType, notes, avatarUri, emergencyPhone, height, weight, medicalConditions, member, navigation]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleBloodTypeSelect = useCallback((type: string) => {
    setBloodType(type);
    setShowBloodTypeModal(false);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b081ee" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!member) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Membro não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Compacto */}
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.compactAvatarButton} onPress={pickImage}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.compactAvatar} />
            ) : (
              <View style={styles.compactAvatarPlaceholder}>
                <FontAwesome name="user" size={24} color="#b081ee" />
              </View>
            )}
            <View style={styles.compactAvatarOverlay}>
              <FontAwesome name="camera" size={10} color="white" />
            </View>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Editar Membro</Text>
            <Text style={styles.headerSubtitle}>Atualize as informações do membro da família</Text>
          </View>
        </View>

        {/* Formulário Compacto */}
        <View style={styles.compactForm}>
          {/* Linha 1: Nome e Parentesco */}
          <View style={styles.formRow}>
            <View style={styles.halfInput}>
              <Text style={styles.compactLabel}>Nome *</Text>
              <View style={styles.compactInputWrapper}>
                <FontAwesome name="user" size={16} color="#8A8A8A" style={styles.compactInputIcon} />
                <TextInput
                  style={styles.compactInput}
                  placeholder="Nome completo"
                  placeholderTextColor="#8A8A8A"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.compactLabel}>Parentesco *</Text>
              <View style={styles.compactInputWrapper}>
                <FontAwesome name="heart" size={16} color="#8A8A8A" style={styles.compactInputIcon} />
                <TextInput
                  style={styles.compactInput}
                  placeholder="Ex: Pai, Mãe..."
                  placeholderTextColor="#8A8A8A"
                  value={relation}
                  onChangeText={setRelation}
                />
              </View>
            </View>
          </View>

          {/* Linha 2: Data de Nascimento e Tipo Sanguíneo */}
          <View style={styles.formRow}>
            <View style={styles.halfInput}>
              <Text style={styles.compactLabel}>Data Nascimento</Text>
              <View style={styles.compactInputWrapper}>
                <FontAwesome name="calendar" size={16} color="#8A8A8A" style={styles.compactInputIcon} />
                <TextInput
                  style={styles.compactInput}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#8A8A8A"
                  value={dob}
                  onChangeText={handleDateChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.compactLabel}>Tipo Sanguíneo</Text>
              <TouchableOpacity 
                style={styles.compactInputWrapper} 
                onPress={() => setShowBloodTypeModal(true)}
              >
                <FontAwesome name="tint" size={16} color="#8A8A8A" style={styles.compactInputIcon} />
                <Text style={[styles.compactInput, { color: bloodType ? '#333' : '#8A8A8A' }]}>
                  {bloodType || 'Selecionar'}
                </Text>
                <FontAwesome name="chevron-down" size={12} color="#8A8A8A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Linha 3: Telefone de Emergência */}
          <View style={styles.fullWidthInput}>
            <Text style={styles.compactLabel}>Telefone de Emergência</Text>
            <View style={styles.compactInputWrapper}>
              <FontAwesome name="phone" size={16} color="#8A8A8A" style={styles.compactInputIcon} />
              <TextInput
                style={styles.compactInput}
                placeholder="(11) 99999-9999"
                placeholderTextColor="#8A8A8A"
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Linha 4: Altura e Peso */}
          <View style={styles.formRow}>
            <View style={styles.measurementInputContainer}>
              <Text style={styles.compactLabel}>Altura</Text>
              <View style={styles.measurementInputWrapper}>
                <FontAwesome name="arrows-v" size={16} color="#8A8A8A" style={styles.compactInputIcon} />
                <TextInput
                  style={styles.measurementInput}
                  placeholder="170"
                  placeholderTextColor="#8A8A8A"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />
                <Text style={styles.unitTextInline}>cm</Text>
              </View>
            </View>
            <View style={styles.measurementInputContainer}>
              <Text style={styles.compactLabel}>Peso</Text>
              <View style={styles.measurementInputWrapper}>
                <FontAwesome name="balance-scale" size={16} color="#8A8A8A" style={styles.compactInputIcon} />
                <TextInput
                  style={styles.measurementInput}
                  placeholder="70"
                  placeholderTextColor="#8A8A8A"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
                <Text style={styles.unitTextInline}>kg</Text>
              </View>
            </View>
          </View>

          {/* Linha 5: Condições Médicas */}
          <View style={styles.fullWidthInput}>
            <Text style={styles.compactLabel}>Condições Médicas</Text>
            <View style={styles.compactTextAreaWrapper}>
              <FontAwesome name="heartbeat" size={16} color="#8A8A8A" style={styles.compactTextAreaIcon} />
              <TextInput
                style={styles.compactTextArea}
                placeholder="Diabetes, hipertensão, alergias, etc."
                placeholderTextColor="#8A8A8A"
                value={medicalConditions}
                onChangeText={setMedicalConditions}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Linha 6: Observações */}
          <View style={styles.fullWidthInput}>
            <Text style={styles.compactLabel}>Observações</Text>
            <View style={styles.compactTextAreaWrapper}>
              <FontAwesome name="sticky-note" size={16} color="#8A8A8A" style={styles.compactTextAreaIcon} />
              <TextInput
                style={styles.compactTextArea}
                placeholder="Informações adicionais, observações gerais, etc."
                placeholderTextColor="#8A8A8A"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Seleção de Tipo Sanguíneo */}
      <Modal
        visible={showBloodTypeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBloodTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Tipo Sanguíneo</Text>
              <TouchableOpacity 
                onPress={() => setShowBloodTypeModal(false)}
                style={styles.modalCloseButton}
              >
                <FontAwesome name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={bloodTypes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.bloodTypeOption,
                    bloodType === item && styles.bloodTypeOptionSelected
                  ]}
                  onPress={() => handleBloodTypeSelect(item)}
                >
                  <FontAwesome 
                    name="tint" 
                    size={18} 
                    color={bloodType === item ? '#b081ee' : '#8A8A8A'} 
                    style={styles.bloodTypeIcon}
                  />
                  <Text style={[
                    styles.bloodTypeText,
                    bloodType === item && styles.bloodTypeTextSelected
                  ]}>
                    {item}
                  </Text>
                  {bloodType === item && (
                    <FontAwesome name="check" size={16} color="#b081ee" />
                  )}
                </TouchableOpacity>
              )}
            />
            
            <TouchableOpacity
              style={styles.clearSelectionButton}
              onPress={() => handleBloodTypeSelect('')}
            >
              <Text style={styles.clearSelectionText}>Limpar Seleção</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  errorText: {
    fontSize: 18,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  compactAvatarButton: {
    position: 'relative',
    marginRight: 16,
  },
  compactAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#b081ee',
  },
  compactAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0eaff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#b081ee',
    borderStyle: 'dashed',
  },
  compactAvatarOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#b081ee',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  compactForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    flex: 0.48,
  },
  fullWidthInput: {
    marginBottom: 16,
  },
  compactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  compactInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  compactInputIcon: {
    marginRight: 8,
  },
  compactInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 0,
  },
  compactTextAreaWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'flex-start',
  },
  compactTextAreaIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  compactTextArea: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 0,
    minHeight: 40,
  },
  inputContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 8,
  },
  textAreaIcon: {
    marginRight: 12,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#b081ee',
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  cancelButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#b081ee',
  },
  saveButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  bloodTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  bloodTypeOptionSelected: {
    backgroundColor: '#f0eaff',
  },
  bloodTypeIcon: {
    marginRight: 12,
  },
  bloodTypeText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  bloodTypeTextSelected: {
    color: '#b081ee',
    fontWeight: '600',
  },
  clearSelectionButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    alignItems: 'center',
  },
  clearSelectionText: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: '500',
  },
  quarterInputContainer: {
    flex: 0.82,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quarterInput: {
    flex: 0.47,
  },
  unitText: {
    fontSize: 14,
    color: '#8A8A8A',
    marginLeft: 4,
  },
  measurementInputContainer: {
    flex: 0.48,
    marginHorizontal: 4,
  },
  measurementInputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
  },
  measurementInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
    marginLeft: 8,
  },
  unitTextInline: {
    fontSize: 14,
    color: '#8A8A8A',
    fontWeight: '500',
    marginLeft: 8,
    minWidth: 25,
  },
});