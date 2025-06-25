import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { addMember } from '../../db/members';

export default function AddMemberScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [dob, setDob] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua galeria de fotos.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  // Função para aplicar máscara de data DD/MM/AAAA
  function maskDate(value: string) {
    let cleaned = value.replace(/\D/g, '');
    let masked = '';
    if (cleaned.length > 0) masked = cleaned.substring(0, 2);
    if (cleaned.length >= 3) masked += '/' + cleaned.substring(2, 4);
    if (cleaned.length >= 5) masked += '/' + cleaned.substring(4, 8);
    return masked;
  }

  function handleDobChange(text: string) {
    setDob(maskDate(text));
  }

  const handleAddMember = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome do membro é obrigatório.');
      return;
    }

    try {
      await addMember({
        name,
        relation,
        dob,
        notes,
        avatar_uri: avatarUri ? avatarUri : null
      });
      Alert.alert('Sucesso', 'Novo membro adicionado!');
      router.back();
    } catch (error) {
      console.error('Failed to add member:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o membro.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      setName('');
      setRelation('');
      setDob('');
      setNotes('');
      setAvatarUri(null);
    }, [])
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
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <ThemedText style={styles.title}>Novo Membro</ThemedText>
          
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="camera" size={40} color="#b081ee" />
              </View>
            )}
            <ThemedText style={styles.avatarText} lightColor="#b081ee" darkColor="#b081ee">Adicionar Foto</ThemedText>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Nome Completo</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Nome do membro da família"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Parentesco</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Pai, Mãe, Filho(a), etc."
              value={relation}
              onChangeText={setRelation}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Data de Nascimento</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              value={dob}
              onChangeText={handleDobChange}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Observações</ThemedText>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Alergias, condições pré-existentes, etc."
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
                <ThemedText style={styles.secondaryButtonText} lightColor="#b081ee" darkColor="#b081ee">Cancelar</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleAddMember}>
                <ThemedText style={styles.primaryButtonText} lightColor="#fff" darkColor="#fff">Adicionar</ThemedText>
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6E0FF'
  },
  avatarText: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  primaryButton: {
      backgroundColor: '#b081ee',
      borderRadius: 15,
      padding: 15,
      alignItems: 'center',
      flex: 1,
      marginLeft: 10,
  },
  primaryButtonText: {
      fontWeight: 'bold',
      fontSize: 16,
  },
  secondaryButton: {
      backgroundColor: '#FFFFFF',
      borderRadius: 15,
      padding: 15,
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
      borderWidth: 1,
      borderColor: '#b081ee'
  },
  secondaryButtonText: {
      fontWeight: 'bold',
      fontSize: 16,
  }
}); 