// Teste de upload com usuário real (não anônimo)
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
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

async function testFirebaseStorageWithRealUser() {
  console.log('🧪 Testando upload no Firebase Storage com usuário real...\n');

  try {
    // 1. Login com usuário real (você precisa ter uma conta criada)
    console.log('🔐 Fazendo login com usuário real...');
    console.log('⚠️  IMPORTANTE: Este teste precisa de credenciais reais');
    console.log('   Se você não tem uma conta, crie uma no app primeiro\n');
    
    // Substitua por credenciais reais para teste
    const testEmail = 'test@example.com'; // Substitua por um email real
    const testPassword = 'password123'; // Substitua por uma senha real
    
    console.log(`📧 Tentando login com: ${testEmail}`);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      const user = userCredential.user;
      console.log(`✅ Login realizado com sucesso! UID: ${user.uid}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Nome: ${user.displayName || 'Não definido'}\n`);
    } catch (loginError) {
      console.log('❌ Erro no login:', loginError.code);
      console.log('📝 Para testar o upload, você precisa:');
      console.log('   1. Criar uma conta no app PersonalMediCare');
      console.log('   2. Substituir as credenciais neste arquivo de teste');
      console.log('   3. Executar o teste novamente\n');
      
      // Vamos testar as regras de segurança mesmo sem login
      console.log('🔍 Testando regras de segurança sem autenticação...');
      await testStorageRulesWithoutAuth();
      return;
    }

    // 2. Criar uma imagem de teste
    console.log('🖼️ Criando imagem de teste...');
    const testImageData = createTestImage();
    console.log(`✅ Imagem de teste criada (${testImageData.length} bytes)\n`);

    // 3. Testar upload para pasta profiles
    await testUploadToFolder('profiles', testImageData);
    
    // 4. Testar upload para pasta members
    await testUploadToFolder('members', testImageData);

    console.log('\n🎉 Todos os testes concluídos com sucesso!');
    console.log('✅ Firebase Storage está funcionando corretamente');

  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error);
    await diagnoseError(error);
  }
}

async function testUploadToFolder(folder, imageData) {
  console.log(`📤 Testando upload para pasta /${folder}/...`);
  
  try {
    const fileName = `test_${Date.now()}.png`;
    const imageRef = ref(storage, `${folder}/${fileName}`);
    
    console.log(`📁 Referência criada: ${folder}/${fileName}`);
    console.log('⏳ Fazendo upload...');
    
    const startTime = Date.now();
    const uploadResult = await uploadBytes(imageRef, imageData);
    const uploadTime = Date.now() - startTime;
    
    console.log(`✅ Upload concluído em ${uploadTime}ms`);
    console.log(`📊 Metadados:`, {
      name: uploadResult.metadata.name,
      size: uploadResult.metadata.size,
      contentType: uploadResult.metadata.contentType,
      bucket: uploadResult.metadata.bucket
    });

    // Obter URL de download
    console.log('🔗 Obtendo URL de download...');
    const downloadURL = await getDownloadURL(imageRef);
    console.log(`✅ URL obtida: ${downloadURL.substring(0, 100)}...`);

    // Testar acesso à URL
    console.log('🌐 Testando acesso à URL...');
    const response = await fetch(downloadURL);
    console.log(`✅ URL acessível: ${response.status} ${response.statusText}\n`);
    
    return downloadURL;
  } catch (error) {
    console.error(`❌ Erro no upload para ${folder}:`, error.code || error.message);
    throw error;
  }
}

async function testStorageRulesWithoutAuth() {
  console.log('🔍 Testando regras de segurança...');
  
  try {
    const testImageData = createTestImage();
    const imageRef = ref(storage, 'test/unauthorized_test.png');
    
    await uploadBytes(imageRef, testImageData);
    console.log('❌ PROBLEMA: Upload funcionou sem autenticação!');
    console.log('   Isso indica que as regras de segurança estão muito permissivas');
  } catch (error) {
    if (error.code === 'storage/unauthorized') {
      console.log('✅ Regras de segurança funcionando corretamente');
      console.log('   Upload negado para usuário não autenticado');
    } else {
      console.log('❓ Erro inesperado:', error.code);
    }
  }
}

function createTestImage() {
  // Criar uma imagem PNG 1x1 pixel válida
  return Buffer.from([
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
}

async function diagnoseError(error) {
  console.log('\n🔍 DIAGNÓSTICO DO ERRO:');
  
  if (error.code === 'storage/unauthorized') {
    console.log('❌ Problema: Acesso negado ao Firebase Storage');
    console.log('💡 Soluções possíveis:');
    console.log('   1. Verificar se o usuário está autenticado');
    console.log('   2. Verificar regras de segurança do Storage');
    console.log('   3. Verificar se o Storage está ativo no projeto');
  } else if (error.code === 'auth/user-not-found') {
    console.log('❌ Problema: Usuário não encontrado');
    console.log('💡 Solução: Criar uma conta no app primeiro');
  } else if (error.code === 'auth/wrong-password') {
    console.log('❌ Problema: Senha incorreta');
    console.log('💡 Solução: Verificar a senha do usuário');
  } else if (error.code === 'storage/unknown') {
    console.log('❌ Problema: Erro desconhecido no Storage');
    console.log('💡 Soluções possíveis:');
    console.log('   1. Verificar conexão com internet');
    console.log('   2. Verificar configuração do Firebase');
    console.log('   3. Verificar se o Storage está ativo');
  } else {
    console.log(`❌ Erro não catalogado: ${error.code || 'unknown'}`);
    console.log(`📋 Mensagem: ${error.message}`);
  }
}

// Executar teste
console.log('🚀 Iniciando teste de upload do Firebase Storage\n');
testFirebaseStorageWithRealUser();