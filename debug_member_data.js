// Script para debugar dados do membro
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyATxb3SOzlQCBpkWN4aDQsa8JefjC9eGac",
  authDomain: "glasscare-2025.firebaseapp.com",
  projectId: "glasscare-2025",
  storageBucket: "glasscare-2025.firebasestorage.app",
  messagingSenderId: "648780623753",
  appId: "1:648780623753:android:473040ed1cb8ce26863b58"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugMemberData() {
  console.log('🔍 Verificando dados dos membros...\n');
  
  try {
    // Buscar todos os membros
    const membersRef = collection(db, 'members');
    const snapshot = await getDocs(membersRef);
    
    console.log(`📊 Total de membros encontrados: ${snapshot.size}\n`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`👤 Membro: ${data.name}`);
      console.log(`🆔 ID: ${doc.id}`);
      console.log(`🔗 Avatar URI: ${data.avatar_uri || 'Não definido'}`);
      console.log(`📅 Última atualização: ${data.updatedAt?.toDate?.() || 'Não definido'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar membros:', error);
  }
}

debugMemberData();