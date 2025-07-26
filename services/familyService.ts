import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';

export interface Family {
  id: string;
  code: string;
  name: string;
  createdBy: string;
  createdAt: Date;
}

export interface FamilyMember {
  userId: string;
  role: 'admin' | 'member';
  name: string;
  email: string;
  joinedAt: Date;
}

export interface CreateFamilyData {
  name: string;
  createdBy: string;
  adminName: string;
  adminEmail: string;
}

export interface JoinFamilyData {
  familyId: string;
  userId: string;
  userName: string;
  userEmail: string;
}

// Gerar código único de 6 caracteres
const generateFamilyCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Verificar se código já existe
const isCodeUnique = async (code: string): Promise<boolean> => {
  try {
    const familiesRef = collection(db, 'families');
    const q = query(familiesRef, where('code', '==', code));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (error) {
    console.error('Erro ao verificar código único:', error);
    return false;
  }
};

// Gerar código único garantido
const generateUniqueCode = async (): Promise<string> => {
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    code = generateFamilyCode();
    isUnique = await isCodeUnique(code);
    attempts++;
  } while (!isUnique && attempts < maxAttempts);

  if (!isUnique) {
    throw new Error('Não foi possível gerar um código único. Tente novamente.');
  }

  return code;
};

// Criar nova família
export const createFamily = async (data: CreateFamilyData): Promise<Family> => {
  try {
    // Verificar se usuário já está em uma família
    const existingFamily = await getUserFamily(data.createdBy);
    if (existingFamily) {
      throw new Error('Você já faz parte de uma família. Saia da família atual primeiro.');
    }

    const familyId = doc(collection(db, 'families')).id;
    const code = await generateUniqueCode();

    const familyData = {
      id: familyId,
      code,
      name: data.name,
      createdBy: data.createdBy,
      createdAt: serverTimestamp(),
    };

    // Criar documento da família
    await setDoc(doc(db, 'families', familyId), familyData);

    // Adicionar criador como admin
    const memberData = {
      userId: data.createdBy,
      role: 'admin' as const,
      name: data.adminName,
      email: data.adminEmail,
      joinedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'family_members', `${familyId}_${data.createdBy}`), {
      familyId,
      ...memberData,
    });

    return {
      ...familyData,
      createdAt: new Date(),
    };
  } catch (error: any) {
    console.error('Erro ao criar família:', error);
    throw new Error(error.message || 'Erro ao criar família');
  }
};

// Buscar família por código
export const getFamilyByCode = async (code: string): Promise<Family | null> => {
  try {
    const familiesRef = collection(db, 'families');
    const q = query(familiesRef, where('code', '==', code));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      code: data.code,
      name: data.name,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Erro ao buscar família por código:', error);
    return null;
  }
};

// Entrar em família
export const joinFamily = async (data: JoinFamilyData): Promise<void> => {
  try {
    // Verificar se usuário já está em uma família
    const existingFamily = await getUserFamily(data.userId);
    if (existingFamily) {
      throw new Error('Você já faz parte de uma família. Saia da família atual primeiro.');
    }

    // Verificar se família existe
    const familyDoc = await getDoc(doc(db, 'families', data.familyId));
    if (!familyDoc.exists()) {
      throw new Error('Família não encontrada');
    }

    // Verificar se usuário já é membro
    const memberDoc = await getDoc(doc(db, 'family_members', `${data.familyId}_${data.userId}`));
    if (memberDoc.exists()) {
      throw new Error('Você já é membro desta família');
    }

    // Adicionar como membro
    const memberData = {
      familyId: data.familyId,
      userId: data.userId,
      role: 'member' as const,
      name: data.userName,
      email: data.userEmail,
      joinedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'family_members', `${data.familyId}_${data.userId}`), memberData);
  } catch (error: any) {
    console.error('Erro ao entrar na família:', error);
    throw new Error(error.message || 'Erro ao entrar na família');
  }
};

