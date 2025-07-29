import { GEMINI_API_KEY } from '@env';

export const GeminiConfig = {
  // API Key do Google Gemini
  API_KEY: GEMINI_API_KEY,
  
  // URL base da API do Gemini
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
  
  // Modelo a ser usado
  MODEL: 'gemini-1.5-pro',
}; 