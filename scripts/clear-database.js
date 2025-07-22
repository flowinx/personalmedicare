const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc, writeBatch } = require('firebase/firestore');

// Configuração do Firebase - usando variáveis de ambiente
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearCollection(collectionName) {
  console.log(`🗑️ Limpando coleção: ${collectionName}`);
  
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`✅ ${snapshot.size} documentos removidos de ${collectionName}`);
  } catch (error) {
    console.error(`❌ Erro ao limpar ${collectionName}:`, error);
  }
}

async function clearAllData() {
  console.log('🚨 ATENÇÃO: Isso vai remover TODOS os dados do Firebase!');
  console.log('Coleções que serão limpas:');
  console.log('  - profiles');
  console.log('  - members');
  console.log('  - treatments');
  console.log('  - documents');
  console.log('');
  
  // Simular confirmação (em produção, você pode usar readline)
  const confirmed = process.argv.includes('--confirm');
  
  if (!confirmed) {
    console.log('❌ Para confirmar, execute: node clear-database.js --confirm');
    console.log('⚠️  Esta ação é irreversível!');
    return;
  }
  
  console.log('🗑️ Iniciando limpeza da base de dados...\n');
  
  const collections = ['profiles', 'members', 'treatments', 'documents'];
  
  for (const collectionName of collections) {
    await clearCollection(collectionName);
  }
  
  console.log('\n✅ Limpeza concluída!');
}

async function clearUserData(userId) {
  console.log(`🗑️ Limpando dados do usuário: ${userId}`);
  
  try {
    const batch = writeBatch(db);
    
    // Limpar members do usuário
    const membersSnapshot = await getDocs(collection(db, 'members'));
    membersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId === userId) {
        batch.delete(doc.ref);
      }
    });
    
    // Limpar treatments do usuário
    const treatmentsSnapshot = await getDocs(collection(db, 'treatments'));
    treatmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId === userId) {
        batch.delete(doc.ref);
      }
    });
    
    // Limpar documents do usuário
    const documentsSnapshot = await getDocs(collection(db, 'documents'));
    documentsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId === userId) {
        batch.delete(doc.ref);
      }
    });
    
    // Limpar profile do usuário
    const profileRef = doc(db, 'profiles', userId);
    batch.delete(profileRef);
    
    await batch.commit();
    console.log('✅ Dados do usuário removidos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao limpar dados do usuário:', error);
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'all':
      await clearAllData();
      break;
    case 'user':
      const userId = args[1];
      if (!userId) {
        console.log('❌ Por favor, forneça um userId: node clear-database.js user <userId>');
        return;
      }
      await clearUserData(userId);
      break;
    default:
      console.log('🗑️ Script de Limpeza da Base de Dados');
      console.log('');
      console.log('Comandos disponíveis:');
      console.log('  node clear-database.js all --confirm           - Limpar TODOS os dados');
      console.log('  node clear-database.js user <userId>           - Limpar dados de um usuário');
      console.log('');
      console.log('⚠️  ATENÇÃO: Estas ações são irreversíveis!');
      console.log('');
      console.log('Exemplos:');
      console.log('  node clear-database.js all --confirm');
      console.log('  node clear-database.js user abc123');
  }
}

main().catch(console.error); 