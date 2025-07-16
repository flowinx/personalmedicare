// Re-export das funções do novo sistema de memória
export * from './memoryStorage';

// Mantém a interface UserProfile para compatibilidade
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar_uri: string | null;
} 