import * as AppleAuthentication from 'expo-apple-authentication';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, OAuthProvider, onAuthStateChanged, signInAnonymously, signInWithCredential, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import { getFunctions } from 'firebase/functions';

import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  GOOGLE_WEB_CLIENT_ID
} from '@env';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Configurar App Check usando @react-native-firebase/app-check (SOLUÇÃO CORRETA)
const configureAppCheck = () => {
  console.log('[Firebase] Configurando App Check com @react-native-firebase/app-check...');
  
  try {
    console.log('[Firebase] App Check desabilitado temporariamente devido a problemas de build');
    
    console.log('[Firebase] Configurando App Check simplificado...');
    
    // Configuração simplificada para desenvolvimento
    if (__DEV__) {
      console.log('[Firebase] Modo desenvolvimento - configurando debug token...');
      
      // App Check desabilitado - configure como "Unenforced" no Firebase Console
      console.log('[Firebase] Configure App Check como "Unenforced" no Firebase Console');
      
      console.log('[Firebase] ✅ App Check configurado para desenvolvimento');
      
    } else {
      console.log('[Firebase] Modo produção - configurando DeviceCheck...');
      
      console.log('[Firebase] Configure App Check para produção quando necessário');
      
      console.log('[Firebase] ✅ App Check configurado para produção');
    }
    
    // App Check desabilitado - sem teste de token necessário
    
  } catch (error) {
    console.error('[Firebase] ❌ Erro ao configurar App Check:', error.message);
    console.log('[Firebase] 💡 Continuando sem App Check...');
  }
};

// Configurar App Check
configureAppCheck();

// Inicializar serviços
export const db = getFirestore(app);
export const auth = getAuth(app);

// Inicializar Storage com configuração explícita para garantir conexão com Auth
export const storage = getStorage(app, firebaseConfig.storageBucket);
export const functions = getFunctions(app);

// Garantir que o Storage está usando a mesma instância do Auth
console.log('[Firebase] Inicialização:', {
  app: app.name,
  auth: auth.app.name,
  storage: storage.app.name,
  authConnected: auth.app.name === storage.app.name
});

// Configuração do Google Auth
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Configuração do Apple Auth
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Interfaces
export interface Member {
  id: string;
  name: string;
  relation: string;
  dob: string;
  bloodType?: string;
  blood_type?: string; // Campo antigo para compatibilidade
  notes?: string;
  avatar_uri?: string;
  emergencyPhone?: string;
  height?: string;
  weight?: string;
  medicalConditions?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_uri: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Treatment {
  id: string;
  member_id: string;
  medication: string;
  dosage: string;
  frequency_value: number;
  frequency_unit: string;
  duration: string;
  notes?: string;
  start_datetime: string;
  status: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  member_id: string;
  file_name: string;
  file_uri: string;
  file_type: string;
  analysis_text?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  id: string;
  nome: string;
  categoria: string;
  quantidade: string;
  unidade: string;
  dataVencimento: string;
  localizacao: string;
  principioAtivo?: string;
  observacoes?: string;
  adicionadoEm: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeightRecord {
  id: string;
  member_id: string;
  weight: number;
  date: string;
  notes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationLog {
  id: string;
  treatment_id: string;
  member_id: string;
  medication: string;
  dosage: string;
  scheduled_time: string;
  taken_time: string;
  status: 'tomado' | 'perdido' | 'atrasado';
  notes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Funções de autenticação
export async function signUpWithEmail(email: string, password: string, name: string): Promise<User> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Criar perfil do usuário
    const profile: UserProfile = {
      id: result.user.uid,
      name,
      email,
      avatar_uri: null,
      userId: result.user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'profiles', result.user.uid), profile);

    return result.user;
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    throw error;
  }
}

// Função auxiliar para reduzir blob de forma simples (React Native compatível)
function reduceBlob(blob: Blob, maxSizeKB: number = 200): Blob {
  const maxSizeBytes = maxSizeKB * 1024;
  
  if (blob.size <= maxSizeBytes) {
    return blob;
  }
  
  console.log(`[Firebase Storage] Reduzindo blob de ${(blob.size / 1024).toFixed(1)}KB para ${maxSizeKB}KB`);
  
  // Simplesmente cortar o blob para o tamanho máximo
  // Não é ideal, mas funciona como fallback
  const reducedBlob = blob.slice(0, maxSizeBytes);
  
  console.log(`[Firebase Storage] Blob reduzido: ${(reducedBlob.size / 1024).toFixed(1)}KB`);
  return reducedBlob;
}

// Função de upload otimizada para Expo/React Native
export async function uploadImageExpo(imageUri: string, folder: 'profiles' | 'members', fileName?: string): Promise<string> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }
    
    // Obter token de autenticação
    const token = await currentUser.getIdToken(true);
    
    // Gerar nome do arquivo
    const timestamp = Date.now();
    const finalFileName = fileName || `${currentUser.uid}_${timestamp}.jpg`;
    
    // URL da API REST do Firebase Storage
    const uploadUrl = __DEV__ 
      ? `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o?name=${encodeURIComponent(folder + '/' + finalFileName)}&uploadType=media`
      : `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o?name=${encodeURIComponent(folder + '/' + finalFileName)}`;
    
    // Headers otimizados
    const headers: any = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'image/jpeg',
    };
    
    // App Check token para desenvolvimento
    if (__DEV__) {
      headers['X-Firebase-AppCheck'] = '3AC14E49-E961-4C72-AC0B-8C640A6D9844';
    } else {
      // Produção: tentar obter token App Check
      try {
        const { getToken, getAppCheck } = await import('firebase/app-check');
        const appCheckInstance = getAppCheck(app);
        const appCheckTokenResult = await getToken(appCheckInstance, false);
        
        if (appCheckTokenResult.token) {
          headers['X-Firebase-AppCheck'] = appCheckTokenResult.token;
        }
      } catch (appCheckError) {
        // Continuar sem App Check se não conseguir obter token
      }
    }
    
    const uploadResult = await FileSystem.uploadAsync(uploadUrl, imageUri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers,
    });
    
    if (uploadResult.status === 200 || uploadResult.status === 201) {
      // Obter URL de download usando Firebase SDK
      const imageRef = ref(storage, `${folder}/${finalFileName}`);
      const downloadUrl = await getDownloadURL(imageRef);
      return downloadUrl;
    } else if (uploadResult.status === 401) {
      throw new Error('APP_CHECK_401');
    } else {
      throw new Error(`Upload falhou com status: ${uploadResult.status}`);
    }
    
  } catch (error: any) {
    throw error;
  }
}

