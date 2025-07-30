// Teste forçando autenticação manual no Storage
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes } = require('firebase/storage');
const { getAuth, signInAnonymously } = require('firebase/auth');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyATxb3SOzlQCBpkWN4aDQsa8JefjC9eGac",
  authDomain: "glasscare-2025.firebaseapp.com",
  projectId: "glasscare-2025",
  storageBucket: "glasscare-2025.firebasestorage.app",
  messagingSenderId: "648780623753",
  appId: "1:648780623753:android:473040ed1cb8ce26863b58"
};

async function testManualAuth() {
  console.log('🧪 Testando autenticação manual no Storage...\n');

  try {
    // Inicializar Firebase de forma sequencial
    console.log('🔧 Inicializando Firebase...');
    const app = initializeApp(firebaseConfig);
    console.log(`✅ App: ${app.name}`);

    const auth = getAuth(app);
    console.log(`✅ Auth: ${auth.app.name}`);

    // Aguardar um pouco antes de inicializar Storage
    await new Promise(resolve => setTimeout(resolve, 1000));

    const storage = getStorage(app);
    console.log(`✅ Storage: ${storage.app.name}\n`);

    // Login anônimo
    console.log('🔐 Login anônimo...');
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log(`✅ Usuário: ${user.uid}\n`);

    // Aguardar propagação da autenticação
    console.log('⏳ Aguardando propagação da autenticação...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verificar se o usuário ainda está autenticado
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log(`✅ Usuário ainda autenticado: ${currentUser.uid}`);
    } else {
      console.log(`❌ Usuário perdeu autenticação`);
      return;
    }

    // Obter token fresh
    console.log('🔑 Obtendo token fresh...');
    const token = await currentUser.getIdToken(true);
    console.log(`✅ Token: ${token.substring(0, 30)}...\n`);

    // Teste de upload
    console.log('📤 Testando upload...');
    const testData = Buffer.from('minimal-test');
    const fileName = `manual_auth_${currentUser.uid}_${Date.now()}.txt`;
    const fileRef = ref(storage, `test/${fileName}`);

    console.log(`📁 Arquivo: test/${fileName}`);
    console.log(`⏱️  Upload...`);

    const startTime = Date.now();
    
    try {
      const result = await uploadBytes(fileRef, testData);
      const endTime = Date.now();
      
      console.log(`✅ SUCESSO em ${endTime - startTime}ms!`);
      console.log(`📊 Arquivo: ${result.metadata.name}`);
      console.log(`📏 Tamanho: ${result.metadata.size} bytes\n`);
      
      console.log('🎉 PROBLEMA RESOLVIDO!');
      console.log('   A autenticação está funcionando corretamente');
      console.log('   O problema pode ter sido timing ou inicialização');
      
    } catch (uploadError) {
      const endTime = Date.now();
      console.log(`❌ Falhou em ${endTime - startTime}ms`);
      console.log(`📋 Erro: ${uploadError.code} - ${uploadError.message}\n`);
      
      if (uploadError.code === 'storage/unauthenticated') {
        console.log('🚨 AINDA COM PROBLEMA DE AUTENTICAÇÃO');
        console.log('   Vou tentar uma solução alternativa...\n');
        
        // Tentar reinicializar tudo
        console.log('🔄 Reinicializando Firebase...');
        const newApp = initializeApp(firebaseConfig, 'test-app');
        const newAuth = getAuth(newApp);
        const newStorage = getStorage(newApp);
        
        console.log('🔐 Novo login...');
        const newUser = await signInAnonymously(newAuth);
        
        console.log('📤 Novo upload...');
        const newRef = ref(newStorage, `test/retry_${newUser.user.uid}_${Date.now()}.txt`);
        
        try {
          const retryResult = await uploadBytes(newRef, testData);
          console.log('✅ SUCESSO com nova instância!');
          console.log('   O problema era na inicialização original');
        } catch (retryError) {
          console.log('❌ Falhou mesmo com nova instância');
          console.log(`   Erro: ${retryError.code} - ${retryError.message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
console.log('🚀 Iniciando teste de autenticação manual\n');
testManualAuth();