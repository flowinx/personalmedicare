// Teste específico para verificar se as regras do Firebase Storage estão funcionando
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

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

function createTestImage() {
  return Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
    0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x37,
    0x6E, 0xF9, 0x24, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
}

async function testStorageRulesWithCorrectNames() {
  console.log('🧪 Testando regras do Firebase Storage com nomes corretos...\n');

  try {
    // 1. Fazer login
    console.log('🔐 Fazendo login...');
    const testEmail = 'test@example.com'; // Substitua por credenciais reais
    const testPassword = 'password123';
    
    let user;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      user = userCredential.user;
      console.log(`✅ Login realizado: ${user.uid}\n`);
    } catch (loginError) {
      console.log('❌ Erro no login:', loginError.code);
      console.log('📝 Configure credenciais reais para testar\n');
      return;
    }

    const testImage = createTestImage();

    // 2. Testar nome CORRETO (com extensão)
    console.log('✅ Teste 1: Nome CORRETO com extensão');
    try {
      const correctName = `profile_${user.uid}.jpg`;
      const correctRef = ref(storage, `profiles/${correctName}`);
      
      console.log(`   📁 Tentando: profiles/${correctName}`);
      console.log(`   👤 UID: ${user.uid}`);
      console.log(`   🔍 Regra espera: profile_${user.uid}.*`);
      
      const startTime = Date.now();
      const uploadResult = await uploadBytes(correctRef, testImage);
      const endTime = Date.now();
      
      console.log(`   ✅ SUCESSO em ${endTime - startTime}ms!`);
      console.log(`   📄 Arquivo: ${uploadResult.metadata.name}`);
      
      // Obter URL
      const downloadURL = await getDownloadURL(correctRef);
      console.log(`   🔗 URL: ${downloadURL.substring(0, 80)}...\n`);
      
    } catch (error) {
      console.log(`   ❌ FALHOU: ${error.code} - ${error.message}\n`);
    }

    // 3. Testar nome INCORRETO (sem extensão) - deve falhar
    console.log('❌ Teste 2: Nome INCORRETO sem extensão (deve falhar)');
    try {
      const incorrectName = `profile_${user.uid}`; // SEM extensão
      const incorrectRef = ref(storage, `profiles/${incorrectName}`);
      
      console.log(`   📁 Tentando: profiles/${incorrectName}`);
      console.log(`   🔍 Regra espera: profile_${user.uid}.*`);
      console.log(`   ⚠️  Nome não tem extensão - deve falhar`);
      
      await uploadBytes(incorrectRef, testImage);
      console.log(`   🚨 PROBLEMA: Upload funcionou sem extensão!\n`);
      
    } catch (error) {
      if (error.code === 'storage/unauthorized') {
        console.log(`   ✅ CORRETO: Falhou como esperado (${error.code})\n`);
      } else {
        console.log(`   ❓ Erro inesperado: ${error.code} - ${error.message}\n`);
      }
    }

    // 4. Testar nome de outro usuário - deve falhar
    console.log('❌ Teste 3: Nome de outro usuário (deve falhar)');
    try {
      const otherUserName = `profile_outro_usuario_123.jpg`;
      const otherUserRef = ref(storage, `profiles/${otherUserName}`);
      
      console.log(`   📁 Tentando: profiles/${otherUserName}`);
      console.log(`   👤 UID atual: ${user.uid}`);
      console.log(`   🔍 Regra espera: profile_${user.uid}.*`);
      
      await uploadBytes(otherUserRef, testImage);
      console.log(`   🚨 PROBLEMA: Upload funcionou para outro usuário!\n`);
      
    } catch (error) {
      if (error.code === 'storage/unauthorized') {
        console.log(`   ✅ CORRETO: Falhou como esperado (${error.code})\n`);
      } else {
        console.log(`   ❓ Erro inesperado: ${error.code} - ${error.message}\n`);
      }
    }

    // 5. Testar formato alternativo (userId_timestamp)
    console.log('✅ Teste 4: Formato alternativo (userId_timestamp)');
    try {
      const altName = `${user.uid}_${Date.now()}.jpg`;
      const altRef = ref(storage, `profiles/${altName}`);
      
      console.log(`   📁 Tentando: profiles/${altName}`);
      console.log(`   🔍 Regra espera: ${user.uid}_.*`);
      
      const startTime = Date.now();
      const uploadResult = await uploadBytes(altRef, testImage);
      const endTime = Date.now();
      
      console.log(`   ✅ SUCESSO em ${endTime - startTime}ms!`);
      console.log(`   📄 Arquivo: ${uploadResult.metadata.name}\n`);
      
    } catch (error) {
      console.log(`   ❌ FALHOU: ${error.code} - ${error.message}\n`);
    }

    console.log('🎯 DIAGNÓSTICO COMPLETO');
    console.log('📋 Se o Teste 1 funcionou rápido, o problema era o nome do arquivo!');
    console.log('📋 Se ainda estiver lento, há outro problema de conectividade');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
console.log('🚀 Iniciando teste das regras com nomes corretos\n');
testStorageRulesWithCorrectNames();