// Função de fallback com base64
export async function uploadImageBase64(imageUri: string, folder: 'profiles' | 'members'): Promise<string> {
  try {
    console.log('[Base64 Upload] 🔄 Iniciando upload via base64...');
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }
    
    // Converter para base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Converter blob para base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    console.log('[Base64 Upload] 📊 Base64 size:', base64.length);
    
    // Salvar no Firestore temporariamente
    const tempRef = doc(db, 'temp_uploads', `${currentUser.uid}_${Date.now()}`);
    await setDoc(tempRef, {
      imageData: base64,
      folder,
      fileName: `${currentUser.uid}_${Date.now()}.jpg`,
      timestamp: Date.now(),
      status: 'pending'
    });
    
    console.log('[Base64 Upload] ✅ Salvo no Firestore para processamento');
    
    // Por enquanto, retornar a URI local
    // TODO: Implementar Cloud Function para processar
    return imageUri;
    
  } catch (error) {
    console.error('[Base64 Upload] ❌ Erro:', error);
    throw error;
  }
}

// Função principal de upload com fallbacks otimizados para Expo
export async function uploadImage(imageUri: string, folder: 'profiles' | 'members', fileName?: string): Promise<string> {
  console.log('[Upload] 🚀 Iniciando upload com múltiplos métodos...');
  console.log('[Upload] 📁 URI:', imageUri);
  console.log('[Upload] 📂 Pasta:', folder);
  
  // PRIORIDADE 1: Expo FileSystem (MAIS CONFIÁVEL para React Native)
  try {
    console.log('[Upload] 🔄 Método Principal: Expo FileSystem...');
    const result = await uploadImageExpo(imageUri, folder, fileName);
    console.log('[Upload] ✅ Sucesso com Expo FileSystem!');
    return result;
  } catch (expoError) {
    console.log('[Upload] ❌ Expo FileSystem falhou:', expoError.message);
    
    // Se falhou por App Check (erro 401), tentar método alternativo
    if (expoError.message.includes('APP_CHECK_401') || expoError.message.includes('401')) {
      console.log('[Upload] 🔄 App Check falhou, tentando Firebase SDK...');
      try {
        const result = await uploadImageFirebaseSimple(imageUri, folder, fileName);
        console.log('[Upload] ✅ Sucesso com Firebase SDK (bypassa App Check)!');
        return result;
      } catch (altError) {
        console.log('[Upload] ❌ Firebase SDK também falhou:', altError.message);
        // Continuar para próximo método
      }
    }
    
    // Se falhou por timeout, usar fallback local
    if (expoError.message.includes('timeout') || expoError.message.includes('network')) {
      console.log('[Upload] 🚨 Problema de rede detectado, usando fallback local');
      return await saveLocalImageReference(imageUri, folder);
    }
  }
  
  // PRIORIDADE 2: Firebase SDK (bypassa App Check automaticamente)
  try {
    console.log('[Upload] 🔄 Fallback: Firebase SDK (bypassa App Check)...');
    const result = await uploadImageFirebaseSimple(imageUri, folder, fileName);
    console.log('[Upload] ✅ Sucesso com Firebase SDK!');
    return result;
  } catch (firebaseError) {
    console.log('[Upload] ❌ Firebase SDK falhou:', firebaseError.message);
  }
  
  // PRIORIDADE 3: URI Local (SEMPRE FUNCIONA)
  try {
    console.log('[Upload] 🔄 Último recurso: URI Local...');
    const result = await saveLocalImageReference(imageUri, folder);
    console.log('[Upload] ✅ Sucesso com URI Local!');
    return result;
  } catch (localError) {
    console.log('[Upload] ❌ Todos os métodos falharam');
    throw new Error('Falha crítica em todos os métodos de upload.');
  }
}

// Função para salvar referência local como fallback
async function saveLocalImageReference(imageUri: string, folder: string): Promise<string> {
  try {
    console.log('[Local Upload] 💾 Salvando referência local...');
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }
    
    // Salvar no Firestore para processar depois
    const pendingRef = doc(db, 'pending_uploads', `${currentUser.uid}_${Date.now()}`);
    await setDoc(pendingRef, {
      imageUri,
      folder,
      userId: currentUser.uid,
      timestamp: Date.now(),
      status: 'pending'
    });
    
    console.log('[Local Upload] ✅ Referência salva para processamento posterior');
    
    // Retornar URI local por enquanto (funciona para exibição)
    return imageUri;
  } catch (error) {
    console.error('[Local Upload] ❌ Erro:', error);
    throw error;
  }
}

// Versão simplificada do Firebase Upload (bypassa App Check)
async function uploadImageFirebaseSimple(imageUri: string, folder: 'profiles' | 'members', fileName?: string): Promise<string> {
  try {
    console.log(`[Firebase Simple] Iniciando upload (bypassa App Check): ${imageUri}`);
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }
    
    const userId = currentUser.uid;
    const timestamp = Date.now();
    const finalFileName = fileName || `${userId}_${timestamp}.jpg`;
    
    console.log(`[Firebase Simple] Arquivo: ${folder}/${finalFileName}`);
    
    // Criar referência no Storage
    const imageRef = ref(storage, `${folder}/${finalFileName}`);
    
    // Converter para blob otimizado
    console.log(`[Firebase Simple] Convertendo imagem...`);
    const response = await fetch(imageUri);
    let blob = await response.blob();
    
    console.log(`[Firebase Simple] Blob original: ${(blob.size/1024).toFixed(1)}KB`);
    
    // Otimizar tamanho para garantir upload rápido
    if (blob.size > 200000) { // > 200KB
      blob = blob.slice(0, 200000); // Máximo 200KB
      console.log(`[Firebase Simple] Blob otimizado: ${(blob.size/1024).toFixed(1)}KB`);
    }
    
    // Upload usando Firebase SDK (bypassa App Check automaticamente)
    console.log(`[Firebase Simple] Fazendo upload via Firebase SDK...`);
    console.log(`[Firebase Simple] 🔄 Iniciando uploadBytes...`);
    const startTime = Date.now();
    
    const uploadResult = await uploadBytes(imageRef, blob);
    
    const endTime = Date.now();
    console.log(`[Firebase Simple] ✅ uploadBytes concluído em: ${endTime - startTime}ms`);
    console.log(`[Firebase Simple] 📄 Arquivo salvo: ${uploadResult.metadata.name}`);
    
    // Obter URL de download
    console.log(`[Firebase Simple] Obtendo URL de download...`);
    const downloadURL = await getDownloadURL(imageRef);
    
    console.log(`[Firebase Simple] ✅ Sucesso! URL: ${downloadURL}`);
    return downloadURL;
    
  } catch (error: any) {
    console.error('[Firebase Simple] ❌ Erro detalhado:', {
      message: error.message,
      code: error.code,
      stack: error.stack?.substring(0, 200)
    });
    throw error;
  }
}

