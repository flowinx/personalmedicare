import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { resetDatabase } from '../db/index';
import { getProfile, updateProfile } from '../db/profile';

export function ProfileDebug() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(`[ProfileDebug] ${message}`);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      addLog('Carregando perfil...');
      const currentProfile = await getProfile();
      addLog(`Perfil carregado: ${JSON.stringify(currentProfile)}`);
      setProfile(currentProfile);
    } catch (error) {
      addLog(`Erro ao carregar perfil: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testUpdateProfile = async () => {
    setLoading(true);
    try {
      addLog('Testando atualização do perfil...');
      
      const testData = {
        name: 'Usuário Teste',
        email: 'teste@email.com',
        avatar_uri: 'file://test-avatar.jpg'
      };
      
      addLog(`Atualizando com dados: ${JSON.stringify(testData)}`);
      await updateProfile(testData);
      addLog('Perfil atualizado com sucesso');
      
      // Recarregar perfil
      await loadProfile();
      
    } catch (error) {
      addLog(`Erro ao atualizar perfil: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const resetDB = async () => {
    setLoading(true);
    try {
      addLog('Resetando banco de dados...');
      await resetDatabase();
      addLog('Banco de dados resetado com sucesso');
      await loadProfile();
    } catch (error) {
      addLog(`Erro ao resetar banco: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug do Perfil</Text>
      
      <View style={styles.profileInfo}>
        <Text style={styles.sectionTitle}>Perfil Atual:</Text>
        {profile ? (
          <View style={styles.profileData}>
            <Text>ID: {profile.id}</Text>
            <Text>Nome: {profile.name}</Text>
            <Text>Email: {profile.email}</Text>
            <Text>Avatar URI: {profile.avatar_uri || 'null'}</Text>
          </View>
        ) : (
          <Text style={styles.noData}>Nenhum perfil encontrado</Text>
        )}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={loadProfile} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Carregando...' : 'Recarregar Perfil'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testUpdateProfile} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Testando...' : 'Testar Atualização'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
          <Text style={styles.buttonText}>Limpar Logs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={resetDB} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Resetando...' : 'Resetar Banco'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.logsContainer}>
        <Text style={styles.sectionTitle}>Logs:</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    maxHeight: 500,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  profileData: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  noData: {
    fontStyle: 'italic',
    color: '#666',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#b081ee',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    minWidth: 120,
  },
  clearButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    minWidth: 120,
  },
  resetButton: {
    backgroundColor: '#fd7e14',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    minWidth: 120,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  logsContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    maxHeight: 200,
  },
  logText: {
    fontSize: 11,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
}); 