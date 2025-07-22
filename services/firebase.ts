import * as AppleAuthentication from 'expo-apple-authentication';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, OAuthProvider, onAuthStateChanged, signInAnonymously, signInWithCredential, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

// Inicializar serviços
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

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
  notes?: string;
  avatar_uri?: string;
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

export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
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
    const userId = await getCurrentUserId();
    console.log('Firebase Members DB inicializado para usuário:', userId);
  } catch (error) {
    console.error('Erro ao inicializar Members DB:', error);
    throw error;
  }
}

export async function addMember(member: Omit<Member, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const userId = await getCurrentUserId();
    const memberRef = doc(collection(db, 'members'));
    const newMember: Member = {
      ...member,
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
    const userId = await getCurrentUserId();
    const membersRef = collection(db, 'members');
    const q = query(membersRef, where('userId', '==', userId), orderBy('name'));
    const querySnapshot = await getDocs(q);

    const members: Member[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      members.push({
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Member);
    });

    return members;
  } catch (error) {
    console.error('Erro ao buscar membros:', error);
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
    const memberRef = doc(db, 'members', id);
    await updateDoc(memberRef, {
      ...member,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Erro ao atualizar membro:', error);
    throw error;
  }
}

export async function deleteMember(id: string): Promise<void> {
  try {
    const memberRef = doc(db, 'members', id);
    await deleteDoc(memberRef);
  } catch (error) {
    console.error('Erro ao deletar membro:', error);
    throw error;
  }
}

// Funções para perfil
export async function initProfileDB(): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      const defaultProfile: UserProfile = {
        id: userId,
        name: 'Nome do Usuário',
        email: 'usuario@email.com',
        avatar_uri: null,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await setDoc(profileRef, defaultProfile);
    }

    console.log('Firebase Profile DB inicializado para usuário:', userId);
  } catch (error) {
    console.error('Erro ao inicializar Profile DB:', error);
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

    const updatedProfile: Partial<UserProfile> = {
      name: data.name,
      email: data.email,
      avatar_uri: data.avatar_uri !== undefined ? data.avatar_uri : currentProfile?.avatar_uri || null,
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
    const userId = await getCurrentUserId();
    const treatmentRef = doc(collection(db, 'treatments'));
    const newTreatment: Treatment = {
      ...treatment,
      id: treatmentRef.id,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(treatmentRef, newTreatment);
    console.log('Tratamento adicionado com sucesso:', newTreatment);
    return treatmentRef.id;
  } catch (error) {
    console.error('Erro ao adicionar tratamento:', error);
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

// Função para limpar todos os dados (útil para debug)
export async function clearAllData(): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    console.log('Limpando todos os dados para usuário:', userId);

    // Limpar membros
    const membersRef = collection(db, 'members');
    const membersQuery = query(membersRef, where('userId', '==', userId));
    const membersSnapshot = await getDocs(membersQuery);
    membersSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    // Limpar tratamentos
    const treatmentsRef = collection(db, 'treatments');
    const treatmentsQuery = query(treatmentsRef, where('userId', '==', userId));
    const treatmentsSnapshot = await getDocs(treatmentsQuery);
    treatmentsSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    // Limpar documentos
    const documentsRef = collection(db, 'documents');
    const documentsQuery = query(documentsRef, where('userId', '==', userId));
    const documentsSnapshot = await getDocs(documentsQuery);
    documentsSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    console.log('Todos os dados foram limpos');
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    throw error;
  }
}

// Funções de login social
export async function signInWithGoogle(): Promise<User> {
  try {
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