// Buscar família do usuário
export const getUserFamily = async (userId: string): Promise<{ family: Family; member: FamilyMember } | null> => {
  try {
    const membersRef = collection(db, 'family_members');
    const q = query(membersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const memberDoc = querySnapshot.docs[0];
    const memberData = memberDoc.data();

    // Buscar dados da família
    const familyDoc = await getDoc(doc(db, 'families', memberData.familyId));
    if (!familyDoc.exists()) {
      return null;
    }

    const familyData = familyDoc.data();

    return {
      family: {
        id: familyDoc.id,
        code: familyData.code,
        name: familyData.name,
        createdBy: familyData.createdBy,
        createdAt: familyData.createdAt?.toDate() || new Date(),
      },
      member: {
        userId: memberData.userId,
        role: memberData.role,
        name: memberData.name,
        email: memberData.email,
        joinedAt: memberData.joinedAt?.toDate() || new Date(),
      }
    };
  } catch (error) {
    console.error('Erro ao buscar família do usuário:', error);
    return null;
  }
};

// Buscar membros da família
export const getFamilyMembers = async (familyId: string): Promise<FamilyMember[]> => {
  try {
    const membersRef = collection(db, 'family_members');
    const q = query(
      membersRef, 
      where('familyId', '==', familyId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
        joinedAt: data.joinedAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Erro ao buscar membros da família:', error);
    return [];
  }
};

// Sair da família
export const leaveFamily = async (familyId: string, userId: string): Promise<void> => {
  try {
    // Verificar se é o último admin
    const members = await getFamilyMembers(familyId);
    const admins = members.filter(m => m.role === 'admin');
    const currentMember = members.find(m => m.userId === userId);

    if (currentMember?.role === 'admin' && admins.length === 1 && members.length > 1) {
      throw new Error('Você é o único administrador. Promova outro membro a administrador antes de sair.');
    }

    // Remover membro
    await deleteDoc(doc(db, 'family_members', `${familyId}_${userId}`));

    // Se era o último membro, deletar família
    const remainingMembers = await getFamilyMembers(familyId);
    if (remainingMembers.length === 0) {
      await deleteDoc(doc(db, 'families', familyId));
    }
  } catch (error: any) {
    console.error('Erro ao sair da família:', error);
    throw new Error(error.message || 'Erro ao sair da família');
  }
};

// Remover membro da família (apenas admin)
export const removeFamilyMember = async (familyId: string, userId: string): Promise<void> => {
  try {
    // Verificar se não é o último admin
    const members = await getFamilyMembers(familyId);
    const admins = members.filter(m => m.role === 'admin');
    const memberToRemove = members.find(m => m.userId === userId);

    if (memberToRemove?.role === 'admin' && admins.length === 1) {
      throw new Error('Não é possível remover o único administrador da família.');
    }

    await deleteDoc(doc(db, 'family_members', `${familyId}_${userId}`));
  } catch (error: any) {
    console.error('Erro ao remover membro:', error);
    throw new Error(error.message || 'Erro ao remover membro');
  }
};

// Gerar novo código da família (apenas admin)
export const generateNewFamilyCode = async (familyId: string): Promise<string> => {
  try {
    const newCode = await generateUniqueCode();
    
    await updateDoc(doc(db, 'families', familyId), {
      code: newCode,
    });

    return newCode;
  } catch (error: any) {
    console.error('Erro ao gerar novo código:', error);
    throw new Error(error.message || 'Erro ao gerar novo código');
  }
};

// Promover membro a admin (apenas admin)
export const promoteMemberToAdmin = async (familyId: string, userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'family_members', `${familyId}_${userId}`), {
      role: 'admin',
    });
  } catch (error: any) {
    console.error('Erro ao promover membro:', error);
    throw new Error(error.message || 'Erro ao promover membro');
  }
};

// Verificar se usuário é admin da família
export const isUserFamilyAdmin = async (familyId: string, userId: string): Promise<boolean> => {
  try {
    const memberDoc = await getDoc(doc(db, 'family_members', `${familyId}_${userId}`));
    if (!memberDoc.exists()) {
      return false;
    }
    
    const memberData = memberDoc.data();
    return memberData.role === 'admin';
  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    return false;
  }
};