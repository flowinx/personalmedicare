import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getDatabase } from '../db/index';

export function SimpleDatabaseTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDatabase = async () => {
    setLoading(true);
    setLogs([]);
    
    try {
      addLog('Iniciando teste do banco de dados...');
      
      // Testar abertura do banco
      addLog('Abrindo banco de dados...');
      const db = await getDatabase();
      addLog('Banco aberto com sucesso');
      
      // Testar criação de tabela
      addLog('Criando tabela de teste...');
      await db.runAsync('CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY, name TEXT)');
      addLog('Tabela criada com sucesso');
      
      // Testar inserção
      addLog('Inserindo dados de teste...');
      await db.runAsync('INSERT OR REPLACE INTO test_table (id, name) VALUES (?, ?)', [1, 'Teste']);
      addLog('Dados inseridos com sucesso');
      
      // Testar consulta
      addLog('Consultando dados...');
      const result = await db.getAllAsync('SELECT * FROM test_table WHERE id = 1');
      addLog(`Consulta retornou: ${JSON.stringify(result)}`);
      
      // Testar tabela de perfil
      addLog('Verificando tabela de perfil...');
      const profileResult = await db.getAllAsync('SELECT * FROM user_profile WHERE id = 1');
      addLog(`Perfil encontrado: ${JSON.stringify(profileResult)}`);
      
    } catch (error) {
      addLog(`ERRO: ${error}`);
      console.error('Erro no teste:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teste Simples do Banco</Text>
      
      <TouchableOpacity style={styles.button} onPress={testDatabase} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Testando...' : 'Testar Banco'}
        </Text>
      </TouchableOpacity>
      
      <ScrollView style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Logs:</Text>
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
    maxHeight: 400,
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
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logsContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    maxHeight: 200,
  },
  logsTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logText: {
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
}); 