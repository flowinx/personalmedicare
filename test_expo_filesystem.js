// Teste simples do expo-file-system
const { initializeApp } = require('firebase/app');
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

async function testExpoFileSystem() {
  console.log('🧪 Testando expo-file-system...\n');

  try {
    // Verificar se expo-file-system está disponível
    let FileSystem;
    try {
      FileSystem = require('expo-file-system');
      console.log('✅ expo-file-system importado com sucesso');
    } catch (importError) {
      console.log('❌ Erro ao importar expo-file-system:', importError.message);
      console.log('💡 Execute: npx expo install expo-file-system');
      return;
    }

    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    // Login
    console.log('🔐 Fazendo login...');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, 'test@example.com', 'password123');
      const user = userCredential.user;
      console.log(`✅ Login realizado: ${user.uid}`);
      
      // Obter token
      const token = await user.getIdToken();
      console.log(`🔑 Token obtido: ${token.substring(0, 30)}...`);
      
      // Testar upload de texto simples
      const testData = 'Hello World - Test Upload';
      const fileName = `test_${user.uid}_${Date.now()}.txt`;
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/glasscare-2025.firebasestorage.app/o?name=${encodeURIComponent('test/' + fileName)}`;
      
      console.log('📤 Testando upload de texto...');
      console.log(`📁 Arquivo: test/${fileName}`);
      console.log(`🔗 URL: ${uploadUrl.substring(0, 80)}...`);
      
      // Criar arquivo temporário
      const tempUri = FileSystem.documentDirectory + 'temp_test.txt';
      await FileSystem.writeAsStringAsync(tempUri, testData);
      console.log(`📄 Arquivo temporário criado: ${tempUri}`);
      
      // Upload
      const startTime = Date.now();
      const uploadResult = await FileSystem.uploadAsync(uploadUrl, tempUri, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain',
        },
      });
      
      const endTime = Date.now();
      console.log(`⏱️ Upload concluído em: ${endTime - startTime}ms`);
      console.log(`📊 Status: ${uploadResult.status}`);
      console.log(`📋 Body: ${uploadResult.body}`);
      
      if (uploadResult.status === 200 || uploadResult.status === 201) {
        console.log('✅ SUCESSO! Upload funcionou com expo-file-system');
        
        // Construir URL de download
        const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/glasscare-2025.firebasestorage.app/o/${encodeURIComponent('test/' + fileName)}?alt=media`;
        console.log(`🔗 URL de download: ${downloadUrl}`);
        
        // Testar download
        try {
          const response = await fetch(downloadUrl);
          const content = await response.text();
          console.log(`📥 Conteúdo baixado: "${content}"`);
          
          if (content === testData) {
            console.log('🎉 PERFEITO! Upload e download funcionaram!');
          } else {
            console.log('⚠️ Conteúdo não confere');
          }
        } catch (downloadError) {
          console.log('❌ Erro no download:', downloadError.message);
        }
        
      } else {
        console.log('❌ Upload falhou');
        console.log(`Status: ${uploadResult.status}`);
        console.log(`Body: ${uploadResult.body}`);
      }
      
      // Limpar arquivo temporário
      await FileSystem.deleteAsync(tempUri);
      
    } catch (loginError) {
      console.log('❌ Erro no login:', loginError.code);
      console.log('📝 Configure credenciais reais para testar');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
console.log('🚀 Iniciando teste do expo-file-system\n');
testExpoFileSystem();