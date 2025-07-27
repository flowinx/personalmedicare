# FarmacinhaScreen - Estrutura Modular

Esta pasta contém a refatoração da tela `FarmacinhaScreen`, que foi dividida em componentes menores e mais gerenciáveis.

## Estrutura de Arquivos

```
FarmacinhaScreen/
├── index.tsx                 # Componente principal (container)
├── types.ts                  # Definições de tipos TypeScript
├── utils/
│   └── dateUtils.ts         # Utilitários para manipulação de datas
├── components/
│   ├── Header.tsx           # Cabeçalho da tela
│   ├── StatsCards.tsx       # Cards de estatísticas (vencidos/vencendo)
│   ├── Dashboard.tsx        # Dashboard com contadores
│   ├── SearchBar.tsx        # Barra de pesquisa
│   ├── FiltersAndSort.tsx   # Filtros e ordenação
│   ├── MedicationList.tsx   # Lista de medicamentos
│   ├── AddEditModal.tsx     # Modal para adicionar/editar medicamentos
│   └── DetailsModal.tsx     # Modal de detalhes do medicamento
└── README.md               # Este arquivo
```

## Componentes

### `index.tsx` (Componente Principal)
- Gerencia o estado global da tela
- Coordena a comunicação entre componentes
- Contém a lógica de negócio principal
- Faz as chamadas para Firebase e API Gemini

### `types.ts`
- Define interfaces TypeScript para:
  - `MedicamentoLocal`: Estrutura do medicamento
  - `FilterType`: Tipos de filtro disponíveis
  - `SortType`: Tipos de ordenação
  - `MedicationCompleteInfo`: Informações da API Gemini

### `utils/dateUtils.ts`
- Funções utilitárias para manipulação de datas:
  - `formatDate()`: Formata data para exibição
  - `isExpired()`: Verifica se medicamento está vencido
  - `isExpiringSoon()`: Verifica se está vencendo em breve
  - `isNearExpiry()`: Verifica proximidade do vencimento

### Componentes de UI

#### `Header.tsx`
- Cabeçalho com gradiente
- Botão de voltar e adicionar medicamento
- Título e subtítulo da tela

#### `StatsCards.tsx`
- Cards de alerta para medicamentos vencidos/vencendo
- Animação com `fadeAnim`
- Só aparece quando há alertas

#### `Dashboard.tsx`
- Painel com estatísticas gerais
- 4 cards: Total, Vencidos, Vencendo, OK
- Ícones coloridos para cada categoria

#### `SearchBar.tsx`
- Barra de pesquisa com ícone
- Input controlado para filtrar medicamentos

#### `FiltersAndSort.tsx`
- Botões de filtro por status (Todos, Ativos, Vencendo, Vencidos)
- Botões de ordenação (Nome, Vencimento, Quantidade)
- Indicadores visuais para filtro/ordenação ativa

#### `MedicationList.tsx`
- Lista principal de medicamentos em formato tabela
- Cabeçalho da tabela
- Renderização de cada item com ações
- Estado vazio quando não há medicamentos
- Pull-to-refresh

#### `AddEditModal.tsx`
- Modal complexo para adicionar/editar medicamentos
- Integração com API Gemini para buscar informações
- Formulário em seções organizadas
- Validação de campos obrigatórios
- Animações personalizadas

#### `DetailsModal.tsx`
- Modal para exibir detalhes completos do medicamento
- Layout organizado em cards
- Indicadores visuais para status de vencimento
- Exibição de observações detalhadas

## Benefícios da Refatoração

1. **Manutenibilidade**: Cada componente tem responsabilidade única
2. **Reutilização**: Componentes podem ser reutilizados em outras telas
3. **Testabilidade**: Componentes menores são mais fáceis de testar
4. **Legibilidade**: Código mais organizado e fácil de entender
5. **Performance**: Componentes podem ser otimizados individualmente
6. **Colaboração**: Diferentes desenvolvedores podem trabalhar em componentes diferentes

## Como Usar

O arquivo `screens/FarmacinhaScreen.tsx` original agora apenas redireciona para `screens/FarmacinhaScreen/index.tsx`, mantendo a compatibilidade com imports existentes:

```typescript
// Ainda funciona normalmente
import FarmacinhaScreen from '../screens/FarmacinhaScreen';
```

## Próximos Passos

1. Adicionar testes unitários para cada componente
2. Implementar memoização com `React.memo()` onde apropriado
3. Adicionar PropTypes ou validação de props mais rigorosa
4. Considerar usar Context API para estado compartilhado
5. Implementar lazy loading para componentes pesados