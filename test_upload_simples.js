// Teste ultra simples para verificar upload básico
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes } = require('firebase/storage');
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

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

async function testUploadSimples() {
  console.log('🧪 Teste ultra simples de upload...\n');

  try {
    // Login
    console.log('🔐 Login...');
    const userCredential = await signInWithEmailAndPassword(auth, 'test@example.com', 'password123');
    const user = userCredential.user;
    console.log(`✅ Logado: ${user.uid}\n`);

    // Criar imagem minúscula
    const tinyImage = Buffer.from('test');
    console.log(`📄 Imagem: ${tinyImage.length} bytes\n`);

    // Upload direto
    const fileName = `profile_${user.uid}.jpg`;
    const imageRef = ref(storage, `profiles/${fileName}`);
    
    console.log(`📁 Arquivo: profiles/${fileName}`);
    console.log(`⏱️  Iniciando upload...`);
    
    const startTime = Date.now();
    await uploadBytes(imageRef, tinyImage);
    const endTime = Date.now();
    
    console.log(`✅ Concluído em ${endTime - startTime}ms`);
    
    if (endTime - startTime < 2000) {
      console.log('🎉 RÁPIDO: Autenticação funcionando!');
    } else {
      console.log('⚠️  LENTO: Possível problema de auth');
    }

  } catch (error) {
    console.error('❌ Erro:', error.code, error.message);
    
    if (error.code === 'storage/unauthorized') {
      console.log('🚨 PROBLEMA: Token não está sendo aceito');
    } else if (error.code === 'auth/invalid-credential') {
      console.log('📝 Configure credenciais reais');
    }
  }
}

testUploadSimples();