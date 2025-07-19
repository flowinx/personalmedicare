const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, query, where, orderBy } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDjNStUaX7thWY1FbTHE5l5Vnrw-u6Lmk0",
  authDomain: "glasscare-2025.firebaseapp.com",
  projectId: "glasscare-2025",
  storageBucket: "glasscare-2025.firebasestorage.app",
  messagingSenderId: "648780623753",
  appId: "1:648780623753:ios:9b3abd536077a0bb863b58"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listAllCollections() {
  console.log('🔍 Listando todas as coleções...\n');
  
  try {
    // Listar profiles
    console.log('📋 PROFILES:');
    const profilesSnapshot = await getDocs(collection(db, 'profiles'));
    profilesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ID: ${doc.id}`);
      console.log(`    Nome: ${data.name}`);
      console.log(`    Email: ${data.email}`);
      console.log(`    Criado em: ${data.createdAt?.toDate()}`);
      console.log('');
    });

    // Listar members
    console.log('👥 MEMBERS:');
    const membersSnapshot = await getDocs(collection(db, 'members'));
    membersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ID: ${doc.id}`);
      console.log(`    Nome: ${data.name}`);
      console.log(`    Relação: ${data.relation}`);
      console.log(`    Data de Nascimento: ${data.dob}`);
      console.log(`    Usuário: ${data.userId}`);
      console.log('');
    });

    // Listar treatments
    console.log('💊 TREATMENTS:');
    const treatmentsSnapshot = await getDocs(collection(db, 'treatments'));
    treatmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ID: ${doc.id}`);
      console.log(`    Medicamento: ${data.medication}`);
      console.log(`    Dosagem: ${data.dosage}`);
      console.log(`    Membro: ${data.member_id}`);
      console.log(`    Usuário: ${data.userId}`);
      console.log('');
    });

    // Listar documents
    console.log('📄 DOCUMENTS:');
    const documentsSnapshot = await getDocs(collection(db, 'documents'));
    documentsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ID: ${doc.id}`);
      console.log(`    Nome do arquivo: ${data.file_name}`);
      console.log(`    Tipo: ${data.file_type}`);
      console.log(`    Membro: ${data.member_id}`);
      console.log(`    Usuário: ${data.userId}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erro ao listar dados:', error);
  }
}

async function searchByUserId(userId) {
  console.log(`🔍 Buscando dados do usuário: ${userId}\n`);
  
  try {
    // Buscar members do usuário
    const membersQuery = query(
      collection(db, 'members'), 
      where('userId', '==', userId),
      orderBy('name')
    );
    const membersSnapshot = await getDocs(membersQuery);
    
    console.log('👥 MEMBERS:');
    membersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${data.name} (${data.relation})`);
    });
    console.log('');

    // Buscar treatments do usuário
    const treatmentsQuery = query(
      collection(db, 'treatments'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const treatmentsSnapshot = await getDocs(treatmentsQuery);
    
    console.log('💊 TREATMENTS:');
    treatmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${data.medication} (${data.dosage})`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Erro ao buscar dados:', error);
  }
}

async function getDocumentById(collectionName, docId) {
  console.log(`📄 Buscando documento ${docId} na coleção ${collectionName}...\n`);
  
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('✅ Documento encontrado:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Documento não encontrado');
    }
  } catch (error) {
    console.error('❌ Erro ao buscar documento:', error);
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'list':
      await listAllCollections();
      break;
    case 'search':
      const userId = args[1];
      if (!userId) {
        console.log('❌ Por favor, forneça um userId: node debug-database.js search <userId>');
        return;
      }
      await searchByUserId(userId);
      break;
    case 'get':
      const collectionName = args[1];
      const docId = args[2];
      if (!collectionName || !docId) {
        console.log('❌ Por favor, forneça collection e docId: node debug-database.js get <collection> <docId>');
        return;
      }
      await getDocumentById(collectionName, docId);
      break;
    default:
      console.log('🔧 Script de Debug da Base de Dados');
      console.log('');
      console.log('Comandos disponíveis:');
      console.log('  node debug-database.js list                    - Listar todos os dados');
      console.log('  node debug-database.js search <userId>         - Buscar dados por usuário');
      console.log('  node debug-database.js get <collection> <docId> - Buscar documento específico');
      console.log('');
      console.log('Exemplos:');
      console.log('  node debug-database.js list');
      console.log('  node debug-database.js search abc123');
      console.log('  node debug-database.js get members member123');
  }
}

main().catch(console.error); 