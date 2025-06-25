import { Ionicons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useThemeColor } from '../../hooks/useThemeColor';
import { ThemeContext } from '../../theme/ThemeContext';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { colorScheme, setColorScheme } = useContext(ThemeContext);
  const darkTheme = colorScheme === 'dark';
  const iconColor = useThemeColor({}, 'icon');

  const handleThemeSwitch = (value: boolean) => {
    setColorScheme(value ? 'dark' : 'light');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <ThemedText style={styles.title}>Configurações</ThemedText>

          <View style={styles.section}>
            <Ionicons name="language-outline" size={24} color={iconColor} style={styles.icon} />
            <ThemedText style={styles.label}>Idioma</ThemedText>
            <TouchableOpacity style={styles.optionButton}>
              <ThemedText style={styles.optionText} lightColor="#2d1155" darkColor="#2d1155">Português (Brasil)</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Ionicons name="notifications-outline" size={24} color={iconColor} style={styles.icon} />
            <ThemedText style={styles.label}>Notificações</ThemedText>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              thumbColor={notificationsEnabled ? '#b081ee' : '#ccc'}
              trackColor={{ true: '#e6e0ff', false: '#ccc' }}
            />
          </View>

          <View style={styles.section}>
            <Ionicons name="moon-outline" size={24} color={iconColor} style={styles.icon} />
            <ThemedText style={styles.label}>Tema Escuro</ThemedText>
            <Switch
              value={darkTheme}
              onValueChange={handleThemeSwitch}
              thumbColor={darkTheme ? '#b081ee' : '#ccc'}
              trackColor={{ true: '#e6e0ff', false: '#ccc' }}
            />
          </View>

          <View style={styles.section}>
            <Ionicons name="information-circle-outline" size={24} color={iconColor} style={styles.icon} />
            <TouchableOpacity style={styles.optionButton}>
              <ThemedText style={styles.optionText} lightColor="#2d1155" darkColor="#2d1155">Sobre o App</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Ionicons name="document-text-outline" size={24} color={iconColor} style={styles.icon} />
            <TouchableOpacity style={styles.optionButton}>
              <ThemedText style={styles.optionText} lightColor="#2d1155" darkColor="#2d1155">Política de Privacidade</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Ionicons name="log-out-outline" size={24} color={iconColor} style={styles.icon} />
            <TouchableOpacity style={styles.optionButton}>
              <ThemedText style={[styles.optionText, { fontWeight: 'bold' }]} lightColor="#b081ee" darkColor="#b081ee">Sair</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  optionText: {
    fontSize: 16,
  },
}); 