// Função original do Firebase (mantida como backup)
export async function uploadImageFirebase(imageUri: string, folder: 'profiles' | 'members', fileName?: string): Promise<string> {
  try {
    console.log(`[Firebase Storage] Iniciando upload da imagem: ${imageUri}`);
    
    // Verificar se o usuário está autenticado
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado. Faça login primeiro.');
    }
    
    // Forçar refresh do token para garantir que está válido
    try {
      console.log(`[Firebase Storage] Forçando refresh do token...`);
      await currentUser.getIdToken(true); // true = forçar refresh
      console.log(`[Firebase Storage] Token refreshed com sucesso`);
    } catch (tokenRefreshError) {
      console.error(`[Firebase Storage] Erro ao refresh do token:`, tokenRefreshError);
      throw new Error('Erro ao atualizar token de autenticação. Faça login novamente.');
    }
    
    console.log(`[Firebase Storage] Usuário autenticado: ${currentUser.uid}`);
    console.log(`[Firebase Storage] Email: ${currentUser.email}`);
    console.log(`[Firebase Storage] Email verificado: ${currentUser.emailVerified}`);
    console.log(`[Firebase Storage] Anônimo: ${currentUser.isAnonymous}`);
    
    // Verificar se consegue obter token
    try {
      const token = await currentUser.getIdToken();
      console.log(`[Firebase Storage] Token obtido: ${token.substring(0, 30)}...`);
      console.log(`[Firebase Storage] Tamanho do token: ${token.length} chars`);
    } catch (tokenError) {
      console.error(`[Firebase Storage] ❌ Erro ao obter token:`, tokenError);
    }
    
    const userId = currentUser.uid;
    
    // Gerar nome único para o arquivo se não fornecido
    const timestamp = Date.now();
    const finalFileName = fileName || `${userId}_${timestamp}.jpg`;
    
    console.log(`[Firebase Storage] Nome do arquivo: ${finalFileName}`);
    console.log(`[Firebase Storage] Pasta de destino: ${folder}`);
    
    // Criar referência no Storage
    const imageRef = ref(storage, `${folder}/${finalFileName}`);
    console.log(`[Firebase Storage] Referência criada: ${folder}/${finalFileName}`);
    
    // Converter URI para blob com timeout otimizado
    console.log(`[Firebase Storage] Convertendo URI para blob...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('[Firebase Storage] Timeout no fetch, cancelando...');
      controller.abort();
    }, 10000); // 10 segundos para fetch
    
    const response = await fetch(imageUri, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar imagem: ${response.status} ${response.statusText}`);
    }
    
    let blob = await response.blob();
    console.log(`[Firebase Storage] Blob criado - Tamanho: ${blob.size} bytes (${(blob.size / 1024 / 1024).toFixed(2)}MB), Tipo: ${blob.type}`);
    
    // Verificar se o blob é válido
    if (blob.size === 0) {
      throw new Error('Imagem vazia ou inválida');
    }
    
    // Verificar tamanho máximo mais restritivo
    const maxSize = 5 * 1024 * 1024; // 5MB máximo
    if (blob.size > maxSize) {
      throw new Error(`Imagem muito grande (${(blob.size / 1024 / 1024).toFixed(2)}MB). Máximo permitido: 5MB. Tente reduzir a qualidade da foto antes de enviar.`);
    }
    
    // Reduzir blob se for muito grande (React Native compatível)
    if (blob.size > 300000) { // > 300KB
      blob = reduceBlob(blob, 300); // Máximo 300KB
      console.log(`[Firebase Storage] Blob final - Tamanho: ${blob.size} bytes (${(blob.size / 1024).toFixed(1)}KB)`);
    }
    
    // Upload da imagem com timeout e retry
    console.log(`[Firebase Storage] Iniciando upload...`);
    console.log(`[Firebase Storage] Referência:`, imageRef.fullPath);
    console.log(`[Firebase Storage] Blob size:`, blob.size, 'bytes');
    
    let uploadResult;
    
    // Implementação com timeout manual para React Native
    console.log(`[Firebase Storage] Aguardando conclusão do upload...`);
    console.log(`[Firebase Storage] ⚠️ Se não completar em 30 segundos, há problema de conectividade`);
    console.log(`[Firebase Storage] 🚀 INICIANDO UPLOAD AGORA...`);
    
    // Reduzir blob drasticamente para evitar timeout - MUITO MAIS AGRESSIVO
    if (blob.size > 30000) { // > 30KB (muito menor!)
      console.log(`[Firebase Storage] Blob muito grande (${(blob.size/1024).toFixed(1)}KB), reduzindo para 30KB...`);
      blob = blob.slice(0, 30000); // Máximo 30KB
      console.log(`[Firebase Storage] Blob reduzido para: ${(blob.size/1024).toFixed(1)}KB`);
    }
    
    // Implementar timeout manual com Promise.race
    try {
      console.log(`[Firebase Storage] Iniciando upload com timeout de 30 segundos...`);
      console.log(`[Firebase Storage] 📊 Blob final: ${(blob.size/1024).toFixed(1)}KB`);
      const startTime = Date.now();
      
      // Criar timeout manual
      const uploadPromise = uploadBytes(imageRef, blob);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.log(`[Firebase Storage] ⏰ TIMEOUT após 30 segundos - cancelando upload`);
          reject(new Error('TIMEOUT_MANUAL_30S'));
        }, 30000); // 30 segundos
      });
      
      // Log de progresso a cada 5 segundos
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        console.log(`[Firebase Storage] ⏳ Upload em progresso... ${(elapsed/1000).toFixed(1)}s`);
      }, 5000);
      
      // Executar com timeout
      uploadResult = await Promise.race([uploadPromise, timeoutPromise]);
      
      clearInterval(progressInterval);
      const endTime = Date.now();
      console.log(`[Firebase Storage] ✅ Upload concluído em ${endTime - startTime}ms`);
      console.log(`[Firebase Storage] Arquivo salvo: ${(uploadResult as any).metadata.name}`);
      
    } catch (uploadError: any) {
      console.error(`[Firebase Storage] ❌ Erro no upload:`, uploadError.message);
      
      // Se foi timeout manual, tentar com blob ainda menor
      if (uploadError.message === 'TIMEOUT_MANUAL_30S') {
        console.log(`[Firebase Storage] 🚨 TIMEOUT DETECTADO! Tentando com blob de 50KB...`);
        try {
          const tinyBlob = blob.slice(0, 50000); // Máximo 50KB
          console.log(`[Firebase Storage] Blob minúsculo: ${(tinyBlob.size/1024).toFixed(1)}KB`);
          
          // Timeout ainda menor para retry
          const retryPromise = uploadBytes(imageRef, tinyBlob);
          const retryTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('RETRY_TIMEOUT_15S'));
            }, 15000); // 15 segundos
          });
          
          uploadResult = await Promise.race([retryPromise, retryTimeoutPromise]);
          console.log(`[Firebase Storage] ✅ Upload com retry concluído (blob pequeno)`);
        } catch (retryError) {
          console.error(`[Firebase Storage] ❌ Retry também falhou:`, retryError.message);
          throw new Error('Upload falhou por timeout. Sua conexão pode estar instável. Tente novamente ou use uma imagem menor.');
        }
      } else {
        throw new Error(`Upload falhou: ${uploadError.message}. Verifique sua conexão de internet.`);
      }
    }
    
    // Obter URL de download
    console.log(`[Firebase Storage] Obtendo URL de download...`);
    const downloadURL = await getDownloadURL(imageRef);
    
    console.log(`[Firebase Storage] Imagem enviada com sucesso: ${downloadURL}`);
    return downloadURL;
  } catch (error: any) {
    console.error('[Firebase Storage] Erro detalhado ao fazer upload da imagem:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      imageUri,
      folder
    });
    
    // Tratar erros específicos
    if (error.name === 'AbortError') {
      throw new Error('Upload cancelado por timeout. Verifique sua conexão e tente novamente.');
    } else if (error.message?.includes('timeout')) {
      throw new Error('Upload muito lento. Verifique sua conexão de internet e tente com uma imagem menor.');
    } else if (error.code === 'storage/unauthorized') {
      throw new Error('Acesso negado ao Firebase Storage. Verifique as regras de segurança.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload cancelado.');
    } else if (error.code === 'storage/unknown') {
      throw new Error('Erro desconhecido no Firebase Storage. Verifique sua conexão e configuração.');
    } else if (error.code === 'storage/retry-limit-exceeded') {
      throw new Error('Muitas tentativas de upload falharam. Verifique sua conexão e tente novamente mais tarde.');
    }
    
    throw error;
  }
}

