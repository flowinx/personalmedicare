import { GROQ_API_KEY } from '@env';

export const GroqConfig = {
  // API Key do Groq
  API_KEY: GROQ_API_KEY,
  
  // URL base da API do Groq
  BASE_URL: 'https://api.groq.com/openai/v1/chat/completions',
  
  // Modelo a ser usado (Groq tem modelos muito rápidos)
  MODEL: 'llama-3.1-8b-instant', // Modelo rápido e atual
  
  // Configurações padrão
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
};