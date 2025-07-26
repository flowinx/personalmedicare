import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

interface LanguageScreenProps {
  navigation: any;
}

type LanguageCode = 'pt' | 'en';

interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    region: 'Brasil'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    region: 'United States'
  }
];

// Traduções básicas para a interface
const translations = {
  pt: {
    title: 'Idioma',
    currentLanguage: 'Idioma Atual',
    selectLanguage: 'Selecionar Idioma',
    systemLanguage: 'Idioma do Sistema',
    systemLanguageText: 'Seu dispositivo está configurado para',
    changeSuccess: 'Idioma Alterado',
    changeSuccessMessage: 'Idioma alterado com sucesso!\n\nReinicie o app para ver todas as mudanças.',
    changeError: 'Erro',
    changeErrorMessage: 'Não foi possível alterar o idioma. Tente novamente.',
    benefits: '💡 Benefícios da Localização',
    benefitInterface: '• Interface completamente traduzida',
    benefitTerms: '• Termos médicos em seu idioma',
    benefitDates: '• Formatos de data e hora locais',
    benefitNumbers: '• Formatação de números regional',
    resetButton: 'Restaurar Idioma do Sistema',
    loading: 'Carregando...',
    ok: 'OK'
  },
  en: {
    title: 'Language',
    currentLanguage: 'Current Language',
    selectLanguage: 'Select Language',
    systemLanguage: 'System Language',
    systemLanguageText: 'Your device is configured for',
    changeSuccess: 'Language Changed',
    changeSuccessMessage: 'Language changed successfully!\n\nRestart the app to see all changes.',
    changeError: 'Error',
    changeErrorMessage: 'Could not change language. Please try again.',
    benefits: '💡 Localization Benefits',
    benefitInterface: '• Completely translated interface',
    benefitTerms: '• Medical terms in your language',
    benefitDates: '• Local date and time formats',
    benefitNumbers: '• Regional number formatting',
    resetButton: 'Restore System Language',
    loading: 'Loading...',
    ok: 'OK'
  }
};