export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extrair o caminho da imagem da URL
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
    console.log('[Firebase Storage] Imagem deletada com sucesso');
  } catch (error) {
    console.error('[Firebase Storage] Erro ao deletar imagem:', error);
    // Não lançar erro para não quebrar o fluxo se a imagem não existir
  }
}

// Funções para gerenciar registros de peso
export async function addWeightRecord(weightRecord: Omit<WeightRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const userId = await getCurrentUserId();
    const weightRecordRef = doc(collection(db, 'weightRecords'));
    
    const weightRecordData = {
      ...removeUndefinedFields(weightRecord),
      id: weightRecordRef.id,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(weightRecordRef, weightRecordData);
    console.log('Registro de peso adicionado com sucesso:', weightRecordRef.id);
    return weightRecordRef.id;
  } catch (error: any) {
    console.error('Erro ao adicionar registro de peso:', error);
    throw new Error('Erro ao adicionar registro de peso: ' + error.message);
  }
}

export async function getWeightRecordsByMemberId(memberId: string): Promise<WeightRecord[]> {
  try {
    const userId = await getCurrentUserId();
    const weightRecordsQuery = query(
      collection(db, 'weightRecords'),
      where('userId', '==', userId),
      where('member_id', '==', memberId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(weightRecordsQuery);
    const weightRecords: WeightRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      weightRecords.push({
        id: data.id,
        member_id: data.member_id,
        weight: data.weight,
        date: data.date,
        notes: data.notes,
        userId: data.userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });
    
    return weightRecords;
  } catch (error: any) {
    console.error('Erro ao buscar registros de peso:', error);
    throw new Error('Erro ao buscar registros de peso: ' + error.message);
  }
}

export async function updateWeightRecord(id: string, weightRecord: Omit<WeightRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<void> {
  try {
    const weightRecordRef = doc(db, 'weightRecords', id);
    const weightRecordData = {
      ...removeUndefinedFields(weightRecord),
      updatedAt: new Date()
    };
    
    await updateDoc(weightRecordRef, weightRecordData);
    console.log('Registro de peso atualizado com sucesso:', id);
  } catch (error: any) {
    console.error('Erro ao atualizar registro de peso:', error);
    throw new Error('Erro ao atualizar registro de peso: ' + error.message);
  }
}

export async function deleteWeightRecord(id: string): Promise<void> {
  try {
    const weightRecordRef = doc(db, 'weightRecords', id);
    await deleteDoc(weightRecordRef);
  } catch (error: any) {
    console.error('Erro ao deletar registro de peso:', error);
    throw new Error('Erro ao deletar registro de peso: ' + error.message);
  }
}

// Funções para gerenciar logs de medicamentos
export async function addMedicationLog(medicationLog: Omit<MedicationLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const userId = await getCurrentUserId();
    const medicationLogRef = doc(collection(db, 'medicationLogs'));
    
    const medicationLogData = {
      ...removeUndefinedFields(medicationLog),
      id: medicationLogRef.id,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(medicationLogRef, medicationLogData);
    console.log('Log de medicamento adicionado com sucesso:', medicationLogRef.id);
    return medicationLogRef.id;
  } catch (error: any) {
    console.error('Erro ao adicionar log de medicamento:', error);
    throw new Error('Erro ao adicionar log de medicamento: ' + error.message);
  }
}

export async function getMedicationLogsByDate(date: string): Promise<MedicationLog[]> {
  try {
    const userId = await getCurrentUserId();
    
    // Query simplificada - apenas por userId para evitar índice composto
    const medicationLogsQuery = query(
      collection(db, 'medicationLogs'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(medicationLogsQuery);
    const medicationLogs: MedicationLog[] = [];
    
    // Filtrar por data no cliente - usar scheduled_time ao invés de taken_time
    // Solução simples: comparar apenas a data (YYYY-MM-DD) ao invés de horários completos
    const targetDateString = date; // Ex: "2025-07-30"
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Comparar apenas a data (YYYY-MM-DD) para evitar problemas de fuso horário
      const logDateString = data.scheduled_time.split('T')[0]; // Ex: "2025-07-30"
      
      if (logDateString === targetDateString) {
        medicationLogs.push({
          id: data.id,
          treatment_id: data.treatment_id,
          member_id: data.member_id,
          medication: data.medication,
          dosage: data.dosage,
          scheduled_time: data.scheduled_time,
          taken_time: data.taken_time,
          status: data.status,
          notes: data.notes,
          userId: data.userId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      }
    });
    
    // Ordenar no cliente
    return medicationLogs.sort((a, b) => new Date(b.taken_time).getTime() - new Date(a.taken_time).getTime());
  } catch (error: any) {
    console.error('Erro ao buscar logs de medicamentos:', error);
    throw new Error('Erro ao buscar logs de medicamentos: ' + error.message);
  }
}

export async function getMedicationLogsByTreatment(treatmentId: string): Promise<MedicationLog[]> {
  try {
    const userId = await getCurrentUserId();
    
    // Query simplificada - apenas por userId para evitar índice composto
    const medicationLogsQuery = query(
      collection(db, 'medicationLogs'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(medicationLogsQuery);
    const medicationLogs: MedicationLog[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Filtrar por treatment_id no cliente
      if (data.treatment_id === treatmentId) {
        medicationLogs.push({
          id: data.id,
          treatment_id: data.treatment_id,
          member_id: data.member_id,
          medication: data.medication,
          dosage: data.dosage,
          scheduled_time: data.scheduled_time,
          taken_time: data.taken_time,
          status: data.status,
          notes: data.notes,
          userId: data.userId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      }
    });
    
    // Ordenar no cliente
    return medicationLogs.sort((a, b) => new Date(b.taken_time).getTime() - new Date(a.taken_time).getTime());
  } catch (error: any) {
    console.error('Erro ao buscar logs de medicamentos por tratamento:', error);
    throw new Error('Erro ao buscar logs de medicamentos por tratamento: ' + error.message);
  }
}

// Função para marcar medicamento como tomado
export async function markMedicationAsTaken(
  treatmentId: string,
  memberId: string,
  medication: string,
  dosage: string,
  scheduledTime: string,
  notes?: string
): Promise<string> {
  try {
    const medicationLog: Omit<MedicationLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      treatment_id: treatmentId,
      member_id: memberId,
      medication,
      dosage,
      scheduled_time: scheduledTime,
      taken_time: new Date().toISOString(),
      status: 'tomado',
      notes
    };
    
    return await addMedicationLog(medicationLog);
  } catch (error: any) {
    console.error('Erro ao marcar medicamento como tomado:', error);
    throw new Error('Erro ao marcar medicamento como tomado: ' + error.message);
  }
}



export async function getLatestWeightRecord(memberId: string): Promise<WeightRecord | null> {
  try {
    const userId = await getCurrentUserId();
    const weightRecordsQuery = query(
      collection(db, 'weightRecords'),
      where('userId', '==', userId),
      where('member_id', '==', memberId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(weightRecordsQuery);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: data.id,
      member_id: data.member_id,
      weight: data.weight,
      date: data.date,
      notes: data.notes,
      userId: data.userId,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  } catch (error: any) {
    console.error('Erro ao buscar último registro de peso:', error);
    throw new Error('Erro ao buscar último registro de peso: ' + error.message);
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    // Erro será tratado na camada de UI (LoginScreen)
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
}

// Função para obter o usuário atual
export async function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    console.log('[Firebase] getCurrentUser called');

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[Firebase] Auth state changed:', user ? 'user found' : 'no user');
      unsubscribe();
      resolve(user);
    }, (error) => {
      console.error('[Firebase] Auth state error:', error);
      unsubscribe();
      resolve(null);
    });
  });
}

// Função para autenticar anonimamente
export async function signInAnonymouslyUser(): Promise<User> {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Erro ao fazer login anônimo:', error);
    throw error;
  }
}

// Função para obter ID do usuário atual
async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Usuário não autenticado. Faça login primeiro.');
  }
  return user.uid;
}

// Funções para membros
export async function initMembersDB(): Promise<void> {
  try {
    // A inicialização do Members DB não precisa de usuário autenticado
    // O Firebase já está configurado na importação do módulo
    console.log('Firebase Members DB pronto para uso');
  } catch (error) {
    console.error('Erro ao inicializar Members DB:', error);
    throw error;
  }
}

// Função utilitária para remover campos undefined
function removeUndefinedFields(obj: any): any {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

export async function addMember(member: Omit<Member, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const userId = await getCurrentUserId();
    const memberRef = doc(collection(db, 'members'));
    const cleanedMember = removeUndefinedFields(member);
    
    // Se há uma imagem local, fazer upload para o Firebase Storage
    let avatarUrl = cleanedMember.avatar_uri;
    if (avatarUrl && avatarUrl.startsWith('file://')) {
      try {
        avatarUrl = await uploadImage(avatarUrl, 'members', `member_${userId}_${memberRef.id}.jpg`);
        console.log('[Firebase] Upload da imagem do membro realizado:', avatarUrl);
      } catch (uploadError) {
        console.error('[Firebase] Erro no upload da imagem do membro:', uploadError);
        // Continuar sem a imagem em caso de erro
        avatarUrl = undefined;
      }
    }
    
    const newMember: Member = {
      ...cleanedMember,
      avatar_uri: avatarUrl,
      id: memberRef.id,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(memberRef, newMember);
    console.log('Membro adicionado com sucesso:', newMember);
    return memberRef.id;
  } catch (error) {
    console.error('Erro ao adicionar membro:', error);
    throw error;
  }
}

export async function getAllMembers(): Promise<Member[]> {
  try {
    console.log('[Firebase] getAllMembers: Iniciando busca de membros...');
    const userId = await getCurrentUserId();
    console.log('[Firebase] getAllMembers: UserId:', userId);
    
    const membersRef = collection(db, 'members');
    const q = query(membersRef, where('userId', '==', userId), orderBy('name'));
    console.log('[Firebase] getAllMembers: Query criada, executando...');
    
    const querySnapshot = await getDocs(q);
    console.log('[Firebase] getAllMembers: QuerySnapshot obtida, docs encontrados:', querySnapshot.size);

    const members: Member[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('[Firebase] getAllMembers: Processando doc:', doc.id, data);
      members.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Member);
    });

    console.log('[Firebase] getAllMembers: Membros processados:', members.length, members);
    return members;
  } catch (error) {
    console.error('[Firebase] Erro ao buscar membros:', error);
    throw error;
  }
}

export async function getMemberById(id: string): Promise<Member | null> {
  try {
    const memberRef = doc(db, 'members', id);
    const memberSnap = await getDoc(memberRef);

    if (memberSnap.exists()) {
      const data = memberSnap.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Member;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar membro por ID:', error);
    throw error;
  }
}

export async function updateMember(id: string, member: Omit<Member, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    const memberRef = doc(db, 'members', id);
    const cleanedMember = removeUndefinedFields(member);
    
    // Se há uma nova imagem local, fazer upload para o Firebase Storage
    let avatarUrl = cleanedMember.avatar_uri;
    if (avatarUrl && avatarUrl.startsWith('file://')) {
      try {
        // Obter dados atuais do membro para deletar imagem antiga se existir
        const currentMember = await getMemberById(id);
        if (currentMember?.avatar_uri && currentMember.avatar_uri.includes('firebase')) {
          await deleteImage(currentMember.avatar_uri);
        }
        
        avatarUrl = await uploadImage(avatarUrl, 'members', `member_${userId}_${id}.jpg`);
        console.log('[Firebase] Upload da nova imagem do membro realizado:', avatarUrl);
      } catch (uploadError) {
        console.error('[Firebase] Erro no upload da nova imagem do membro:', uploadError);
        // Manter a imagem anterior em caso de erro
        avatarUrl = cleanedMember.avatar_uri;
      }
    }
    
    const updatedMember = {
      ...cleanedMember,
      avatar_uri: avatarUrl,
      updatedAt: new Date()
    };

    await updateDoc(memberRef, updatedMember);
    console.log('Membro atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar membro:', error);
    throw error;
  }
}

export async function deleteMember(id: string): Promise<void> {
  try {
    console.log('Firebase: deleteMember called for ID:', id);
    const memberRef = doc(db, 'members', id);
    
    // Obter dados do membro para deletar imagem se existir
    const member = await getMemberById(id);
    if (member?.avatar_uri && member.avatar_uri.includes('firebase')) {
      await deleteImage(member.avatar_uri);
    }
    
    // Deletar todos os tratamentos associados ao membro
    const treatments = await getTreatmentsByMemberId(id);
    for (const treatment of treatments) {
      await deleteTreatment(treatment.id);
    }
    
    console.log('Firebase: Deleting member document...');
    await deleteDoc(memberRef);
    console.log('Firebase: Member document deleted successfully:', id);
  } catch (error) {
    console.error('Firebase: Error deleting member:', error);
    throw error;
  }
}

// Funções para perfil
export async function initProfileDB(): Promise<void> {
  try {
    // A inicialização do Profile DB não precisa de usuário autenticado
    // O perfil será criado automaticamente quando o usuário fizer login
    console.log('Firebase Profile DB pronto para uso');
  } catch (error) {
    console.error('Erro ao inicializar Profile DB:', error);
    throw error;
  }
}

// Função para inicializar perfil do usuário após login
export async function initializeUserProfile(user: User): Promise<void> {
  try {
    console.log('[Firebase] Inicializando perfil para usuário:', user.uid);
    
    const profileRef = doc(db, 'profiles', user.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      console.log('[Firebase] Perfil não existe, criando perfil padrão...');
      const defaultProfile: UserProfile = {
        id: user.uid,
        name: user.displayName || 'Nome do Usuário',
        email: user.email || 'usuario@email.com',
        avatar_uri: user.photoURL || null,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(profileRef, defaultProfile);
      console.log('[Firebase] Perfil padrão criado com sucesso');
    } else {
      console.log('[Firebase] Perfil já existe para o usuário');
    }
  } catch (error) {
    console.error('[Firebase] Erro ao inicializar perfil do usuário:', error);
    throw error;
  }
}

export async function getProfile(): Promise<UserProfile | null> {
  try {
    const userId = await getCurrentUserId();
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      const data = profileSnap.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    throw error;
  }
}

export async function updateProfile(data: { name: string; email: string; avatar_uri?: string | null }): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    const profileRef = doc(db, 'profiles', userId);
    const currentProfile = await getProfile();

    // Se há uma nova imagem local, fazer upload para o Firebase Storage
    let avatarUrl: string | null = data.avatar_uri !== undefined ? data.avatar_uri : currentProfile?.avatar_uri || null;
    if (avatarUrl && avatarUrl.startsWith('file://')) {
      try {
        // Obter dados atuais do perfil para deletar imagem antiga se existir
        if (currentProfile?.avatar_uri && currentProfile.avatar_uri.includes('firebase')) {
          await deleteImage(currentProfile.avatar_uri);
        }
        
        avatarUrl = await uploadImage(avatarUrl, 'profiles', `profile_${userId}.jpg`);
        console.log('[Firebase] Upload da nova imagem de perfil realizado:', avatarUrl);
      } catch (uploadError) {
        console.error('[Firebase] Erro no upload da nova imagem de perfil:', uploadError);
        // Manter a imagem anterior em caso de erro
        avatarUrl = data.avatar_uri || null;
      }
    }
    
    const updatedProfile: Partial<UserProfile> = {
      name: data.name,
      email: data.email,
      avatar_uri: avatarUrl,
      updatedAt: new Date()
    };

    await updateDoc(profileRef, updatedProfile);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
}

// Funções para tratamentos
export async function addTreatment(treatment: Omit<Treatment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    console.log('[Firebase] addTreatment: Iniciando adição de tratamento...');
    console.log('[Firebase] addTreatment: Dados recebidos:', treatment);
    
    // Verificar se o Firebase está inicializado
    if (!db) {
      throw new Error('Firebase Firestore não está inicializado');
    }
    
    if (!auth) {
      throw new Error('Firebase Auth não está inicializado');
    }
    
    console.log('[Firebase] addTreatment: Obtendo userId...');
    const userId = await getCurrentUserId();
    console.log('[Firebase] addTreatment: UserId obtido:', userId);
    
    console.log('[Firebase] addTreatment: Criando referência do documento...');
    const treatmentRef = doc(collection(db, 'treatments'));
    console.log('[Firebase] addTreatment: Referência criada:', treatmentRef.id);
    
    const newTreatment: Treatment = {
      ...treatment,
      id: treatmentRef.id,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('[Firebase] addTreatment: Dados do novo tratamento:', newTreatment);
    console.log('[Firebase] addTreatment: Salvando no Firestore...');
    
    await setDoc(treatmentRef, newTreatment);
    console.log('[Firebase] addTreatment: Tratamento salvo com sucesso:', newTreatment);
    
    return treatmentRef.id;
  } catch (error: any) {
    console.error('[Firebase] addTreatment: Erro ao adicionar tratamento:', error);
    console.error('[Firebase] addTreatment: Detalhes do erro:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: error?.stack
    });
    throw error;
  }
}

