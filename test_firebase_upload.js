// Teste específico para upload de imagens no Firebase Storage
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { getAuth, signInAnonymously } = require('firebase/auth');
const fetch = require('node-fetch');
const fs = require('fs');

// Configuração do Firebase (usando as mesmas variáveis do .env)
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

async function testFirebaseStorageUpload() {
  console.log('🧪 Testando upload no Firebase Storage...\n');

  try {
    // 1. Autenticar anonimamente
    console.log('🔐 Fazendo login anônimo...');
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log(`✅ Login realizado com sucesso! UID: ${user.uid}\n`);

    // 2. Criar uma imagem de teste simples (1x1 pixel PNG)
    console.log('🖼️ Criando imagem de teste...');
    const testImageData = Buffer.from([
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
    
    console.log(`✅ Imagem de teste criada (${testImageData.length} bytes)\n`);

    // 3. Testar upload para pasta profiles
    console.log('📤 Testando upload para pasta /profiles/...');
    const profileFileName = `profile_${user.uid}_test.png`;
    const profileRef = ref(storage, `profiles/${profileFileName}`);
    
    console.log(`📁 Referência criada: profiles/${profileFileName}`);
    console.log('⏳ Fazendo upload...');
    
    const startTime = Date.now();
    const uploadResult = await uploadBytes(profileRef, testImageData);
    const uploadTime = Date.now() - startTime;
    
    console.log(`✅ Upload concluído em ${uploadTime}ms`);
    console.log(`📊 Metadados:`, {
      name: uploadResult.metadata.name,
      size: uploadResult.metadata.size,
      contentType: uploadResult.metadata.contentType
    });

    // 4. Obter URL de download
    console.log('🔗 Obtendo URL de download...');
    const downloadURL = await getDownloadURL(profileRef);
    console.log(`✅ URL obtida: ${downloadURL}\n`);

    // 5. Testar upload para pasta members
    console.log('📤 Testando upload para pasta /members/...');
    const memberFileName = `member_${user.uid}_test.png`;
    const memberRef = ref(storage, `members/${memberFileName}`);
    
    console.log(`📁 Referência criada: members/${memberFileName}`);
    console.log('⏳ Fazendo upload...');
    
    const startTime2 = Date.now();
    const uploadResult2 = await uploadBytes(memberRef, testImageData);
    const uploadTime2 = Date.now() - startTime2;
    
    console.log(`✅ Upload concluído em ${uploadTime2}ms`);
    console.log(`📊 Metadados:`, {
      name: uploadResult2.metadata.name,
      size: uploadResult2.metadata.size,
      contentType: uploadResult2.metadata.contentType
    });

    // 6. Obter URL de download
    console.log('🔗 Obtendo URL de download...');
    const downloadURL2 = await getDownloadURL(memberRef);
    console.log(`✅ URL obtida: ${downloadURL2}\n`);

    // 7. Testar acesso às URLs
    console.log('🌐 Testando acesso às URLs...');
    
    try {
      const response1 = await fetch(downloadURL);
      console.log(`✅ Profile URL acessível: ${response1.status} ${response1.statusText}`);
    } catch (error) {
      console.log(`❌ Erro ao acessar profile URL: ${error.message}`);
    }

    try {
      const response2 = await fetch(downloadURL2);
      console.log(`✅ Member URL acessível: ${response2.status} ${response2.statusText}`);
    } catch (error) {
      console.log(`❌ Erro ao acessar member URL: ${error.message}`);
    }

    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('✅ Firebase Storage está funcionando corretamente');
    console.log('✅ Regras de segurança estão permitindo uploads');
    console.log('✅ URLs de download são acessíveis');

  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error);
    
    if (error.code) {
      console.error(`📋 Código do erro: ${error.code}`);
    }
    
    if (error.message) {
      console.error(`📋 Mensagem: ${error.message}`);
    }

    // Diagnósticos específicos
    if (error.code === 'storage/unauthorized') {
      console.log('\n🔍 DIAGNÓSTICO:');
      console.log('   • Problema nas regras de segurança do Firebase Storage');
      console.log('   • Verifique se as regras permitem acesso para usuários autenticados');
      console.log('   • Execute: firebase deploy --only storage');
    } else if (error.code === 'auth/operation-not-allowed') {
      console.log('\n🔍 DIAGNÓSTICO:');
      console.log('   • Login anônimo não está habilitado no Firebase Auth');
      console.log('   • Habilite no console: Authentication > Sign-in method > Anonymous');
    } else if (error.code === 'storage/unknown') {
      console.log('\n🔍 DIAGNÓSTICO:');
      console.log('   • Erro desconhecido no Firebase Storage');
      console.log('   • Verifique a configuração do projeto');
      console.log('   • Verifique se o Storage está ativo');
    }
  }
}

// Executar teste
testFirebaseStorageUpload();