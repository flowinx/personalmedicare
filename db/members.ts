// Re-export das funções do novo sistema de memória
export * from './memoryStorage';

// Mantém a interface Member para compatibilidade
export interface Member {
  id?: number;
  name: string;
  relation: string;
  dob: string;
  notes?: string;
  avatar_uri?: string;
} 