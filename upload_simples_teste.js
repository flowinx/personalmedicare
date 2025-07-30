// Teste de upload super simples para diagnosticar o problema
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes } = require('firebase/storage');

const firebaseConfig = {
  apiKey: "AIzaSyATxb3SOzlQCBpkWN4aDQsa8JefjC9eGac",
  authDomain: "glasscare-2025.firebaseapp.com",
  projectId: "glasscare-2025",
  storageBucket: "glasscare-2025.firebasestorage.app",
  messagingSenderId: "648780623753",
  appId: "1:648780623753:android:473040ed1cb8ce26863b58"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function testeUploadSimples() {
  console.log('🧪 Teste de upload super simples...');
  
  try {
    // Criar um blob muito pequeno (1KB)
    const smallData = new Uint8Array(1024); // 1KB de zeros
    const smallBlob = new Blob([smallData], { type: 'application/octet-stream' });
    
    console.log(`📦 Blob criado: ${smallBlob.size} bytes`);
    
    // Criar referência
    const testRef = ref(storage, `test/simple_test_${Date.now()}.bin`);
    console.log(`📁 Referência: ${testRef.fullPath}`);
    
    // Tentar upload
    console.log('⏳ Iniciando upload...');
    const startTime = Date.now();
    
    const result = await uploadBytes(testRef, smallBlob);
    
    const endTime = Date.now();
    console.log(`✅ Upload concluído em ${endTime - startTime}ms`);
    console.log(`📄 Arquivo: ${result.metadata.name}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
    
    if (error.code === 'storage/unauthorized') {
      console.log('🔐 Problema de autenticação - normal para este teste');
    } else {
      console.log('🚨 Problema real de conectividade ou configuração');
    }
  }
}

// Executar teste
testeUploadSimples();