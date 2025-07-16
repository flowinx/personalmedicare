// Sistema de armazenamento em memória simples
// Usa localStorage para persistência quando disponível

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

// Dados em memória
let members: Member[] = [];
let profile: UserProfile | null = null;
let treatments: Treatment[] = [];
let documents: Document[] = [];

// Contadores para IDs
let memberIdCounter = 1;
let treatmentIdCounter = 1;
let documentIdCounter = 1;

// Função para salvar dados
function saveData() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('personalmedicare_members', JSON.stringify(members));
      localStorage.setItem('personalmedicare_profile', JSON.stringify(profile));
      localStorage.setItem('personalmedicare_treatments', JSON.stringify(treatments));
      localStorage.setItem('personalmedicare_documents', JSON.stringify(documents));
      localStorage.setItem('personalmedicare_counters', JSON.stringify({
        memberIdCounter,
        treatmentIdCounter,
        documentIdCounter
      }));
      console.log('[MemoryStorage] Data saved successfully');
    }
  } catch (error) {
    console.warn('Could not save to localStorage:', error);
  }
}

// Função para carregar dados
function loadData() {
  try {
    if (typeof localStorage !== 'undefined') {
      const savedMembers = localStorage.getItem('personalmedicare_members');
      const savedProfile = localStorage.getItem('personalmedicare_profile');
      const savedTreatments = localStorage.getItem('personalmedicare_treatments');
      const savedDocuments = localStorage.getItem('personalmedicare_documents');
      const savedCounters = localStorage.getItem('personalmedicare_counters');

      if (savedMembers) members = JSON.parse(savedMembers);
      if (savedProfile) profile = JSON.parse(savedProfile);
      if (savedTreatments) treatments = JSON.parse(savedTreatments);
      if (savedDocuments) documents = JSON.parse(savedDocuments);
      if (savedCounters) {
        const counters = JSON.parse(savedCounters);
        memberIdCounter = counters.memberIdCounter || 1;
        treatmentIdCounter = counters.treatmentIdCounter || 1;
        documentIdCounter = counters.documentIdCounter || 1;
      }
    }
  } catch (error) {
    console.warn('Could not load from localStorage:', error);
  }
}

// Funções para membros
export async function initMembersDB(): Promise<void> {
  try {
    loadData();
    console.log('Memory storage initialized');
  } catch (error) {
    console.error('Error initializing members DB:', error);
    throw error;
  }
}

export async function addMember(member: Omit<Member, 'id'>): Promise<number> {
  try {
    const newId = memberIdCounter++;
    const newMember: Member = { ...member, id: newId };
    
    members.push(newMember);
    saveData();
    
    console.log('Member added successfully:', newMember);
    return newId;
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
}

export async function getAllMembers(): Promise<Member[]> {
  try {
    return members.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error getting all members:', error);
    throw error;
  }
}

export async function getMemberById(id: number): Promise<Member | null> {
  try {
    return members.find(member => member.id === id) || null;
  } catch (error) {
    console.error('Error getting member by id:', error);
    throw error;
  }
}

export async function updateMember(id: number, member: Omit<Member, 'id'>): Promise<void> {
  try {
    const index = members.findIndex(m => m.id === id);
    if (index !== -1) {
      members[index] = { ...member, id };
      saveData();
    }
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
}

export async function deleteMember(id: number): Promise<void> {
  try {
    members = members.filter(member => member.id !== id);
    saveData();
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
}

// Funções para perfil
export async function initProfileDB(): Promise<void> {
  try {
    loadData();
    if (!profile) {
      profile = {
        id: 1,
        name: 'Nome do Usuário',
        email: 'usuario@email.com',
        avatar_uri: null
      };
      saveData();
      console.log('Default profile created');
    } else {
      console.log('Profile loaded from storage:', profile);
    }
  } catch (error) {
    console.error('Error initializing profile DB:', error);
    throw error;
  }
}

export async function getProfile(): Promise<UserProfile | null> {
  try {
    if (!profile) {
      // Se não há perfil, inicializa um padrão
      await initProfileDB();
    }
    console.log('getProfile returning:', profile);
    return profile;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
}

export async function updateProfile(data: { name: string; email: string; avatar_uri?: string | null }): Promise<void> {
  try {
    profile = {
      id: profile?.id || 1,
      name: data.name,
      email: data.email,
      avatar_uri: data.avatar_uri !== undefined ? data.avatar_uri : profile?.avatar_uri || null
    };
    saveData();
    console.log('Profile saved successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// Funções para tratamentos
export async function addTreatment(treatment: Omit<Treatment, 'id'>): Promise<number> {
  try {
    const newId = treatmentIdCounter++;
    const newTreatment: Treatment = { ...treatment, id: newId };
    
    treatments.push(newTreatment);
    saveData();
    
    return newId;
  } catch (error) {
    console.error('Error adding treatment:', error);
    throw error;
  }
}

export async function getAllTreatments(): Promise<Treatment[]> {
  try {
    return treatments.sort((a, b) => new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime());
  } catch (error) {
    console.error('Error getting all treatments:', error);
    throw error;
  }
}

export async function getTreatmentsByMemberId(memberId: number): Promise<Treatment[]> {
  try {
    return treatments.filter(treatment => treatment.member_id === memberId);
  } catch (error) {
    console.error('Error getting treatments by member id:', error);
    throw error;
  }
}

// Funções para documentos
export async function saveDocument(document: Omit<Document, 'id'>): Promise<number> {
  try {
    const newId = documentIdCounter++;
    const newDocument: Document = { ...document, id: newId };
    
    documents.push(newDocument);
    saveData();
    
    return newId;
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
}

export async function getDocumentsByMemberId(memberId: number): Promise<Document[]> {
  try {
    return documents.filter(doc => doc.member_id === memberId);
  } catch (error) {
    console.error('Error getting documents by member id:', error);
    throw error;
  }
}

// Função para limpar todos os dados (útil para debug)
export async function clearAllData(): Promise<void> {
  try {
    members = [];
    profile = null;
    treatments = [];
    documents = [];
    memberIdCounter = 1;
    treatmentIdCounter = 1;
    documentIdCounter = 1;
    
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('personalmedicare_members');
      localStorage.removeItem('personalmedicare_profile');
      localStorage.removeItem('personalmedicare_treatments');
      localStorage.removeItem('personalmedicare_documents');
      localStorage.removeItem('personalmedicare_counters');
    }
    
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
} 