export default function LanguageScreen({ navigation }: LanguageScreenProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('pt');
  const [systemLanguage, setSystemLanguage] = useState<LanguageCode>('pt');
  const [loading, setLoading] = useState(false);

  // Obter traduções baseadas no idioma selecionado
  const t = translations[selectedLanguage];

  useEffect(() => {
    loadLanguageSettings();
    detectSystemLanguage();
  }, []);

  const loadLanguageSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && (savedLanguage === 'pt' || savedLanguage === 'en')) {
        setSelectedLanguage(savedLanguage as LanguageCode);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de idioma:', error);
    }
  };

  const detectSystemLanguage = () => {
    try {
      let systemLocale = 'en';
      
      if (Platform.OS === 'ios') {
        systemLocale = NativeModules.SettingsManager?.settings?.AppleLocale || 
                      NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] || 'en';
      } else {
        systemLocale = NativeModules.I18nManager?.localeIdentifier || 'en';
      }
      
      const systemLang = systemLocale.toLowerCase().startsWith('pt') ? 'pt' : 'en';
      setSystemLanguage(systemLang);
    } catch (error) {
      console.log('Erro ao detectar idioma do sistema, usando padrão:', error);
      setSystemLanguage('pt'); // Padrão para português
    }
  };

  const saveLanguageSettings = async (language: LanguageCode) => {
    try {
      await AsyncStorage.setItem('app_language', language);
    } catch (error) {
      console.error('Erro ao salvar configurações de idioma:', error);
    }
  };

  const handleLanguageChange = async (language: LanguageCode) => {
    setLoading(true);
    try {
      const oldLanguage = selectedLanguage;
      setSelectedLanguage(language);
      await saveLanguageSettings(language);
      
      // Usar traduções do novo idioma para o alerta
      const newTranslations = translations[language];
      
      Alert.alert(
        newTranslations.changeSuccess,
        newTranslations.changeSuccessMessage,
        [{ text: newTranslations.ok }]
      );
    } catch (error) {
      Alert.alert(t.changeError, t.changeErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetToSystem = () => {
    handleLanguageChange(systemLanguage);
  };

  const getCurrentLanguageDisplay = (): string => {
    const current = LANGUAGE_OPTIONS.find(lang => lang.code === selectedLanguage);
    return current ? `${current.flag} ${current.nativeName}` : '🇧🇷 Português';
  };

  const getSystemLanguageDisplay = (): string => {
    const system = LANGUAGE_OPTIONS.find(lang => lang.code === systemLanguage);
    return system ? `${system.flag} ${system.nativeName}` : '🇧🇷 Português';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b081ee" />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Current Language Card */}
          <View style={styles.currentLanguageCard}>
            <View style={styles.currentLanguageHeader}>
              <Ionicons name="language" size={24} color="#b081ee" />
              <View style={styles.currentLanguageInfo}>
                <Text style={styles.currentLanguageTitle}>{t.currentLanguage}</Text>
                <Text style={styles.currentLanguageValue}>
                  {getCurrentLanguageDisplay()}
                </Text>
              </View>
            </View>
          </View>

          {/* Language Options */}
          <View style={styles.optionsCard}>
            <Text style={styles.optionsTitle}>{t.selectLanguage}</Text>
            
            {LANGUAGE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.code}
                style={styles.optionItem}
                onPress={() => handleLanguageChange(option.code)}
                disabled={loading}
              >
                <View style={styles.optionLeft}>
                  <Text style={styles.optionFlag}>{option.flag}</Text>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>{option.nativeName}</Text>
                    <Text style={styles.optionSubtitle}>
                      {option.name} • {option.region}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.optionRight}>
                  {selectedLanguage === option.code && (
                    <Ionicons name="checkmark-circle" size={20} color="#b081ee" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* System Language Info */}
          <View style={styles.systemInfoCard}>
            <View style={styles.systemInfoHeader}>
              <Ionicons name="phone-portrait" size={20} color="#b081ee" />
              <Text style={styles.systemInfoTitle}>{t.systemLanguage}</Text>
            </View>
            <Text style={styles.systemInfoText}>
              {t.systemLanguageText} {getSystemLanguageDisplay()}.
            </Text>
          </View>

          {/* Benefits Card */}
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>{t.benefits}</Text>
            <Text style={styles.benefitText}>{t.benefitInterface}</Text>
            <Text style={styles.benefitText}>{t.benefitTerms}</Text>
            <Text style={styles.benefitText}>{t.benefitDates}</Text>
            <Text style={styles.benefitText}>{t.benefitNumbers}</Text>
          </View>

          {/* Language Examples */}
          <View style={styles.examplesCard}>
            <Text style={styles.examplesTitle}>
              {selectedLanguage === 'pt' ? '📋 Exemplos' : '📋 Examples'}
            </Text>
            
            <View style={styles.exampleSection}>
              <Text style={styles.exampleCategory}>
                {selectedLanguage === 'pt' ? 'Datas:' : 'Dates:'}
              </Text>
              <Text style={styles.exampleText}>
                {selectedLanguage === 'pt' ? '15/01/2024 • 14:30' : '01/15/2024 • 2:30 PM'}
              </Text>
            </View>

            <View style={styles.exampleSection}>
              <Text style={styles.exampleCategory}>
                {selectedLanguage === 'pt' ? 'Números:' : 'Numbers:'}
              </Text>
              <Text style={styles.exampleText}>
                {selectedLanguage === 'pt' ? '1.234,56' : '1,234.56'}
              </Text>
            </View>

            <View style={styles.exampleSection}>
              <Text style={styles.exampleCategory}>
                {selectedLanguage === 'pt' ? 'Interface:' : 'Interface:'}
              </Text>
              <Text style={styles.exampleText}>
                {selectedLanguage === 'pt' ? 'Adicionar Tratamento' : 'Add Treatment'}
              </Text>
            </View>
          </View>

          {/* Reset Button */}
          {selectedLanguage !== systemLanguage && (
            <View style={styles.resetCard}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetToSystem}
              >
                <Ionicons name="refresh" size={20} color="#666" />
                <Text style={styles.resetButtonText}>{t.resetButton}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Implementation Note */}
          <View style={styles.noteCard}>
            <Ionicons name="information-circle" size={20} color="#FF9500" />
            <Text style={styles.noteText}>
              {selectedLanguage === 'pt' 
                ? 'Esta é uma implementação básica. Em produção, seria integrada com bibliotecas como react-i18next para tradução completa do app.'
                : 'This is a basic implementation. In production, it would be integrated with libraries like react-i18next for complete app translation.'
              }
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  currentLanguageCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currentLanguageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentLanguageInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currentLanguageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  currentLanguageValue: {
    fontSize: 14,
    color: '#666',
  },
  optionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionFlag: {
    fontSize: 32,
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  optionRight: {
    marginLeft: 12,
  },
  systemInfoCard: {
    backgroundColor: '#f0eaff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  systemInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  systemInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  systemInfoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  benefitsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  examplesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  exampleSection: {
    marginBottom: 12,
  },
  exampleCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b081ee',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  resetCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  noteCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  noteText: {
    fontSize: 12,
    color: '#B45309',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});