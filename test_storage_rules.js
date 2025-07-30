// Teste específico das regras de segurança do Firebase Storage
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

async function testStorageRules() {
  console.log('🧪 Testando regras de segurança do Firebase Storage...\n');

  try {
    // 1. Testar sem autenticação (deve falhar)
    console.log('❌ Teste 1: Upload sem autenticação (deve falhar)');
    try {
      const testImage = createTestImage();
      const unauthorizedRef = ref(storage, 'profiles/unauthorized_test.png');
      await uploadBytes(unauthorizedRef, testImage);
      console.log('🚨 PROBLEMA: Upload funcionou sem autenticação!');
      console.log('   As regras de segurança estão muito permissivas\n');
    } catch (error) {
      if (error.code === 'storage/unauthorized') {
        console.log('✅ Correto: Upload negado para usuário não autenticado');
        console.log(`   Erro: ${error.code}\n`);
      } else {
        console.log(`❓ Erro inesperado: ${error.code} - ${error.message}\n`);
      }
    }

    // 2. Fazer login com usuário real
    console.log('🔐 Teste 2: Fazendo login com usuário real...');
    const testEmail = 'test@example.com'; // Substitua por email real
    const testPassword = 'password123'; // Substitua por senha real
    
    let user;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      user = userCredential.user;
      console.log(`✅ Login realizado: ${user.uid}\n`);
    } catch (loginError) {
      console.log('❌ Erro no login:', loginError.code);
      console.log('📝 Para testar as regras, você precisa:');
      console.log('   1. Criar uma conta no app PersonalMediCare');
      console.log('   2. Substituir as credenciais neste arquivo');
      console.log('   3. Executar o teste novamente\n');
      return;
    }

    // 3. Testar upload com nome correto (deve funcionar)
    console.log('✅ Teste 3: Upload com nome correto (deve funcionar)');
    try {
      const testImage = createTestImage();
      const correctRef = ref(storage, `profiles/profile_${user.uid}_test.png`);
      
      console.log(`   Tentando upload para: profiles/profile_${user.uid}_test.png`);
      const uploadResult = await uploadBytes(correctRef, testImage);
      console.log('✅ Upload realizado com sucesso!');
      console.log(`   Arquivo: ${uploadResult.metadata.name}`);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(correctRef);
      console.log(`   URL: ${downloadURL.substring(0, 80)}...\n`);
    } catch (error) {
      console.log(`❌ Erro no upload autorizado: ${error.code} - ${error.message}\n`);
    }

    // 4. Testar upload com nome incorreto (deve falhar)
    console.log('❌ Teste 4: Upload com nome incorreto (deve falhar)');
    try {
      const testImage = createTestImage();
      const wrongRef = ref(storage, 'profiles/wrong_name_test.png');
      
      console.log('   Tentando upload para: profiles/wrong_name_test.png');
      await uploadBytes(wrongRef, testImage);
      console.log('🚨 PROBLEMA: Upload funcionou com nome incorreto!');
      console.log('   As regras não estão validando o nome corretamente\n');
    } catch (error) {
      if (error.code === 'storage/unauthorized') {
        console.log('✅ Correto: Upload negado para nome incorreto');
        console.log(`   Erro: ${error.code}\n`);
      } else {
        console.log(`❓ Erro inesperado: ${error.code} - ${error.message}\n`);
      }
    }

    // 5. Testar upload para pasta members
    console.log('✅ Teste 5: Upload para pasta members (deve funcionar)');
    try {
      const testImage = createTestImage();
      const memberRef = ref(storage, `members/member_${user.uid}_test.png`);
      
      console.log(`   Tentando upload para: members/member_${user.uid}_test.png`);
      const uploadResult = await uploadBytes(memberRef, testImage);
      console.log('✅ Upload para members realizado com sucesso!');
      console.log(`   Arquivo: ${uploadResult.metadata.name}\n`);
    } catch (error) {
      console.log(`❌ Erro no upload para members: ${error.code} - ${error.message}\n`);
    }

    console.log('🎉 Teste das regras de segurança concluído!');

  } catch (error) {
    console.error('❌ Erro geral durante o teste:', error);
  }
}

// Executar teste
console.log('🚀 Iniciando teste das regras de segurança\n');
testStorageRules();