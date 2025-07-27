// Tipos centralizados para o Firebase
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

// Tipos para uso nas telas (com dados combinados)
export interface TreatmentWithMember extends Treatment {
  member_name: string;
}

export interface MemberWithTreatments extends Member {
  treatments_count: number;
}