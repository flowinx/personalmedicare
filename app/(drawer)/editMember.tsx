import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { deleteMember, getMemberById, updateMember } from '../../db/members';

type RootStackParamList = {
  Home: undefined;
  'Editar Membro': { id: number };
};

export default function EditMemberScreen() {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // @ts-ignore
  const memberId = Number(route.params?.id);

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [dob, setDob] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!memberId) return;
    async function loadMemberData() {
      try {
        const member = await getMemberById(memberId);
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

  const handleUpdateMember = async () => {
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
        avatar_uri: avatarUri ? avatarUri : null
      });
      Alert.alert('Sucesso', 'Membro atualizado!');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update member:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os dados do membro.');
    }
  };
  
  const handleDeleteMember = () => {
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
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <ThemedText style={styles.title}>Editar Membro</ThemedText>
        
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
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
              <ThemedText style={styles.secondaryButtonText}>Cancelar</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={handleUpdateMember}>
              <ThemedText style={styles.primaryButtonText}>Salvar</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteMember} style={styles.deleteButtonInline}>
            <ThemedText style={styles.deleteButtonText}>Excluir</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
      borderRadius: 15,
      padding: 15,
      alignItems: 'center',
      flex: 1,
      marginLeft: 8,
  },
  primaryButtonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 16,
  },
  secondaryButton: {
      backgroundColor: '#FFFFFF',
      borderRadius: 15,
      padding: 15,
      alignItems: 'center',
      flex: 1,
      marginRight: 8,
      borderWidth: 1,
      borderColor: '#b081ee'
  },
  secondaryButtonText: {
      color: '#b081ee',
      fontWeight: 'bold',
      fontSize: 16,
  },
  deleteButtonInline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontWeight: 'bold',
    fontSize: 16,
  }
}); 