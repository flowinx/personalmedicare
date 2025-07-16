import { FontAwesome } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { N8NConfig } from '../../constants/N8NConfig';
import { Member, getAllMembers } from '../../db/members';
import { saveDocument } from '../../db/memoryStorage';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
import { extractTextFromDocument } from '../../services/documentParser';

export default function DocumentAnalysisScreen() {
  const [document, setDocument] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isMemberModalVisible, setMemberModalVisible] = useState(false);

  // Animações de entrada
  const { fadeAnim, slideAnim, startAnimation } = useEntranceAnimation();

  useEffect(() => {
    startAnimation();
    loadMembers();
  }, [startAnimation]);

  const loadMembers = useCallback(async () => {
    try {
      const allMembers = await getAllMembers();
      setMembers(allMembers);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  }, []);

  const pickDocument = useCallback(async () => {
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
        processDocument(result);
      }
    } catch (err) {
      console.error('Erro ao selecionar documento:', err);
    }
  }, [selectedMemberId]);

  async function sendPdfToWebhook(fileUri: string, fileName: string, mimeType: string): Promise<string> {
    const formData = new FormData();
    // @ts-ignore
    formData.append('file', { uri: fileUri, name: fileName, type: mimeType });
    try {
      console.log('[DocumentAnalysis] Enviando PDF para webhook:', N8NConfig.DOCUMENT_ANALYSIS_WEBHOOK);
      const response = await fetch(N8NConfig.DOCUMENT_ANALYSIS_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Erro ao enviar PDF para análise.');
      }
      const data = await response.json();
      return data.text || data.result || 'Nenhum texto extraído.';
    } catch (error) {
      console.error('Erro no webhook:', error);
      throw new Error('Erro ao processar o PDF no servidor.');
    }
  }

  const processDocument = useCallback(async (doc: DocumentPicker.DocumentPickerResult) => {
    if (doc.canceled || !selectedMemberId) return;

    setIsLoading(true);
    try {
      const asset = doc.assets[0];
      if (asset.mimeType === 'application/pdf') {
        setProcessingStep('Enviando PDF para análise, aguarde...');
        const webhookResult = await sendPdfToWebhook(asset.uri, asset.name, asset.mimeType);
        setAnalysis(webhookResult);
        setProcessingStep('Salvando documento...');
        const documentData = {
          member_id: selectedMemberId,
          file_name: asset.name,
          file_uri: asset.uri,
          file_type: asset.mimeType,
          analysis_text: webhookResult,
          created_at: new Date().toISOString()
        };
        await saveDocument(documentData);
        setProcessingStep('');
      } else {
        setProcessingStep('Extraindo texto do documento...');
        const extractedText = await extractTextFromDocument(asset.uri, asset.mimeType || 'application/octet-stream');
        setProcessingStep('Analisando o documento...');
        const analysisResult = await analyzeDocument(extractedText);
        setAnalysis(analysisResult);
        setProcessingStep('Salvando documento...');
        const documentData = {
          member_id: selectedMemberId,
          file_name: asset.name,
          file_uri: asset.uri,
          file_type: asset.mimeType || 'application/octet-stream',
          analysis_text: analysisResult,
          created_at: new Date().toISOString()
        };
        await saveDocument(documentData);
        setProcessingStep('');
      }
    } catch (error) {
      console.error('Erro na análise do documento:', error);
      alert(error instanceof Error ? error.message : 'Erro ao processar o documento. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
      setProcessingStep('');
    }
  }, [selectedMemberId]);

  const handleSelectMember = useCallback((id: number) => {
    setSelectedMemberId(id);
    setMemberModalVisible(false);
  }, []);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card de Seleção de Membro */}
          <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.cardHeader}>
              <FontAwesome name="user" size={20} color="#b081ee" style={styles.cardIcon} />
              <ThemedText style={styles.cardTitle}>Selecionar Membro</ThemedText>
            </View>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <FontAwesome name="users" size={16} color="#b081ee" style={styles.inputIcon} />
                <TouchableOpacity 
                  style={[styles.input, !selectedMemberId && styles.inputPlaceholder]} 
                  onPress={() => setMemberModalVisible(true)}
                  disabled={members.length === 0}
                >
                  <ThemedText style={[styles.inputText, !selectedMemberId && styles.placeholderText]}>
                    {members.find(m => m.id === selectedMemberId)?.name || 'Selecione um membro...'}
                  </ThemedText>
                  <FontAwesome name="chevron-down" size={16} color="#b081ee" />
                </TouchableOpacity>
              </View>
              
              {members.length === 0 && (
                <ThemedText style={styles.noMembersText}>
                  Nenhum membro cadastrado. Cadastre um membro para usar esta função.
                </ThemedText>
              )}
            </View>
          </Animated.View>

          {/* Card de Upload de Documento */}
          <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.cardHeader}>
              <FontAwesome name="file-text-o" size={20} color="#b081ee" style={styles.cardIcon} />
              <ThemedText style={styles.cardTitle}>Documento</ThemedText>
            </View>
            
            <TouchableOpacity
              style={[styles.uploadButton, (!selectedMemberId || members.length === 0) && styles.uploadButtonDisabled]}
              onPress={pickDocument}
              disabled={isLoading || !selectedMemberId || members.length === 0}
              activeOpacity={0.8}
            >
              <FontAwesome name="upload" size={18} color="#fff" style={styles.buttonIcon} />
              <ThemedText style={styles.buttonText}>
                {document && !document.canceled ? 'Selecionar outro documento' : 'Selecionar documento'}
              </ThemedText>
            </TouchableOpacity>
            
            {document && !document.canceled && (
              <View style={styles.documentInfo}>
                <FontAwesome name="file" size={16} color="#b081ee" />
                <ThemedText style={styles.documentName}>
                  {document.assets[0].name}
                </ThemedText>
              </View>
            )}
          </Animated.View>

          {/* Loading */}
          {isLoading && (
            <Animated.View style={[styles.card, styles.loadingCard, { transform: [{ translateY: slideAnim }] }]}>
              <ActivityIndicator size="large" color="#b081ee" />
              <ThemedText style={styles.loadingText}>
                {processingStep || 'Processando...'}
              </ThemedText>
            </Animated.View>
          )}

          {/* Resultado da Análise */}
          {analysis && (
            <Animated.View style={[styles.card, styles.analysisCard, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.cardHeader}>
                <FontAwesome name="search" size={20} color="#b081ee" style={styles.cardIcon} />
                <ThemedText style={styles.cardTitle}>Resultado da Análise</ThemedText>
              </View>
              <ThemedText style={styles.analysisText}>{analysis}</ThemedText>
            </Animated.View>
          )}
        </ScrollView>

        {/* Modal de Seleção de Membro */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isMemberModalVisible}
          onRequestClose={() => setMemberModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setMemberModalVisible(false)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <FontAwesome name="users" size={20} color="#b081ee" />
                <ThemedText style={styles.modalTitle}>Selecione o Membro</ThemedText>
              </View>
              <FlatList
                data={members}
                keyExtractor={item => item.id?.toString() || ''}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => item.id && handleSelectMember(item.id)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.modalItemText}>{item.name}</ThemedText>
                    {selectedMemberId === item.id && <FontAwesome name="check" size={16} color="#b081ee" />}
                  </TouchableOpacity>
                )}
              />
            </View>
          </Pressable>
        </Modal>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d1155',
  },
  inputContainer: {
    width: '100%',
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 48,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
  },
  inputPlaceholder: {
    borderColor: '#b081ee',
  },
  inputText: {
    fontSize: 16,
    color: '#2d1155',
    flex: 1,
  },
  placeholderText: {
    color: '#6c757d',
  },
  noMembersText: {
    color: '#b081ee',
    fontSize: 14,
    textAlign: 'center',
    padding: 12,
    fontStyle: 'italic',
  },
  uploadButton: {
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadButtonDisabled: {
    backgroundColor: '#dee2e6',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  documentInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2d1155',
    flex: 1,
  },
  loadingCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2d1155',
    textAlign: 'center',
  },
  analysisCard: {
    marginBottom: 24,
  },
  analysisText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2d1155',
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
    padding: 24,
    maxHeight: '60%',
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d1155',
    marginLeft: 12,
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: '#2d1155',
  },
}); 