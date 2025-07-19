import * as AppleAuthentication from 'expo-apple-authentication';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, OAuthProvider, onAuthStateChanged, signInAnonymously, signInWithCredential, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDjNStUaX7thWY1FbTHE5l5Vnrw-u6Lmk0",
  authDomain: "glasscare-2025.firebaseapp.com",
  projectId: "glasscare-2025",
  storageBucket: "glasscare-2025.firebasestorage.app",
  messagingSenderId: "648780623753",
  appId: "1:648780623753:ios:9b3abd536077a0bb863b58"
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
    // Para simplificar, vamos usar uma abordagem básica
    // Em produção, você precisaria configurar o Google Sign-In adequadamente
    throw new Error('Login com Google ainda não implementado. Use email/senha por enquanto.');
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error);
    throw error;
  }
}

export async function signInWithApple(): Promise<User> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (credential.identityToken) {
      // Criar credencial do Firebase
      const provider = new OAuthProvider('apple.com');
      const firebaseCredential = provider.credential({
        idToken: credential.identityToken,
        // rawNonce não está disponível no Expo AppleAuthentication
      });

      // Fazer login no Firebase
      const result = await signInWithCredential(auth, firebaseCredential);
      
      // Criar perfil se for um novo usuário (verificar se o perfil já existe)
      const profileDoc = await getDoc(doc(db, 'profiles', result.user.uid));
      if (!profileDoc.exists()) {
        const profile: UserProfile = {
          id: result.user.uid,
          name: credential.fullName?.givenName + ' ' + credential.fullName?.familyName || 'Usuário Apple',
          email: result.user.email || '',
          avatar_uri: null,
          userId: result.user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(doc(db, 'profiles', result.user.uid), profile);
      }
      
      return result.user;
    } else {
      throw new Error('Token de identidade não recebido do Apple Sign-In');
    }
  } catch (error: any) {
    if (error.code === 'ERR_CANCELED') {
      throw new Error('Login com Apple cancelado pelo usuário');
    }
    console.error('Erro ao fazer login com Apple:', error);
    throw error;
  }
} 