export interface MedicamentoLocal {
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
  quantidadeMinima?: string;
  ultimoUso?: string;
}

export type FilterType = 'todos' | 'ativos' | 'vencidos' | 'vencendo';
export type SortType = 'nome' | 'vencimento' | 'quantidade';

export interface MedicationCompleteInfo {
  categoria: string;
  unidade: string;
  descricao: string;
  indicacoes: string;
  contraindicacoes: string;
  posologia: string;
  cuidados: string;
}