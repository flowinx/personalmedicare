// Teste específico para diagnosticar problema de timeout no upload
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL, connectStorageEmulator } = require('firebase/storage');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fetch = require('node-fetch');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyATxb3SOzlQCBpkWN4aDQsa8JefjC9eGac",
  authDomain: "glasscare-2025.firebaseapp.com",
  projectId: "glasscare-2025",
  storageBucket: "glasscare-2025.firebasestorage.app",
  messagingSenderId: "648780623753",
  appId: "1:648780623753:android:473040ed1cb8ce26863b58"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

function createTestImage(sizeKB = 1) {
  // Criar uma imagem de teste com tamanho específico
  const baseImage = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x37,
    0x6E, 0xF9, 0x24, 0x00, 0x00, 0x00, 0x00, 0x49, // IEND chunk
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  // Expandir para o tamanho desejado
  const targetSize = sizeKB * 1024;
  const padding = Buffer.alloc(Math.max(0, targetSize - baseImage.length), 0);
  return Buffer.concat([baseImage, padding]);
}

async function testUploadWithTimeout() {
  console.log('🧪 Testando upload com diferentes timeouts e tamanhos...\n');

  try {
    // 1. Login (substitua por credenciais reais)
    console.log('🔐 Fazendo login...');
    const testEmail = 'test@example.com'; // Substitua
    const testPassword = 'password123'; // Substitua
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log(`✅ Login realizado: ${userCredential.user.uid}\n`);
    } catch (loginError) {
      console.log('❌ Erro no login. Testando sem autenticação para diagnóstico...\n');
    }

    // 2. Testar diferentes tamanhos de imagem
    const testSizes = [1, 10, 50, 100]; // KB
    
    for (const sizeKB of testSizes) {
      console.log(`📤 Teste ${sizeKB}KB: Criando imagem de ${sizeKB}KB...`);
      const testImage = createTestImage(sizeKB);
      console.log(`   Imagem criada: ${testImage.length} bytes (${(testImage.length/1024).toFixed(1)}KB)`);
      
      const imageRef = ref(storage, `test/timeout_test_${sizeKB}kb_${Date.now()}.png`);
      
      try {
        console.log(`   ⏳ Iniciando upload com timeout de 30s...`);
        const startTime = Date.now();
        
        // Criar uma Promise com timeout
        const uploadPromise = uploadBytes(imageRef, testImage);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('TIMEOUT_30S')), 30000);
        });
        
        const uploadResult = await Promise.race([uploadPromise, timeoutPromise]);
        const endTime = Date.now();
        
        console.log(`   ✅ Upload concluído em ${endTime - startTime}ms`);
        console.log(`   📊 Metadados: ${uploadResult.metadata.name}\n`);
        
      } catch (error) {
        const endTime = Date.now();
        console.log(`   ❌ Erro após ${endTime - startTime}ms: ${error.message}`);
        
        if (error.message === 'TIMEOUT_30S') {
          console.log('   🚨 PROBLEMA IDENTIFICADO: Upload travou por mais de 30 segundos');
          console.log('   💡 Possíveis causas:');
          console.log('      - Conexão lenta com Firebase Storage');
          console.log('      - Problema de configuração de rede');
          console.log('      - Firewall bloqueando conexão');
          console.log('      - Região do Storage muito distante\n');
          break; // Parar testes se houver timeout
        } else {
          console.log(`   📋 Código do erro: ${error.code}`);
          console.log(`   📋 Mensagem: ${error.message}\n`);
        }
      }
    }

    // 3. Testar conectividade com o Storage
    console.log('🌐 Testando conectividade com Firebase Storage...');
    try {
      const testUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o?alt=media`;
      console.log(`   Testando URL: ${testUrl}`);
      
      const response = await fetch(testUrl, { method: 'HEAD', timeout: 10000 });
      console.log(`   ✅ Conectividade OK: ${response.status} ${response.statusText}`);
      console.log(`   📊 Headers: ${JSON.stringify(Object.fromEntries(response.headers))}\n`);
    } catch (connectError) {
      console.log(`   ❌ Erro de conectividade: ${connectError.message}`);
      console.log('   🚨 PROBLEMA: Não consegue conectar com Firebase Storage');
      console.log('   💡 Verifique sua conexão de internet e firewall\n');
    }

    // 4. Testar diferentes configurações
    console.log('⚙️ Testando configurações alternativas...');
    
    // Testar com metadata específica
    try {
      const smallImage = createTestImage(1);
      const metadataRef = ref(storage, `test/metadata_test_${Date.now()}.png`);
      
      console.log('   📋 Testando upload com metadata customizada...');
      const customMetadata = {
        contentType: 'image/png',
        customMetadata: {
          'uploaded-by': 'test-script',
          'test-type': 'timeout-diagnosis'
        }
      };
      
      const startTime = Date.now();
      const uploadResult = await uploadBytes(metadataRef, smallImage, customMetadata);
      const endTime = Date.now();
      
      console.log(`   ✅ Upload com metadata OK em ${endTime - startTime}ms\n`);
    } catch (metadataError) {
      console.log(`   ❌ Erro com metadata: ${metadataError.message}\n`);
    }

    console.log('🎯 DIAGNÓSTICO CONCLUÍDO');
    console.log('📋 Verifique os resultados acima para identificar o problema específico');

  } catch (error) {
    console.error('❌ Erro geral durante o teste:', error);
  }
}

// Executar teste
console.log('🚀 Iniciando diagnóstico de timeout no upload\n');
testUploadWithTimeout();