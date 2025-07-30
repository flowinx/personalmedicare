// Teste específico para verificar se o token de autenticação está sendo passado corretamente
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { getAuth, signInWithEmailAndPassword, onAuthStateChanged } = require('firebase/auth');

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

async function getCurrentUser() {
  return new Promise((resolve) => {
    console.log('[Test] getCurrentUser called');

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[Test] Auth state changed:', user ? 'user found' : 'no user');
      if (user) {
        console.log('[Test] User details:', {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          isAnonymous: user.isAnonymous,
          providerData: user.providerData.length
        });
      }
      unsubscribe();
      resolve(user);
    }, (error) => {
      console.error('[Test] Auth state error:', error);
      unsubscribe();
      resolve(null);
    });
  });
}

async function testAuthTokenForStorage() {
  console.log('🧪 Testando se o token de autenticação está sendo passado para o Storage...\n');

  try {
    // 1. Fazer login
    console.log('🔐 Fazendo login...');
    const testEmail = 'test@example.com'; // Substitua por credenciais reais
    const testPassword = 'password123';
    
    let user;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      user = userCredential.user;
      console.log(`✅ Login realizado: ${user.uid}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔐 Email verificado: ${user.emailVerified}`);
      console.log(`👤 Anônimo: ${user.isAnonymous}`);
      console.log(`🔑 Providers: ${user.providerData.length}\n`);
    } catch (loginError) {
      console.log('❌ Erro no login:', loginError.code);
      console.log('📝 Configure credenciais reais para testar\n');
      return;
    }

    // 2. Verificar se getCurrentUser retorna o mesmo usuário
    console.log('👤 Verificando getCurrentUser...');
    const currentUser = await getCurrentUser();
    
    if (currentUser && currentUser.uid === user.uid) {
      console.log('✅ getCurrentUser retorna o usuário correto');
      console.log(`   UID: ${currentUser.uid}\n`);
    } else {
      console.log('❌ getCurrentUser não retorna o usuário correto');
      console.log(`   Esperado: ${user.uid}`);
      console.log(`   Recebido: ${currentUser?.uid || 'null'}\n`);
      return;
    }

    // 3. Obter token de autenticação
    console.log('🔑 Obtendo token de autenticação...');
    try {
      const token = await user.getIdToken();
      console.log(`✅ Token obtido: ${token.substring(0, 50)}...`);
      console.log(`📏 Tamanho do token: ${token.length} caracteres\n`);
    } catch (tokenError) {
      console.log('❌ Erro ao obter token:', tokenError.message);
      return;
    }

    // 4. Verificar se o Storage está usando o mesmo auth
    console.log('🔗 Verificando se Storage está conectado ao Auth...');
    console.log(`   Auth instance: ${auth.app.name}`);
    console.log(`   Storage instance: ${storage.app.name}`);
    
    if (auth.app.name === storage.app.name) {
      console.log('✅ Auth e Storage estão na mesma instância do Firebase\n');
    } else {
      console.log('❌ Auth e Storage estão em instâncias diferentes!\n');
      return;
    }

    // 5. Testar upload com logs detalhados
    console.log('📤 Testando upload com monitoramento de autenticação...');
    const testImage = createTestImage();
    const fileName = `profile_${user.uid}.jpg`;
    const imageRef = ref(storage, `profiles/${fileName}`);
    
    console.log(`   📁 Arquivo: profiles/${fileName}`);
    console.log(`   👤 UID: ${user.uid}`);
    console.log(`   🔍 Regra espera: profile_${user.uid}.*`);
    console.log(`   ✅ Nome bate com a regra: SIM\n`);

    // Monitorar tempo de upload
    console.log('⏱️  Iniciando upload com monitoramento...');
    const startTime = Date.now();
    
    // Upload com timeout de 10 segundos (deve ser rápido se auth estiver OK)
    const uploadPromise = uploadBytes(imageRef, testImage);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('TIMEOUT_10S'));
      }, 10000);
    });

    try {
      const uploadResult = await Promise.race([uploadPromise, timeoutPromise]);
      const endTime = Date.now();
      
      console.log(`✅ Upload concluído em ${endTime - startTime}ms`);
      console.log(`📄 Arquivo: ${uploadResult.metadata.name}`);
      
      // Obter URL
      const downloadURL = await getDownloadURL(imageRef);
      console.log(`🔗 URL: ${downloadURL.substring(0, 80)}...\n`);
      
      // Análise do tempo
      if (endTime - startTime < 3000) {
        console.log('🎉 EXCELENTE: Upload rápido - autenticação funcionando!');
      } else if (endTime - startTime < 10000) {
        console.log('⚠️  LENTO: Upload demorou mais que o esperado');
        console.log('   Pode ser problema de conectividade ou regras');
      }
      
    } catch (uploadError) {
      const endTime = Date.now();
      console.log(`❌ Upload falhou após ${endTime - startTime}ms`);
      
      if (uploadError.message === 'TIMEOUT_10S') {
        console.log('🚨 TIMEOUT: Upload travou por mais de 10 segundos');
        console.log('   Isso indica problema de autenticação ou regras');
      } else if (uploadError.code === 'storage/unauthorized') {
        console.log('🚨 UNAUTHORIZED: Token de autenticação não está sendo aceito');
        console.log('   Verifique as regras do Storage ou configuração do Auth');
      } else {
        console.log(`🚨 ERRO: ${uploadError.code} - ${uploadError.message}`);
      }
    }

    console.log('\n🎯 DIAGNÓSTICO COMPLETO');
    console.log('📋 Se o upload foi rápido (< 3s), a autenticação está OK');
    console.log('📋 Se foi lento ou falhou, há problema na passagem do token');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
console.log('🚀 Iniciando teste de token de autenticação\n');
testAuthTokenForStorage();