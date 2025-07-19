import { Ionicons } from '@expo/vector-icons';
import { useContext, useEffect, useState } from 'react';
import { Alert, Animated, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Language } from '../../constants/translations';
import { useLanguage } from '../../contexts/LanguageContext';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
import { ThemeContext } from '../../theme/ThemeContext';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const { colorScheme, setColorScheme } = useContext(ThemeContext);
  const { language, setLanguage, t } = useLanguage();
  const darkTheme = colorScheme === 'dark';
  const { fadeAnim, slideAnim, scaleAnim, startAnimation } = useEntranceAnimation();

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  const handleThemeSwitch = (value: boolean) => {
    setColorScheme(value ? 'dark' : 'light');
  };

  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    setLanguageModalVisible(false);
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      'Tem certeza que deseja sair?',
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('logout'), style: 'destructive' },
      ]
    );
  };

  const LanguageModal = () => (
    <Modal
      visible={languageModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setLanguageModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle} lightColor="#2d1155" darkColor="#2d1155">
              {t('language')}
            </ThemedText>
            <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
              <Ionicons name="close" size={24} color="#8A8A8A" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.languageOption, language === 'pt-BR' && styles.selectedLanguage]}
            onPress={() => handleLanguageSelect('pt-BR')}
          >
            <ThemedText style={[styles.languageText, language === 'pt-BR' && styles.selectedLanguageText]}>
              {t('portuguese')}
            </ThemedText>
            {language === 'pt-BR' && <Ionicons name="checkmark" size={20} color="#b081ee" />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.languageOption, language === 'en' && styles.selectedLanguage]}
            onPress={() => handleLanguageSelect('en')}
          >
            <ThemedText style={[styles.languageText, language === 'en' && styles.selectedLanguageText]}>
              {t('english')}
            </ThemedText>
            {language === 'en' && <Ionicons name="checkmark" size={20} color="#b081ee" />}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ThemedView style={styles.container}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}
        >
          {/* Header Card */}
          <Animated.View style={[styles.headerCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Ionicons name="settings-outline" size={28} color="#2d1155" style={styles.headerIcon} />
            <ThemedText style={styles.headerTitle} lightColor="#2d1155" darkColor="#2d1155">{t('settings')}</ThemedText>
          </Animated.View>

          {/* General Settings Card */}
          <Animated.View style={[styles.settingsCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <ThemedText style={styles.cardTitle} lightColor="#2d1155" darkColor="#2d1155">{t('general')}</ThemedText>
            
            <TouchableOpacity style={styles.settingItem} onPress={() => setLanguageModalVisible(true)}>
              <View style={styles.settingLeft}>
                <Ionicons name="language-outline" size={20} color="#8A8A8A" style={styles.settingIcon} />
                <ThemedText style={styles.settingLabel} lightColor="#2d1155" darkColor="#2d1155">{t('language')}</ThemedText>
              </View>
              <View style={styles.optionButton}>
                <ThemedText style={styles.optionText} lightColor="#2d1155" darkColor="#2d1155">
                  {language === 'pt-BR' ? t('portuguese') : t('english')}
                </ThemedText>
                <Ionicons name="chevron-forward" size={16} color="#8A8A8A" />
              </View>
            </TouchableOpacity>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={20} color="#8A8A8A" style={styles.settingIcon} />
                <ThemedText style={styles.settingLabel} lightColor="#2d1155" darkColor="#2d1155">{t('notifications')}</ThemedText>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                thumbColor={notificationsEnabled ? '#7f53ac' : '#ccc'}
                trackColor={{ true: '#e6e0ff', false: '#f0f0f0' }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="moon-outline" size={20} color="#8A8A8A" style={styles.settingIcon} />
                <ThemedText style={styles.settingLabel} lightColor="#2d1155" darkColor="#2d1155">{t('darkTheme')}</ThemedText>
              </View>
              <Switch
                value={darkTheme}
                onValueChange={handleThemeSwitch}
                thumbColor={darkTheme ? '#7f53ac' : '#ccc'}
                trackColor={{ true: '#e6e0ff', false: '#f0f0f0' }}
              />
            </View>
          </Animated.View>

          {/* Information Card */}
          <Animated.View style={[styles.settingsCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <ThemedText style={styles.cardTitle} lightColor="#2d1155" darkColor="#2d1155">{t('information')}</ThemedText>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle-outline" size={20} color="#8A8A8A" style={styles.settingIcon} />
                <ThemedText style={styles.settingLabel} lightColor="#2d1155" darkColor="#2d1155">{t('aboutApp')}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#8A8A8A" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="document-text-outline" size={20} color="#8A8A8A" style={styles.settingIcon} />
                <ThemedText style={styles.settingLabel} lightColor="#2d1155" darkColor="#2d1155">{t('privacyPolicy')}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#8A8A8A" />
            </TouchableOpacity>
          </Animated.View>

          {/* Logout Card */}
          <Animated.View style={[styles.logoutCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.logoutIcon} />
              <ThemedText style={styles.logoutText} lightColor="#fff" darkColor="#fff">{t('logout')}</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
        
        <LanguageModal />
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  optionText: {
    fontSize: 14,
    marginRight: 4,
  },
  logoutCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4757',
    borderRadius: 8,
    padding: 16,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
  },
  selectedLanguage: {
    backgroundColor: '#f0eaff',
    borderWidth: 1,
    borderColor: '#b081ee',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedLanguageText: {
    color: '#b081ee',
    fontWeight: '600',
  },
}); 