import AsyncStorage from '@react-native-async-storage/async-storage';

// Chaves para o AsyncStorage
const STORAGE_KEYS = {
  MEMBERS: 'members',
  PROFILE: 'profile',
  TREATMENTS: 'treatments',
  DOCUMENTS: 'documents',
  SCHEDULE: 'schedule',
} as const;

// Interfaces
export interface Member {
  id: number;
  name: string;
  relation: string;
  dob: string;
  notes?: string;
  avatar_uri?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar_uri: string | null;
}

export interface Treatment {
  id: number;
  member_id: number;
  medication: string;
  dosage: string;
  frequency_value: number;
  frequency_unit: string;
  duration: string;
  notes?: string;
  start_datetime: string;
  status: string;
}

export interface Document {
  id: number;
  member_id: number;
  file_name: string;
  file_uri: string;
  file_type: string;
  analysis_text?: string;
  created_at: string;
}

// Função para gerar IDs únicos
let memberIdCounter = 1;
let treatmentIdCounter = 1;
let documentIdCounter = 1;

async function getNextId(type: 'member' | 'treatment' | 'document'): Promise<number> {
  const counterKey = `${type}IdCounter`;
  const currentCounter = await AsyncStorage.getItem(counterKey);
  const nextId = currentCounter ? parseInt(currentCounter) + 1 : 1;
  await AsyncStorage.setItem(counterKey, nextId.toString());
  return nextId;
}

// Funções para membros
export async function initMembersDB(): Promise<void> {
  try {
    const members = await AsyncStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (!members) {
      await AsyncStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error initializing members DB:', error);
    throw error;
  }
}

export async function addMember(member: Omit<Member, 'id'>): Promise<number> {
  try {
    const membersJson = await AsyncStorage.getItem(STORAGE_KEYS.MEMBERS);
    const members: Member[] = membersJson ? JSON.parse(membersJson) : [];
    
    const newId = await getNextId('member');
    const newMember: Member = { ...member, id: newId };
    
    members.push(newMember);
    await AsyncStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    
    return newId;
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
}

export async function getAllMembers(): Promise<Member[]> {
  try {
    const membersJson = await AsyncStorage.getItem(STORAGE_KEYS.MEMBERS);
    const members: Member[] = membersJson ? JSON.parse(membersJson) : [];
    return members.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error getting all members:', error);
    throw error;
  }
}

export async function getMemberById(id: number): Promise<Member | null> {
  try {
    const membersJson = await AsyncStorage.getItem(STORAGE_KEYS.MEMBERS);
    const members: Member[] = membersJson ? JSON.parse(membersJson) : [];
    return members.find(member => member.id === id) || null;
  } catch (error) {
    console.error('Error getting member by id:', error);
    throw error;
  }
}

export async function updateMember(id: number, member: Omit<Member, 'id'>): Promise<void> {
  try {
    const membersJson = await AsyncStorage.getItem(STORAGE_KEYS.MEMBERS);
    const members: Member[] = membersJson ? JSON.parse(membersJson) : [];
    
    const index = members.findIndex(m => m.id === id);
    if (index !== -1) {
      members[index] = { ...member, id };
      await AsyncStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    }
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
}

export async function deleteMember(id: number): Promise<void> {
  try {
    const membersJson = await AsyncStorage.getItem(STORAGE_KEYS.MEMBERS);
    const members: Member[] = membersJson ? JSON.parse(membersJson) : [];
    
    const filteredMembers = members.filter(member => member.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(filteredMembers));
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
}

// Funções para perfil
export async function initProfileDB(): Promise<void> {
  try {
    const profile = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!profile) {
      const defaultProfile: UserProfile = {
        id: 1,
        name: 'Nome do Usuário',
        email: 'usuario@email.com',
        avatar_uri: null
      };
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(defaultProfile));
    }
  } catch (error) {
    console.error('Error initializing profile DB:', error);
    throw error;
  }
}

export async function getProfile(): Promise<UserProfile | null> {
  try {
    const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
    return profileJson ? JSON.parse(profileJson) : null;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
}

export async function updateProfile(data: { name: string; email: string; avatar_uri?: string | null }): Promise<void> {
  try {
    const currentProfile = await getProfile();
    const updatedProfile: UserProfile = {
      id: currentProfile?.id || 1,
      name: data.name,
      email: data.email,
      avatar_uri: data.avatar_uri !== undefined ? data.avatar_uri : currentProfile?.avatar_uri || null
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// Funções para tratamentos
export async function addTreatment(treatment: Omit<Treatment, 'id'>): Promise<number> {
  try {
    const treatmentsJson = await AsyncStorage.getItem(STORAGE_KEYS.TREATMENTS);
    const treatments: Treatment[] = treatmentsJson ? JSON.parse(treatmentsJson) : [];
    
    const newId = await getNextId('treatment');
    const newTreatment: Treatment = { ...treatment, id: newId };
    
    treatments.push(newTreatment);
    await AsyncStorage.setItem(STORAGE_KEYS.TREATMENTS, JSON.stringify(treatments));
    
    return newId;
  } catch (error) {
    console.error('Error adding treatment:', error);
    throw error;
  }
}

export async function getAllTreatments(): Promise<Treatment[]> {
  try {
    const treatmentsJson = await AsyncStorage.getItem(STORAGE_KEYS.TREATMENTS);
    const treatments: Treatment[] = treatmentsJson ? JSON.parse(treatmentsJson) : [];
    return treatments.sort((a, b) => new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime());
  } catch (error) {
    console.error('Error getting all treatments:', error);
    throw error;
  }
}

export async function getTreatmentsByMemberId(memberId: number): Promise<Treatment[]> {
  try {
    const treatmentsJson = await AsyncStorage.getItem(STORAGE_KEYS.TREATMENTS);
    const treatments: Treatment[] = treatmentsJson ? JSON.parse(treatmentsJson) : [];
    return treatments.filter(treatment => treatment.member_id === memberId);
  } catch (error) {
    console.error('Error getting treatments by member id:', error);
    throw error;
  }
}

// Funções para documentos
export async function saveDocument(document: Omit<Document, 'id'>): Promise<number> {
  try {
    const documentsJson = await AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    const documents: Document[] = documentsJson ? JSON.parse(documentsJson) : [];
    
    const newId = await getNextId('document');
    const newDocument: Document = { ...document, id: newId };
    
    documents.push(newDocument);
    await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    
    return newId;
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
}

export async function getDocumentsByMemberId(memberId: number): Promise<Document[]> {
  try {
    const documentsJson = await AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    const documents: Document[] = documentsJson ? JSON.parse(documentsJson) : [];
    return documents.filter(doc => doc.member_id === memberId);
  } catch (error) {
    console.error('Error getting documents by member id:', error);
    throw error;
  }
}

// Função para limpar todos os dados (útil para debug)
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.MEMBERS,
      STORAGE_KEYS.PROFILE,
      STORAGE_KEYS.TREATMENTS,
      STORAGE_KEYS.DOCUMENTS,
      STORAGE_KEYS.SCHEDULE,
      'memberIdCounter',
      'treatmentIdCounter',
      'documentIdCounter'
    ]);
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
} 