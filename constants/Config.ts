import Constants from 'expo-constants';

export const Config = {
  GROQ_API_KEY: Constants.expoConfig?.extra?.GROQ_API_KEY || '',
  GROQ_API_URL: Constants.expoConfig?.extra?.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions',
}; 