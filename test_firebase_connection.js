// Teste específico para verificar conexão entre Auth e Storage
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes } = require('firebase/storage');
const { getAuth, signInAnonymously, onAuthStateChanged } = require('firebase/auth');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyATxb3SOzlQCBpkWN4aDQsa8JefjC9eGac",
  authDomain: "glasscare-2025.firebaseapp.com",
  projectId: "glasscare-2025",
  storageBucket: "glasscare-2025.firebasestorage.app",
  messagingSenderId: "648780623753",
  appId: "1:648780623753:android:473040ed1cb8ce26863b58"
};

async function testFirebaseConnection() {
  console.log('🧪 Testando conexão entre Firebase Auth e Storage...\n');

  try {
    // 1. Inicializar Firebase
    console.log('🔧 Inicializando Firebase...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const storage = getStorage(app);
    
    console.log(`✅ App inicializado: ${app.name}`);
    console.log(`✅ Auth conectado: ${auth.app.name}`);
    console.log(`✅ Storage conectado: ${storage.app.name}`);
    console.log(`✅ Mesma instância: ${auth.app.name === storage.app.name}\n`);

    // 2. Login anônimo
    console.log('🔐 Fazendo login anônimo...');
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    
    console.log(`✅ Login realizado: ${user.uid}`);
    console.log(`📧 Email: ${user.email || 'N/A'}`);
    console.log(`🔐 Anônimo: ${user.isAnonymous}`);
    console.log(`🆔 Provider: ${user.providerId}\n`);

    // 3. Verificar token
    console.log('🔑 Verificando token de autenticação...');
    try {
      const token = await user.getIdToken();
      console.log(`✅ Token obtido: ${token.substring(0, 50)}...`);
      console.log(`📏 Tamanho: ${token.length} caracteres`);
      
      // Decodificar token (básico)
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log(`👤 UID no token: ${payload.user_id || payload.sub}`);
        console.log(`📧 Email no token: ${payload.email || 'N/A'}`);
        console.log(`🔐 Anônimo no token: ${payload.firebase?.sign_in_provider === 'anonymous'}`);
        console.log(`⏰ Expira em: ${new Date(payload.exp * 1000).toLocaleString()}\n`);
      }
    } catch (tokenError) {
      console.log(`❌ Erro ao obter token: ${tokenError.message}\n`);
      return;
    }

    // 4. Verificar estado de autenticação
    console.log('👤 Verificando estado de autenticação...');
    const currentUser = await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
    
    if (currentUser) {
      console.log(`✅ Estado de auth OK: ${currentUser.uid}`);
      console.log(`🔄 Mesmo usuário: ${currentUser.uid === user.uid}\n`);
    } else {
      console.log(`❌ Estado de auth perdido\n`);
      return;
    }

    // 5. Testar upload com logs detalhados
    console.log('📤 Testando upload com diagnóstico detalhado...');
    const testData = Buffer.from('test-data-small');
    const fileName = `test_connection_${user.uid}_${Date.now()}.txt`;
    const fileRef = ref(storage, `test/${fileName}`);
    
    console.log(`📁 Arquivo: test/${fileName}`);
    console.log(`📄 Dados: ${testData.length} bytes`);
    console.log(`🔗 Referência: ${fileRef.fullPath}`);
    console.log(`🏪 Bucket: ${fileRef.bucket}\n`);

    // Verificar se o Storage está usando o mesmo auth
    console.log('🔗 Verificando conexão Auth ↔ Storage...');
    console.log(`Auth app: ${auth.app.name}`);
    console.log(`Storage app: ${storage.app.name}`);
    console.log(`Config match: ${JSON.stringify(auth.config) === JSON.stringify(storage.app.options)}\n`);

    // Upload com timeout curto
    console.log('⏱️  Iniciando upload (timeout 10s)...');
    const startTime = Date.now();
    
    try {
      const uploadPromise = uploadBytes(fileRef, testData);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT_10S')), 10000);
      });
      
      const result = await Promise.race([uploadPromise, timeoutPromise]);
      const endTime = Date.now();
      
      console.log(`✅ Upload concluído em ${endTime - startTime}ms`);
      console.log(`📊 Resultado: ${result.metadata.name}`);
      console.log(`📏 Tamanho final: ${result.metadata.size} bytes\n`);
      
      console.log('🎉 SUCESSO: Auth e Storage estão funcionando corretamente!');
      console.log('   O problema pode ser específico do app React Native');
      
    } catch (uploadError) {
      const endTime = Date.now();
      console.log(`❌ Upload falhou após ${endTime - startTime}ms`);
      console.log(`📋 Erro: ${uploadError.code || 'unknown'} - ${uploadError.message}\n`);
      
      if (uploadError.code === 'storage/unauthenticated') {
        console.log('🚨 PROBLEMA IDENTIFICADO: Storage não reconhece autenticação');
        console.log('   Possíveis causas:');
        console.log('   1. Token não está sendo passado corretamente');
        console.log('   2. Configuração do Storage incorreta');
        console.log('   3. Problema na inicialização do Firebase');
        console.log('   4. Regras de Storage não deployadas corretamente');
      } else if (uploadError.message === 'TIMEOUT_10S') {
        console.log('🚨 PROBLEMA: Upload muito lento (timeout)');
        console.log('   Conectividade ou região do Storage');
      } else {
        console.log('🚨 PROBLEMA DESCONHECIDO');
        console.log(`   Código: ${uploadError.code}`);
        console.log(`   Mensagem: ${uploadError.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
console.log('🚀 Iniciando teste de conexão Firebase\n');
testFirebaseConnection();