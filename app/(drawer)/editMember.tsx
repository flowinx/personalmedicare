import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Animated, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { deleteMember, getMemberById, updateMember } from '../../db/members';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';

type RootStackParamList = {
  Home: undefined;
  'Editar Membro': { id: string };
};

export default function EditMemberScreen() {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // @ts-ignore
  const memberId = (route.params?.id ? String(route.params.id) : undefined);

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [dob, setDob] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);
  const { fadeAnim, slideAnim, startAnimation } = useEntranceAnimation();

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  useEffect(() => {
    if (!memberId) return;
    async function loadMemberData() {
      try {
        const member = await getMemberById(memberId!);
        if (member) {
          setName(member.name ?? '');
          setRelation(member.relation ?? '');
          setDob(member.dob ?? '');
          setNotes(member.notes ?? '');
          setAvatarUri(typeof member.avatar_uri === 'string' ? member.avatar_uri : undefined);
        }
      } catch (error) {
        console.error('Failed to fetch member data for editing:', error);
      }
    }
    loadMemberData();
  }, [memberId]);

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
    }
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  }, []);

  const handleDateChange = useCallback((text: string) => {
    const formatted = formatDate(text);
    setDob(formatted);
  }, [formatDate]);

  const handleUpdateMember = async () => {
    if (!memberId) {
      Alert.alert('Erro', 'ID do membro não encontrado.');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Erro', 'O nome do membro é obrigatório.');
      return;
    }

    try {
      await updateMember(memberId, {
        name,
        relation,
        dob,
        notes,
        avatar_uri: avatarUri
      });
      Alert.alert('Sucesso', 'Membro atualizado!');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update member:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os dados do membro.');
    }
  };
  
  const handleDeleteMember = () => {
    if (!memberId) {
      Alert.alert('Erro', 'ID do membro não encontrado.');
      return;
    }

    Alert.alert(
      "Confirmar Exclusão",
      `Você tem certeza que deseja excluir ${name}? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMember(memberId);
              Alert.alert("Excluído!", `${name} foi removido.`);
              navigation.navigate('Home');
            } catch (error) {
              console.error('Failed to delete member:', error);
              Alert.alert('Erro', 'Não foi possível excluir o membro.');
            }
          },
        },
      ]
    );
  };

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
          {/* Avatar Section */}
          <Animated.View style={[styles.avatarSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="camera" size={40} color="#b081ee" />
                </View>
              )}
              <ThemedText style={styles.avatarText}>Adicionar Foto</ThemedText>
            </TouchableOpacity>
          </Animated.View>

          {/* Form Fields */}
          <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Nome Completo</ThemedText>
              <View style={styles.inputWrapper}>
                <FontAwesome name="user" size={20} color="#8A8A8A" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome do membro da família"
                  placeholderTextColor="#8A8A8A"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Parentesco</ThemedText>
              <View style={styles.inputWrapper}>
                <FontAwesome name="heart" size={20} color="#8A8A8A" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Pai, Mãe, Filho(a), etc."
                  placeholderTextColor="#8A8A8A"
                  value={relation}
                  onChangeText={setRelation}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Data de Nascimento</ThemedText>
              <View style={styles.inputWrapper}>
                <FontAwesome name="calendar" size={20} color="#8A8A8A" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#8A8A8A"
                  value={dob}
                  onChangeText={handleDateChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Observações</ThemedText>
              <View style={styles.inputWrapper}>
                <FontAwesome name="sticky-note" size={20} color="#8A8A8A" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="Alergias, condições pré-existentes, etc."
                  placeholderTextColor="#8A8A8A"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />
              </View>
            </View>
          </Animated.View>

          {/* Buttons */}
          <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
              <ThemedText style={styles.secondaryButtonText}>Cancelar</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleUpdateMember}>
              <ThemedText style={styles.primaryButtonText}>Salvar</ThemedText>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.deleteContainer, { opacity: fadeAnim }]}>
            <TouchableOpacity onPress={handleDeleteMember} style={styles.deleteButton}>
              <ThemedText style={styles.deleteButtonText}>Excluir Membro</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
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
    color: '#b081ee',
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    color: '#333333',
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
    gap: 8,
  },
  primaryButton: {
      backgroundColor: '#b081ee',
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      flex: 1,
      marginRight: 8,
      shadowColor: '#b081ee',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
  },
  primaryButtonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 16,
  },
  secondaryButton: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      flex: 1,
      marginLeft: 8,
      borderWidth: 1,
      borderColor: '#b081ee',
      shadowColor: '#b081ee',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
  },
  secondaryButtonText: {
      color: '#b081ee',
      fontWeight: 'bold',
      fontSize: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: 10,
  },
  deleteContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '100%',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
}); 