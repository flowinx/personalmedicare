import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { auth, db } from '../services/firebase';

export default function DatabaseTest() {
  const [authStatus, setAuthStatus] = useState<string>('Verificando...');
  const [firestoreStatus, setFirestoreStatus] = useState<string>('Verificando...');

  useEffect(() => {
    // Testar Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthStatus(`✅ Auth OK - Usuário: ${user.email}`);
      } else {
        setAuthStatus('✅ Auth OK - Nenhum usuário logado');
      }
    }, (error) => {
      setAuthStatus(`❌ Auth Error: ${error.message}`);
    });

    // Testar Firestore
    const testFirestore = async () => {
      try {
        const testCollection = collection(db, 'test');
        await getDocs(testCollection);
        setFirestoreStatus('✅ Firestore OK');
      } catch (error: any) {
        setFirestoreStatus(`❌ Firestore Error: ${error.message}`);
      }
    };

    testFirestore();

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teste de Conexão Firebase</Text>
      <Text style={styles.status}>Auth: {authStatus}</Text>
      <Text style={styles.status}>Firestore: {firestoreStatus}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    marginBottom: 5,
  },
}); 