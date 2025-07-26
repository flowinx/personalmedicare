import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Appearance,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeScreenProps {
  navigation: any;
}

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeOption {
  id: ThemeMode;
  title: string;
  subtitle: string;
  icon: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'light',
    title: 'Claro',
    subtitle: 'Interface clara com fundo branco',
    icon: 'sunny'
  },
  {
    id: 'dark',
    title: 'Escuro',
    subtitle: 'Interface escura para reduzir cansaço visual',
    icon: 'moon'
  },
  {
    id: 'auto',
    title: 'Automático',
    subtitle: 'Segue as configurações do sistema',
    icon: 'phone-portrait'
  }
];

export default function ThemeScreen({ navigation }: ThemeScreenProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>('light');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadThemeSettings();
    
    // Detectar tema do sistema
    const colorScheme = Appearance.getColorScheme();
    setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light');

    // Listener para mudanças no tema do sistema
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light');
    });

    return () => subscription?.remove();
  }, []);

  const loadThemeSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme) {
        setSelectedTheme(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de tema:', error);
    }
  };

  const saveThemeSettings = async (theme: ThemeMode) => {
    try {
      await AsyncStorage.setItem('app_theme', theme);
    } catch (error) {
      console.error('Erro ao salvar configurações de tema:', error);
    }
  };

  const handleThemeChange = async (theme: ThemeMode) => {
    setLoading(true);
    try {
      setSelectedTheme(theme);
      await saveThemeSettings(theme);
      
      // Simular aplicação do tema (em produção, seria aplicado globalmente)
      Alert.alert(
        'Tema Alterado',
        `Tema ${THEME_OPTIONS.find(t => t.id === theme)?.title} aplicado com sucesso!\n\nReinicie o app para ver todas as mudanças.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar o tema. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentThemeDisplay = (): string => {
    if (selectedTheme === 'auto') {
      return `Automático (${systemTheme === 'dark' ? 'Escuro' : 'Claro'})`;
    }
    return THEME_OPTIONS.find(t => t.id === selectedTheme)?.title || 'Claro';
  };

  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (selectedTheme === 'auto') {
      return systemTheme;
    }
    return selectedTheme === 'dark' ? 'dark' : 'light';
  };

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  // Cores dinâmicas baseadas no tema efetivo
  const effectiveTheme = previewMode ? (getEffectiveTheme() === 'dark' ? 'light' : 'dark') : getEffectiveTheme();
  const isDark = effectiveTheme === 'dark';

  const dynamicStyles = {
    container: {
      backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
    },
    header: {
      backgroundColor: isDark ? '#2d2d2d' : '#fff',
      borderBottomColor: isDark ? '#404040' : '#e9ecef',
    },
    headerTitle: {
      color: isDark ? '#fff' : '#333',
    },
    backButton: {
      backgroundColor: isDark ? '#404040' : '#f8f9fa',
    },
    backIcon: {
      color: isDark ? '#fff' : '#333',
    },
    card: {
      backgroundColor: isDark ? '#2d2d2d' : '#fff',
    },
    cardTitle: {
      color: isDark ? '#fff' : '#333',
    },
    cardText: {
      color: isDark ? '#ccc' : '#666',
    },
    optionItem: {
      borderBottomColor: isDark ? '#404040' : '#f1f3f4',
    },
    optionTitle: {
      color: isDark ? '#fff' : '#333',
    },
    optionSubtitle: {
      color: isDark ? '#ccc' : '#666',
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity 
          style={[styles.backButton, dynamicStyles.backButton]} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={dynamicStyles.backIcon.color} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Tema</Text>
        <TouchableOpacity 
          style={[styles.backButton, dynamicStyles.backButton]} 
          onPress={togglePreviewMode}
        >
          <Ionicons name="eye" size={24} color={dynamicStyles.backIcon.color} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Current Theme Card */}
          <View style={[styles.currentThemeCard, dynamicStyles.card]}>
            <View style={styles.currentThemeHeader}>
              <Ionicons name="palette" size={24} color="#b081ee" />
              <View style={styles.currentThemeInfo}>
                <Text style={[styles.currentThemeTitle, dynamicStyles.cardTitle]}>Tema Atual</Text>
                <Text style={[styles.currentThemeValue, dynamicStyles.cardText]}>
                  {getCurrentThemeDisplay()}
                </Text>
              </View>
              {previewMode && (
                <View style={styles.previewBadge}>
                  <Text style={styles.previewText}>Preview</Text>
                </View>
              )}
            </View>
          </View>

          {/* Theme Options */}
          <View style={[styles.optionsCard, dynamicStyles.card]}>
            <Text style={[styles.optionsTitle, dynamicStyles.cardTitle]}>Escolher Tema</Text>
            
            {THEME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionItem, dynamicStyles.optionItem]}
                onPress={() => handleThemeChange(option.id)}
                disabled={loading}
              >
                <View style={styles.optionLeft}>
                  <View style={[
                    styles.optionIcon,
                    { backgroundColor: selectedTheme === option.id ? '#b081ee' : (isDark ? '#404040' : '#f8f9fa') }
                  ]}>
                    <Ionicons 
                      name={option.icon as any} 
                      size={20} 
                      color={selectedTheme === option.id ? '#fff' : '#b081ee'} 
                    />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, dynamicStyles.optionTitle]}>{option.title}</Text>
                    <Text style={[styles.optionSubtitle, dynamicStyles.optionSubtitle]}>{option.subtitle}</Text>
                  </View>
                </View>
                
                <View style={styles.optionRight}>
                  {selectedTheme === option.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#b081ee" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* System Theme Info */}
          <View style={[styles.systemInfoCard, dynamicStyles.card]}>
            <View style={styles.systemInfoHeader}>
              <Ionicons name="information-circle" size={20} color="#b081ee" />
              <Text style={[styles.systemInfoTitle, dynamicStyles.cardTitle]}>Tema do Sistema</Text>
            </View>
            <Text style={[styles.systemInfoText, dynamicStyles.cardText]}>
              Seu dispositivo está configurado para o tema {systemTheme === 'dark' ? 'escuro' : 'claro'}. 
              {selectedTheme === 'auto' && ' O app seguirá automaticamente esta configuração.'}
            </Text>
          </View>

          {/* Benefits Card */}
          <View style={[styles.benefitsCard, dynamicStyles.card]}>
            <Text style={[styles.benefitsTitle, dynamicStyles.cardTitle]}>💡 Benefícios dos Temas</Text>
            
            <View style={styles.benefitSection}>
              <View style={styles.benefitHeader}>
                <Ionicons name="sunny" size={16} color="#FF9500" />
                <Text style={[styles.benefitSectionTitle, dynamicStyles.cardTitle]}>Tema Claro</Text>
              </View>
              <Text style={[styles.benefitText, dynamicStyles.cardText]}>
                • Melhor legibilidade em ambientes bem iluminados{'\n'}
                • Interface familiar e tradicional{'\n'}
                • Ideal para uso durante o dia
              </Text>
            </View>

            <View style={styles.benefitSection}>
              <View style={styles.benefitHeader}>
                <Ionicons name="moon" size={16} color="#b081ee" />
                <Text style={[styles.benefitSectionTitle, dynamicStyles.cardTitle]}>Tema Escuro</Text>
              </View>
              <Text style={[styles.benefitText, dynamicStyles.cardText]}>
                • Reduz cansaço visual em ambientes escuros{'\n'}
                • Economiza bateria em telas OLED{'\n'}
                • Ideal para uso noturno
              </Text>
            </View>

            <View style={styles.benefitSection}>
              <View style={styles.benefitHeader}>
                <Ionicons name="phone-portrait" size={16} color="#34C759" />
                <Text style={[styles.benefitSectionTitle, dynamicStyles.cardTitle]}>Automático</Text>
              </View>
              <Text style={[styles.benefitText, dynamicStyles.cardText]}>
                • Muda automaticamente com o sistema{'\n'}
                • Adapta-se ao horário do dia{'\n'}
                • Experiência consistente com outros apps
              </Text>
            </View>
          </View>

          {/* Preview Toggle */}
          <View style={[styles.previewCard, dynamicStyles.card]}>
            <View style={styles.previewHeader}>
              <View style={styles.previewInfo}>
                <Text style={[styles.previewTitle, dynamicStyles.cardTitle]}>Modo Preview</Text>
                <Text style={[styles.previewSubtitle, dynamicStyles.cardText]}>
                  Visualizar como ficaria o tema oposto
                </Text>
              </View>
              <Switch
                value={previewMode}
                onValueChange={togglePreviewMode}
                trackColor={{ false: '#767577', true: '#b081ee' }}
                thumbColor={previewMode ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Reset Card */}
          <View style={[styles.resetCard, dynamicStyles.card]}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => handleThemeChange('light')}
            >
              <Ionicons name="refresh" size={20} color="#666" />
              <Text style={styles.resetButtonText}>Restaurar Tema Padrão</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  currentThemeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currentThemeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentThemeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currentThemeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  currentThemeValue: {
    fontSize: 14,
  },
  previewBadge: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  previewText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  optionsCard: {
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
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
  },
  optionRight: {
    marginLeft: 12,
  },
  systemInfoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  systemInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  systemInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  systemInfoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  benefitsCard: {
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
    marginBottom: 16,
  },
  benefitSection: {
    marginBottom: 16,
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  benefitText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 24,
  },
  previewCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 14,
  },
  resetCard: {
    borderRadius: 16,
    padding: 20,
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
});