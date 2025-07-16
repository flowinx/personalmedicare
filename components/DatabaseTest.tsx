import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getProfile, updateProfile } from '../db/profile';

export function DatabaseTest() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDatabase = async () => {
    setLoading(true);
    try {
      console.log('=== Testando banco de dados ===');
      
      // Testar getProfile
      const currentProfile = await getProfile();
      console.log('Profile atual:', currentProfile);
      setProfile(currentProfile);
      
      // Testar updateProfile
      const testData = {
        name: 'Teste Usuário',
        email: 'teste@email.com',
        avatar_uri: 'file://test-image.jpg'
      };
      
      console.log('Atualizando perfil com:', testData);
      await updateProfile(testData);
      
      // Verificar se foi salvo
      const updatedProfile = await getProfile();
      console.log('Profile após atualização:', updatedProfile);
      setProfile(updatedProfile);
      
    } catch (error) {
      console.error('Erro no teste:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teste do Banco de Dados</Text>
      
      <TouchableOpacity style={styles.button} onPress={testDatabase} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Testando...' : 'Testar Banco'}
        </Text>
      </TouchableOpacity>
      
      {profile && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>Resultado:</Text>
          <Text>ID: {profile.id}</Text>
          <Text>Nome: {profile.name}</Text>
          <Text>Email: {profile.email}</Text>
          <Text>Avatar URI: {profile.avatar_uri || 'null'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#b081ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  result: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
}); 