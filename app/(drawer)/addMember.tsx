import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AnimatedCard } from '../../components/AnimatedCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { addMember } from '../../db/memoryStorage';
import { useEntranceAnimation } from '../../utils/animations';

export default function AddMemberScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [dob, setDob] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { fadeAnim, slideAnim, scaleAnim, startAnimation } = useEntranceAnimation();

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  // Função para formatar a data automaticamente
  const formatDate = useCallback((text: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = text.replace(/\D/g, '');
    
    // Aplica a máscara DD/MM/AAAA
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
    } else {
      // Limita a 8 dígitos (DD/MM/AAAA)
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  }, []);

  const handleDateChange = useCallback((text: string) => {
    const formatted = formatDate(text);
    setDob(formatted);
  }, [formatDate]);

  const clearForm = useCallback(() => {
    setName('');
    setRelation('');
    setDob('');
    setNotes('');
    setAvatarUri(null);
  }, []);

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim() || !relation.trim()) {
      Alert.alert(t('error'), t('nameAndRelationRequired'));
      return;
    }

    setIsLoading(true);

    try {
      const newMember = await addMember({
        name: name.trim(),
        relation: relation.trim(),
        dob: dob.trim(),
        notes: notes.trim(),
        avatar_uri: avatarUri || undefined,
      });

      Alert.alert(
        t('success'),
        t('memberAddedSuccess'),
        [
          {
            text: 'OK',
            onPress: () => {
              clearForm();
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(t('error'), t('errorSavingData'));
    } finally {
      setIsLoading(false);
    }
  }, [name, relation, dob, notes, avatarUri, router, clearForm, t]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <AnimatedCard delay={100} style={styles.avatarCard}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarButton}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <FontAwesome name="user" size={40} color="#b081ee" />
                </View>
              )}
              <View style={styles.avatarOverlay}>
                <FontAwesome name="camera" size={20} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarText}>{t('touchToAddPhoto')}</Text>
          </View>
        </AnimatedCard>

        <AnimatedCard delay={200} style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('fullName')} *</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="user" size={20} color="#8A8A8A" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('enterFullName')}
                placeholderTextColor="#8A8A8A"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('relation')} *</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="heart" size={20} color="#8A8A8A" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('enterRelation')}
                placeholderTextColor="#8A8A8A"
                value={relation}
                onChangeText={setRelation}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('birthDate')}</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="calendar" size={20} color="#8A8A8A" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('enterBirthDate')}
                placeholderTextColor="#8A8A8A"
                value={dob}
                onChangeText={handleDateChange}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('notes')}</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <FontAwesome name="sticky-note" size={20} color="#8A8A8A" style={styles.textAreaIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('additionalInfo')}
                placeholderTextColor="#8A8A8A"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </AnimatedCard>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t('save')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarCard: {
    marginBottom: 20,
    padding: 0,
  },
  avatarContainer: {
    alignItems: 'center',
    padding: 20,
  },
  avatarButton: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#b081ee',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0eaff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#b081ee',
    borderStyle: 'dashed',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#b081ee',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarText: {
    color: '#8A8A8A',
    fontSize: 14,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 20,
    padding: 0,
  },
  inputContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 8,
  },
  textAreaIcon: {
    marginRight: 12,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#b081ee',
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#b081ee',
  },
  saveButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
}); 