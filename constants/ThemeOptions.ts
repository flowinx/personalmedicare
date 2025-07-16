/**
 * Opções de temas escuros para o aplicativo
 * Você pode escolher qual tema usar editando o arquivo Colors.ts
 */

export const DarkThemeOptions = {
  // Opção 1: Cinza Escuro Suave (Recomendado)
  // Cores neutras e modernas, muito agradável aos olhos
  gray: {
    text: '#E8E8E8',
    background: '#1A1A1A',
    tint: '#b081ee',
    icon: '#B0B0B0',
    tabIconDefault: '#B0B0B0',
    tabIconSelected: '#b081ee',
  },

  // Opção 2: Azul Escuro
  // Tema com tons azulados, mais frio
  blue: {
    text: '#E8E8E8',
    background: '#0F1419',
    tint: '#b081ee',
    icon: '#B0B0B0',
    tabIconDefault: '#B0B0B0',
    tabIconSelected: '#b081ee',
  },

  // Opção 3: Verde Escuro
  // Tema com tons esverdeados, mais natural
  green: {
    text: '#E8E8E8',
    background: '#0F1A0F',
    tint: '#b081ee',
    icon: '#B0B0B0',
    tabIconDefault: '#B0B0B0',
    tabIconSelected: '#b081ee',
  },

  // Opção 4: Roxo Escuro Suave
  // Mantém a identidade roxa do app, mas mais suave
  purple: {
    text: '#E8E8E8',
    background: '#1A1620',
    tint: '#b081ee',
    icon: '#B0B0B0',
    tabIconDefault: '#B0B0B0',
    tabIconSelected: '#b081ee',
  },

  // Opção 5: Carbon (Muito Escuro)
  // Tema extremamente escuro, estilo "OLED"
  carbon: {
    text: '#FFFFFF',
    background: '#000000',
    tint: '#b081ee',
    icon: '#CCCCCC',
    tabIconDefault: '#CCCCCC',
    tabIconSelected: '#b081ee',
  },

  // Opção 6: Warm Dark
  // Tema escuro com tons quentes
  warm: {
    text: '#F5F5F5',
    background: '#1C1C1C',
    tint: '#b081ee',
    icon: '#D4D4D4',
    tabIconDefault: '#D4D4D4',
    tabIconSelected: '#b081ee',
  },
};

/**
 * Para usar um tema específico:
 * 1. Escolha uma das opções acima
 * 2. Vá para constants/Colors.ts
 * 3. Substitua as cores do tema dark pela opção escolhida
 * 
 * Exemplo para usar o tema azul:
 * 
 * dark: {
 *   text: '#E8E8E8',
 *   background: '#0F1419',
 *   tint: '#b081ee',
 *   icon: '#B0B0B0',
 *   tabIconDefault: '#B0B0B0',
 *   tabIconSelected: '#b081ee',
 * }
 */ 