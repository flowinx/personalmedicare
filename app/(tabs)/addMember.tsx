import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddMemberScreen() {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [dob, setDob] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddMember = () => {
    Alert.alert('Novo Membro', `Nome: ${name}\nParentesco: ${relation}\nNascimento: ${dob}`);
    // Futuramente, aqui salvaremos os dados
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>Membro</Text>
      
      <TouchableOpacity style={styles.avatarContainer}>
        <Image source={{ uri: 'https://i.pravatar.cc/150' }} style={styles.avatar} />
        <Text style={styles.avatarText}>Adicionar Foto</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nome Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do membro da família"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Parentesco</Text>
        <TextInput
          style={styles.input}
          placeholder="Pai, Mãe, Filho(a), etc."
          value={relation}
          onChangeText={setRelation}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Data de Nascimento</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          value={dob}
          onChangeText={setDob}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Observações</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          placeholder="Alergias, condições pré-existentes, etc."
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
        <Text style={styles.addButtonText}>Adicionar Membro</Text>
      </TouchableOpacity>

      <Link href="/" asChild>
        <TouchableOpacity style={{ marginTop: 20 }}>
            <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 30,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
  },
  avatarText: {
    marginTop: 10,
    color: '#b081ee',
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: '#333333',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addButton: {
    backgroundColor: '#b081ee',
    borderRadius: 10,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cancelText: {
    color: '#8A8A8A',
    textAlign: 'center',
    fontSize: 16,
  }
}); 