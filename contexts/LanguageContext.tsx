import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, Translations, translations } from '../constants/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

// Função para verificar se o AsyncStorage está disponível
const isAsyncStorageAvailable = async (): Promise<boolean> => {
  try {
    await AsyncStorage.setItem('test', 'test');
    await AsyncStorage.removeItem('test');
    return true;
  } catch (error) {
    console.warn('AsyncStorage not available:', error);
    return false;
  }
};

// Função para salvar idioma com fallback
const saveLanguage = async (language: Language, storageAvailable: boolean): Promise<void> => {
  try {
    if (storageAvailable) {
      await AsyncStorage.setItem('app_language', language);
    } else if (typeof localStorage !== 'undefined') {
      // Fallback para localStorage (web)
      localStorage.setItem('app_language', language);
    }
  } catch (error) {
    console.warn('Could not save language:', error);
  }
};

// Função para carregar idioma com fallback
const loadLanguage = async (storageAvailable: boolean): Promise<Language | null> => {
  try {
    if (storageAvailable) {
      return await AsyncStorage.getItem('app_language') as Language | null;
    } else if (typeof localStorage !== 'undefined') {
      // Fallback para localStorage (web)
      return localStorage.getItem('app_language') as Language | null;
    }
  } catch (error) {
    console.warn('Could not load language:', error);
  }
  return null;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt-BR');
  const [isInitialized, setIsInitialized] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(false);

  useEffect(() => {
    initializeLanguage();
  }, []);

  const initializeLanguage = async () => {
    try {
      // Verifica se o AsyncStorage está disponível
      const isAvailable = await isAsyncStorageAvailable();
      setStorageAvailable(isAvailable);

      const savedLanguage = await loadLanguage(isAvailable);
      if (savedLanguage && (savedLanguage === 'pt-BR' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.warn('Could not initialize language storage, using default (pt-BR):', error);
      setLanguageState('pt-BR');
    } finally {
      setIsInitialized(true);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      setLanguageState(newLanguage);
      await saveLanguage(newLanguage, storageAvailable);
    } catch (error) {
      console.warn('Could not save language to storage:', error);
      // Mesmo que não consiga salvar, atualiza o estado local
      setLanguageState(newLanguage);
    }
  };

  const t = (key: keyof Translations): string => {
    // Garante que sempre retorna uma string válida
    const translation = translations[language]?.[key];
    if (translation) {
      return translation;
    }
    
    // Fallback para o idioma padrão se a chave não existir
    const fallbackTranslation = translations['pt-BR']?.[key];
    if (fallbackTranslation) {
      return fallbackTranslation;
    }
    
    // Último fallback: retorna a chave como string
    console.warn(`Translation key not found: ${key}`);
    return key as string;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  // Só renderiza os filhos quando a inicialização estiver completa
  if (!isInitialized) {
    return null; // ou um loading spinner se preferir
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 