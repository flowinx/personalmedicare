// Re-export das funções do novo sistema de memória
export * from './memoryStorage';

// Mantém a interface Document para compatibilidade
export interface Document {
  id?: number;
  member_id: number;
  file_name: string;
  file_uri: string;
  file_type: string;
  analysis_text?: string;
  created_at?: string;
} 