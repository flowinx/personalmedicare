import { FontAwesome } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Document, saveDocument } from '../../db/documents';
import { Member, getAllMembers } from '../../db/members';
import { extractTextFromDocument } from '../../services/documentParser';
import { analyzeDocument as analyzeWithGroq } from '../../services/groq';

export default function DocumentAnalysisScreen() {
  const [document, setDocument] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isMemberModalVisible, setMemberModalVisible] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const allMembers = await getAllMembers();
      setMembers(allMembers);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  };

  const pickDocument = async () => {
    if (!selectedMemberId) {
      alert('Por favor, selecione um membro primeiro');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        setDocument(result);
        analyzeDocument(result);
      }
    } catch (err) {
      console.error('Erro ao selecionar documento:', err);
    }
  };

  const analyzeDocument = async (doc: DocumentPicker.DocumentPickerResult) => {
    if (doc.canceled || !selectedMemberId) return;

    setIsLoading(true);
    try {
      setProcessingStep('Extraindo texto do documento...');
      const extractedText = await extractTextFromDocument(
        doc.assets[0].uri,
        doc.assets[0].mimeType || 'application/octet-stream'
      );
      setProcessingStep('Analisando o documento...');
      const analysisResult = await analyzeWithGroq(extractedText);
      setAnalysis(analysisResult);
      setProcessingStep('Salvando documento...');
      const documentData: Document = {
        member_id: selectedMemberId,
        file_name: doc.assets[0].name,
        file_uri: doc.assets[0].uri,
        file_type: doc.assets[0].mimeType || 'application/octet-stream',
        analysis_text: analysisResult
      };
      await saveDocument(documentData);
      setProcessingStep('');
    } catch (error) {
      console.error('Erro na análise do documento:', error);
      alert(error instanceof Error ? error.message : 'Erro ao processar o documento. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
      setProcessingStep('');
    }
  };

  const handleSelectMember = (id: number) => {
    setSelectedMemberId(id);
    setMemberModalVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Análise de Documentos</ThemedText>
        <ThemedText style={styles.label}>Selecione o Membro:</ThemedText>
        <View style={styles.pickerWrapper}>
          {members.length === 0 ? (
            <ThemedText style={styles.noMembersText}>Nenhum membro cadastrado. Cadastre um membro para usar esta função.</ThemedText>
          ) : (
            <TouchableOpacity style={styles.picker} onPress={() => setMemberModalVisible(true)}>
              <ThemedText lightColor="#2d1155" darkColor="#2d1155">{members.find(m => m.id === selectedMemberId)?.name || 'Selecione...'}</ThemedText>
              <FontAwesome name="chevron-down" size={16} color="#2d1155" />
            </TouchableOpacity>
          )}
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isMemberModalVisible}
          onRequestClose={() => setMemberModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setMemberModalVisible(false)}>
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle} lightColor="#2d1155" darkColor="#2d1155">Selecione o Membro</ThemedText>
              <FlatList
                data={members}
                keyExtractor={item => item.id?.toString() || ''}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => item.id && handleSelectMember(item.id)}
                  >
                    <ThemedText style={styles.modalItemText} lightColor="#2d1155" darkColor="#2d1155">{item.name}</ThemedText>
                    {selectedMemberId === item.id && <FontAwesome name="check" size={16} color="#b081ee" />}
                  </TouchableOpacity>
                )}
              />
            </View>
          </Pressable>
        </Modal>
        <TouchableOpacity
          style={[styles.uploadButton, (!selectedMemberId || members.length === 0) && styles.uploadButtonDisabled]}
          onPress={pickDocument}
          disabled={isLoading || !selectedMemberId || members.length === 0}
        >
          <ThemedText style={styles.buttonText} lightColor="#2d1155" darkColor="#2d1155">
            {document && !document.canceled ? 'Selecionar outro documento' : 'Selecionar documento'}
          </ThemedText>
        </TouchableOpacity>
        {document && !document.canceled && (
          <View style={styles.documentInfo}>
            <ThemedText>Documento selecionado: {document.assets[0].name}</ThemedText>
          </View>
        )}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#b081ee" />
            <ThemedText style={styles.loadingText}>{processingStep || 'Processando...'}</ThemedText>
          </View>
        )}
        {analysis && (
          <View style={styles.analysisContainer}>
            <ThemedText style={styles.analysisTitle}>Resultado da Análise:</ThemedText>
            <ThemedText style={styles.analysisText}>{analysis}</ThemedText>
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginLeft: 4,
  },
  pickerWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  picker: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#b081ee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    marginBottom: 20,
  },
  noMembersText: {
    color: '#b081ee',
    fontSize: 16,
    textAlign: 'center',
    padding: 12,
  },
  uploadButton: {
    backgroundColor: '#b081ee',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  documentInfo: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b081ee',
    backgroundColor: '#f5f5f5',
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2d1155',
  },
  analysisContainer: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    width: '100%',
    marginBottom: 24,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2d1155',
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2d1155',
  },
  closeButton: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compositeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
  },
}); 