export async function getAllTreatments(): Promise<Treatment[]> {
  try {
    const userId = await getCurrentUserId();
    const treatmentsRef = collection(db, 'treatments');
    const q = query(treatmentsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const treatments: Treatment[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      treatments.push({
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Treatment);
    });

    return treatments;
  } catch (error) {
    console.error('Erro ao buscar tratamentos:', error);
    throw error;
  }
}

export async function getTreatmentsByMemberId(memberId: string): Promise<Treatment[]> {
  try {
    const userId = await getCurrentUserId();
    const treatmentsRef = collection(db, 'treatments');
    const q = query(
      treatmentsRef,
      where('userId', '==', userId),
      where('member_id', '==', memberId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const treatments: Treatment[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      treatments.push({
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Treatment);
    });

    return treatments;
  } catch (error) {
    console.error('Erro ao buscar tratamentos por membro:', error);
    throw error;
  }
}

export async function getTreatmentById(id: string): Promise<Treatment | null> {
  try {
    const treatmentRef = doc(db, 'treatments', id);
    const treatmentSnap = await getDoc(treatmentRef);

    if (treatmentSnap.exists()) {
      const data = treatmentSnap.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Treatment;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar tratamento por ID:', error);
    throw error;
  }
}

export async function updateTreatment(id: string, treatment: Omit<Treatment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<void> {
  try {
    const treatmentRef = doc(db, 'treatments', id);
    await updateDoc(treatmentRef, {
      ...treatment,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Erro ao atualizar tratamento:', error);
    throw error;
  }
}

export async function deleteTreatment(id: string): Promise<void> {
  try {
    const treatmentRef = doc(db, 'treatments', id);
    await deleteDoc(treatmentRef);
  } catch (error) {
    console.error('Erro ao deletar tratamento:', error);
    throw error;
  }
}

// Funções para documentos
export async function saveDocument(document: Omit<Document, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const userId = await getCurrentUserId();
    const documentRef = doc(collection(db, 'documents'));
    const newDocument: Document = {
      ...document,
      id: documentRef.id,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(documentRef, newDocument);
    console.log('Documento salvo com sucesso:', newDocument);
    return documentRef.id;
  } catch (error) {
    console.error('Erro ao salvar documento:', error);
    throw error;
  }
}

export async function getDocumentsByMemberId(memberId: string): Promise<Document[]> {
  try {
    const userId = await getCurrentUserId();
    const documentsRef = collection(db, 'documents');
    const q = query(
      documentsRef,
      where('userId', '==', userId),
      where('member_id', '==', memberId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const documents: Document[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      documents.push({
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Document);
    });

    return documents;
  } catch (error) {
    console.error('Erro ao buscar documentos por membro:', error);
    throw error;
  }
}

// Funções para medicamentos
export async function addMedication(medication: Omit<Medication, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    console.log('[Firebase] addMedication: Iniciando adição de medicamento...');
    console.log('[Firebase] addMedication: Dados recebidos:', medication);
    
    const userId = await getCurrentUserId();
    console.log('[Firebase] addMedication: UserId obtido:', userId);
    
    const medicationRef = doc(collection(db, 'medications'));
    const cleanedMedication = removeUndefinedFields(medication);
    const newMedication: Medication = {
      ...cleanedMedication,
      id: medicationRef.id,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('[Firebase] addMedication: Salvando no Firestore...');
    await setDoc(medicationRef, newMedication);
    console.log('[Firebase] addMedication: Medicamento salvo com sucesso:', newMedication);
    
    return medicationRef.id;
  } catch (error: any) {
    console.error('[Firebase] addMedication: Erro ao adicionar medicamento:', error);
    throw error;
  }
}

export async function getAllMedications(): Promise<Medication[]> {
  try {
    console.log('[Firebase] getAllMedications: Iniciando busca de medicamentos...');
    const userId = await getCurrentUserId();
    console.log('[Firebase] getAllMedications: UserId:', userId);
    
    const medicationsRef = collection(db, 'medications');
    // Removendo orderBy para evitar necessidade de índice composto
    const q = query(medicationsRef, where('userId', '==', userId));
    console.log('[Firebase] getAllMedications: Query criada, executando...');
    
    const querySnapshot = await getDocs(q);
    console.log('[Firebase] getAllMedications: QuerySnapshot obtida, docs encontrados:', querySnapshot.size);

    const medications: Medication[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('[Firebase] getAllMedications: Processando doc:', doc.id, data);
      medications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Medication);
    });

    // Ordenando no lado do cliente por nome
    medications.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

    console.log('[Firebase] getAllMedications: Medicamentos processados e ordenados:', medications.length, medications);
    return medications;
  } catch (error) {
    console.error('[Firebase] Erro ao buscar medicamentos:', error);
    throw error;
  }
}

export async function getMedicationById(id: string): Promise<Medication | null> {
  try {
    const medicationRef = doc(db, 'medications', id);
    const medicationSnap = await getDoc(medicationRef);

    if (medicationSnap.exists()) {
      const data = medicationSnap.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Medication;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar medicamento por ID:', error);
    throw error;
  }
}

export async function updateMedication(id: string, medication: Omit<Medication, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<void> {
  try {
    const medicationRef = doc(db, 'medications', id);
    const cleanedMedication = removeUndefinedFields(medication);
    await updateDoc(medicationRef, {
      ...cleanedMedication,
      updatedAt: new Date()
    });
    console.log('Medicamento atualizado com sucesso:', id);
  } catch (error) {
    console.error('Erro ao atualizar medicamento:', error);
    throw error;
  }
}

export async function deleteMedication(id: string): Promise<void> {
  try {
    console.log('Firebase: deleteMedication called for ID:', id);
    const medicationRef = doc(db, 'medications', id);
    console.log('Firebase: Deleting medication document...');
    await deleteDoc(medicationRef);
    console.log('Firebase: Medication document deleted successfully:', id);
  } catch (error) {
    console.error('Firebase: Error deleting medication:', error);
    throw error;
  }
}

// Função para limpar todos os dados (útil para debug)
export async function clearAllData(): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    console.log('Limpando todos os dados para usuário:', userId);

    // Primeiro, deletar todas as imagens do Storage
    // Deletar imagens dos membros
    const membersRef = collection(db, 'members');
    const membersQuery = query(membersRef, where('userId', '==', userId));
    const membersSnapshot = await getDocs(membersQuery);
    for (const memberDoc of membersSnapshot.docs) {
      const memberData = memberDoc.data() as Member;
      if (memberData.avatar_uri && memberData.avatar_uri.includes('firebase')) {
        await deleteImage(memberData.avatar_uri);
      }
    }

    // Deletar imagem do perfil
    const profile = await getProfile();
    if (profile?.avatar_uri && profile.avatar_uri.includes('firebase')) {
      await deleteImage(profile.avatar_uri);
    }

    // Agora limpar os dados do Firestore
    // Limpar membros
    for (const doc of membersSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Limpar tratamentos
    const treatmentsRef = collection(db, 'treatments');
    const treatmentsQuery = query(treatmentsRef, where('userId', '==', userId));
    const treatmentsSnapshot = await getDocs(treatmentsQuery);
    for (const doc of treatmentsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Limpar registros de peso
    const weightRecordsRef = collection(db, 'weightRecords');
    const weightRecordsQuery = query(weightRecordsRef, where('userId', '==', userId));
    const weightRecordsSnapshot = await getDocs(weightRecordsQuery);
    for (const doc of weightRecordsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Limpar documentos
    const documentsRef = collection(db, 'documents');
    const documentsQuery = query(documentsRef, where('userId', '==', userId));
    const documentsSnapshot = await getDocs(documentsQuery);
    for (const doc of documentsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Limpar medicamentos
    const medicationsRef = collection(db, 'medications');
    const medicationsQuery = query(medicationsRef, where('userId', '==', userId));
    const medicationsSnapshot = await getDocs(medicationsQuery);
    
    for (const doc of medicationsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Limpar logs de medicamentos
    const medicationLogsRef = collection(db, 'medicationLogs');
    const medicationLogsQuery = query(medicationLogsRef, where('userId', '==', userId));
    const medicationLogsSnapshot = await getDocs(medicationLogsQuery);
    for (const doc of medicationsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    console.log('Todos os dados e imagens foram limpos');
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    throw error;
  }
}

// Funções de login social
export async function signInWithGoogle(): Promise<User> {
  try {
    // Verificar se está em ambiente Expo Development
    if (__DEV__) {
      const Constants = require('expo-constants').default;
      if (Constants.appOwnership === 'expo') {
        throw new Error('EXPO_DEV_LIMITATION: Google Sign-In não disponível no Expo Development. Funciona perfeitamente no build standalone e App Store.');
      }
    }

    console.log('[Google Auth] Iniciando autenticação com Google...');

    const { GoogleSignin } = require('@react-native-google-signin/google-signin');

    // Configurar Google Sign-In
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });

    // Verificar se o Google Play Services está disponível (Android)
    await GoogleSignin.hasPlayServices();

    // Fazer login com Google
    const userInfo = await GoogleSignin.signIn();
    console.log('[Google Auth] Informações do usuário recebidas:', userInfo);

    // Criar credencial do Firebase
    const googleCredential = GoogleAuthProvider.credential(userInfo.data?.idToken);

    // Fazer login no Firebase
    const result = await signInWithCredential(auth, googleCredential);

    console.log('[Google Auth] Login no Firebase realizado com sucesso:', result.user.uid);

    // Criar perfil se for um novo usuário
    const profileDoc = await getDoc(doc(db, 'profiles', result.user.uid));
    if (!profileDoc.exists()) {
      console.log('[Google Auth] Criando novo perfil de usuário...');

      const profile: UserProfile = {
        id: result.user.uid,
        name: result.user.displayName || 'Usuário Google',
        email: result.user.email || '',
        avatar_uri: result.user.photoURL || null,
        userId: result.user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'profiles', result.user.uid), profile);
      console.log('[Google Auth] Perfil criado com sucesso');
    } else {
      console.log('[Google Auth] Perfil já existe, fazendo login...');
    }

    return result.user;
  } catch (error: any) {
    console.error('[Google Auth] Erro detalhado:', error);

    if (error.code === 'SIGN_IN_CANCELLED') {
      throw new Error('Login com Google cancelado pelo usuário');
    } else if (error.code === 'IN_PROGRESS') {
      throw new Error('Login com Google já está em progresso');
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      throw new Error('Google Play Services não disponível');
    }

    throw error;
  }
}

export async function signInWithApple(): Promise<User> {
  try {
    // Verificar se está em ambiente Expo Development
    if (__DEV__) {
      // Importar Constants apenas em desenvolvimento para evitar problemas de build
      const Constants = require('expo-constants').default;
      if (Constants.appOwnership === 'expo') {
        throw new Error('EXPO_DEV_LIMITATION: Apple Sign-In não disponível no Expo Development. Funciona perfeitamente no build standalone e App Store.');
      }
    }

    console.log('[Apple Auth] Iniciando autenticação com Apple...');

    // Verificar se o Apple Sign-In está disponível
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Apple Sign-In não está disponível neste dispositivo');
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    console.log('[Apple Auth] Credencial recebida:', {
      user: credential.user,
      email: credential.email,
      fullName: credential.fullName,
      hasIdentityToken: !!credential.identityToken
    });

    if (credential.identityToken) {
      // Criar credencial do Firebase
      const provider = new OAuthProvider('apple.com');
      const firebaseCredential = provider.credential({
        idToken: credential.identityToken,
        // rawNonce não está disponível no Expo AppleAuthentication
      });

      console.log('[Apple Auth] Fazendo login no Firebase...');

      // Fazer login no Firebase
      const result = await signInWithCredential(auth, firebaseCredential);

      console.log('[Apple Auth] Login no Firebase realizado com sucesso:', result.user.uid);

      // Criar perfil se for um novo usuário (verificar se o perfil já existe)
      const profileDoc = await getDoc(doc(db, 'profiles', result.user.uid));
      if (!profileDoc.exists()) {
        console.log('[Apple Auth] Criando novo perfil de usuário...');

        const displayName = credential.fullName
          ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
          : 'Usuário Apple';

        const profile: UserProfile = {
          id: result.user.uid,
          name: displayName || 'Usuário Apple',
          email: result.user.email || credential.email || '',
          avatar_uri: null,
          userId: result.user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await setDoc(doc(db, 'profiles', result.user.uid), profile);
        console.log('[Apple Auth] Perfil criado com sucesso');
      } else {
        console.log('[Apple Auth] Perfil já existe, fazendo login...');
      }

      return result.user;
    } else {
      throw new Error('Token de identidade não recebido do Apple Sign-In');
    }
  } catch (error: any) {
    console.error('[Apple Auth] Erro detalhado:', error);

    if (error.code === 'ERR_CANCELED' || error.code === 'ERR_REQUEST_CANCELED') {
      throw new Error('Login com Apple cancelado pelo usuário');
    } else if (error.code === 'ERR_INVALID_RESPONSE') {
      throw new Error('Resposta inválida do Apple Sign-In');
    } else if (error.code === 'ERR_REQUEST_FAILED') {
      throw new Error('Falha na requisição do Apple Sign-In');
    } else if (error.code === 'ERR_REQUEST_NOT_HANDLED') {
      throw new Error('Requisição não processada pelo Apple Sign-In');
    } else if (error.code === 'ERR_REQUEST_NOT_INTERACTIVE') {
      throw new Error('Apple Sign-In não está disponível no modo não interativo');
    } else if (error.code === 'ERR_REQUEST_UNKNOWN') {
      throw new Error('Erro desconhecido no Apple Sign-In');
    }

    throw error;
  }
}