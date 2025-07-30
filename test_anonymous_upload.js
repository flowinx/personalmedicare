// Teste com login anônimo para comparar velocidade
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { getAuth, signInAnonymously, signInWithEmailAndPassword } = require('firebase/auth');

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

function createTestImage(sizeKB = 50) {
  const baseImage = Buffer.from([
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
  
  const targetSize = sizeKB * 1024;
  const padding = Buffer.alloc(Math.max(0, targetSize - baseImage.length), 0);
  return Buffer.concat([baseImage, padding]);
}

async function testUploadSpeed(authType, user) {
  console.log(`\n📤 Testando upload com ${authType}...`);
  console.log(`👤 UID: ${user.uid}`);
  console.log(`📧 Email: ${user.email || 'N/A'}`);
  console.log(`🔐 Anônimo: ${user.isAnonymous}`);
  
  const testImage = createTestImage(50); // 50KB
  console.log(`📄 Imagem: ${(testImage.length / 1024).toFixed(1)}KB`);
  
  // Testar upload para pasta test (sem regras restritivas)
  const fileName = `test_${authType}_${user.uid}_${Date.now()}.jpg`;
  const imageRef = ref(storage, `test/${fileName}`);
  
  console.log(`📁 Arquivo: test/${fileName}`);
  console.log(`⏱️  Iniciando upload...`);
  
  const startTime = Date.now();
  
  try {
    // Upload com timeout de 15 segundos
    const uploadPromise = uploadBytes(imageRef, testImage);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('TIMEOUT_15S'));
      }, 15000);
    });
    
    const uploadResult = await Promise.race([uploadPromise, timeoutPromise]);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Upload concluído em ${duration}ms`);
    console.log(`📊 Velocidade: ${((testImage.length / 1024) / (duration / 1000)).toFixed(1)} KB/s`);
    
    // Obter URL
    try {
      const downloadURL = await getDownloadURL(imageRef);
      console.log(`🔗 URL obtida: ${downloadURL.substring(0, 80)}...`);
    } catch (urlError) {
      console.log(`⚠️  Erro ao obter URL: ${urlError.message}`);
    }
    
    // Análise da velocidade
    if (duration < 3000) {
      console.log(`🎉 EXCELENTE: Upload muito rápido (${duration}ms)`);
    } else if (duration < 10000) {
      console.log(`⚠️  LENTO: Upload demorado (${duration}ms)`);
    } else {
      console.log(`🚨 MUITO LENTO: Upload crítico (${duration}ms)`);
    }
    
    return { success: true, duration, speed: (testImage.length / 1024) / (duration / 1000) };
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`❌ Upload falhou após ${duration}ms`);
    console.log(`📋 Erro: ${error.message}`);
    
    if (error.message === 'TIMEOUT_15S') {
      console.log(`🚨 TIMEOUT: Upload travou por mais de 15 segundos`);
    } else if (error.code === 'storage/unauthorized') {
      console.log(`🚨 UNAUTHORIZED: Sem permissão para upload`);
    } else {
      console.log(`🚨 ERRO: ${error.code || 'unknown'}`);
    }
    
    return { success: false, duration, error: error.message };
  }
}

async function compareAuthMethods() {
  console.log('🧪 Comparando velocidade de upload: Anônimo vs Email/Senha\n');
  
  const results = {};
  
  try {
    // 1. Teste com login anônimo
    console.log('🔐 Testando com LOGIN ANÔNIMO...');
    try {
      const anonResult = await signInAnonymously(auth);
      console.log(`✅ Login anônimo realizado: ${anonResult.user.uid}`);
      
      results.anonymous = await testUploadSpeed('ANONIMO', anonResult.user);
      
    } catch (anonError) {
      console.log(`❌ Erro no login anônimo: ${anonError.code}`);
      if (anonError.code === 'auth/operation-not-allowed') {
        console.log('📝 Login anônimo não está habilitado no Firebase Console');
        console.log('   Vá para Authentication > Sign-in method > Anonymous');
      }
      results.anonymous = { success: false, error: anonError.message };
    }
    
    // 2. Teste com email/senha
    console.log('\n🔐 Testando com EMAIL/SENHA...');
    try {
      // Fazer logout primeiro
      await auth.signOut();
      
      const emailResult = await signInWithEmailAndPassword(auth, 'test@example.com', 'password123');
      console.log(`✅ Login com email realizado: ${emailResult.user.uid}`);
      
      results.email = await testUploadSpeed('EMAIL', emailResult.user);
      
    } catch (emailError) {
      console.log(`❌ Erro no login com email: ${emailError.code}`);
      if (emailError.code === 'auth/invalid-credential') {
        console.log('📝 Configure credenciais reais para testar');
      }
      results.email = { success: false, error: emailError.message };
    }
    
    // 3. Comparar resultados
    console.log('\n📊 COMPARAÇÃO DE RESULTADOS:');
    console.log('=' .repeat(50));
    
    if (results.anonymous?.success && results.email?.success) {
      console.log(`🔐 Login Anônimo: ${results.anonymous.duration}ms (${results.anonymous.speed.toFixed(1)} KB/s)`);
      console.log(`📧 Login Email:   ${results.email.duration}ms (${results.email.speed.toFixed(1)} KB/s)`);
      
      const diff = Math.abs(results.anonymous.duration - results.email.duration);
      const faster = results.anonymous.duration < results.email.duration ? 'Anônimo' : 'Email';
      
      console.log(`\n🏆 ${faster} foi ${diff}ms mais rápido`);
      
      if (diff < 1000) {
        console.log('📋 CONCLUSÃO: Velocidades similares - problema não é o tipo de auth');
      } else {
        console.log(`📋 CONCLUSÃO: ${faster} significativamente mais rápido - problema no tipo de auth`);
      }
      
    } else {
      console.log('⚠️  Não foi possível comparar - um dos logins falhou');
      
      if (results.anonymous?.success) {
        console.log(`✅ Anônimo funcionou: ${results.anonymous.duration}ms`);
      }
      
      if (results.email?.success) {
        console.log(`✅ Email funcionou: ${results.email.duration}ms`);
      }
    }
    
    // 4. Diagnóstico geral
    console.log('\n🎯 DIAGNÓSTICO:');
    
    const anySuccess = results.anonymous?.success || results.email?.success;
    const anyFast = (results.anonymous?.duration < 5000) || (results.email?.duration < 5000);
    
    if (anySuccess && anyFast) {
      console.log('✅ Firebase Storage está funcionando bem');
      console.log('   O problema pode ser específico do app ou configuração');
    } else if (anySuccess && !anyFast) {
      console.log('⚠️  Firebase Storage está lento para ambos os tipos de auth');
      console.log('   Problema de conectividade ou região do Storage');
    } else {
      console.log('❌ Firebase Storage não está funcionando');
      console.log('   Problema de configuração ou regras');
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar teste
console.log('🚀 Iniciando comparação de métodos de autenticação\n');
compareAuthMethods();