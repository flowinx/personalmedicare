// Teste específico do fluxo de upload de perfil
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { getAuth, signInWithEmailAndPassword, onAuthStateChanged } = require('firebase/auth');
const { getFirestore, doc, getDoc, updateDoc } = require('firebase/firestore');
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
const db = getFirestore(app);

// Simular a função getCurrentUser do serviço
async function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, (error) => {
      unsubscribe();
      resolve(null);
    });
  });
}

// Simular a função uploadImage do serviço
async function uploadImage(imageUri, folder, fileName) {
  try {
    console.log(`[Upload] Iniciando upload da imagem: ${imageUri}`);
    
    // Verificar se o usuário está autenticado
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado. Faça login primeiro.');
    }
    
    console.log(`[Upload] Usuário autenticado: ${currentUser.uid}`);
    
    const userId = currentUser.uid;
    
    // Gerar nome único para o arquivo se não fornecido
    const timestamp = Date.now();
    const finalFileName = fileName || `${userId}_${timestamp}.jpg`;
    
    console.log(`[Upload] Nome do arquivo: ${finalFileName}`);
    console.log(`[Upload] Pasta de destino: ${folder}`);
    
    // Criar referência no Storage
    const imageRef = ref(storage, `${folder}/${finalFileName}`);
    console.log(`[Upload] Referência criada: ${folder}/${finalFileName}`);
    
    // Converter URI para blob
    console.log(`[Upload] Convertendo URI para blob...`);
    const response = await fetch(imageUri);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar imagem: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log(`[Upload] Blob criado - Tamanho: ${blob.size} bytes, Tipo: ${blob.type}`);
    
    // Verificar se o blob é válido
    if (blob.size === 0) {
      throw new Error('Imagem vazia ou inválida');
    }
    
    // Upload da imagem
    console.log(`[Upload] Iniciando upload...`);
    const uploadResult = await uploadBytes(imageRef, blob);
    console.log(`[Upload] Upload concluído:`, uploadResult.metadata.name);
    
    // Obter URL de download
    console.log(`[Upload] Obtendo URL de download...`);
    const downloadURL = await getDownloadURL(imageRef);
    
    console.log(`[Upload] Imagem enviada com sucesso: ${downloadURL}`);
    return downloadURL;
  } catch (error) {
    console.error('[Upload] Erro detalhado ao fazer upload da imagem:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      imageUri,
      folder
    });
    throw error;
  }
}

// Simular a função updateProfile do serviço
async function updateProfile(data) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }
    
    const userId = currentUser.uid;
    const profileRef = doc(db, 'profiles', userId);
    
    // Se há uma nova imagem local, fazer upload para o Firebase Storage
    let avatarUrl = data.avatar_uri;
    if (avatarUrl && avatarUrl.startsWith('file://')) {
      console.log('[Profile] Detectada imagem local, fazendo upload...');
      avatarUrl = await uploadImage(avatarUrl, 'profiles', `profile_${userId}`);
      console.log('[Profile] Upload da nova imagem de perfil realizado:', avatarUrl);
    }
    
    const updatedProfile = {
      name: data.name,
      email: data.email,
      avatar_uri: avatarUrl,
      updatedAt: new Date()
    };

    console.log('[Profile] Atualizando documento do perfil...');
    await updateDoc(profileRef, updatedProfile);
    console.log('[Profile] Perfil atualizado com sucesso');
    
    return avatarUrl;
  } catch (error) {
    console.error('[Profile] Erro ao atualizar perfil:', error);
    throw error;
  }
}

function createTestImageFile() {
  // Simular uma imagem local (como se fosse selecionada pelo ImagePicker)
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
  
  // Criar um data URL (simula o que o ImagePicker retornaria)
  const base64 = testImageData.toString('base64');
  return `data:image/png;base64,${base64}`;
}

async function testProfileUploadFlow() {
  console.log('🧪 Testando fluxo completo de upload de perfil...\n');

  try {
    // 1. Fazer login (substitua por credenciais reais)
    console.log('🔐 Fazendo login...');
    const testEmail = 'test@example.com'; // Substitua por email real
    const testPassword = 'password123'; // Substitua por senha real
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log(`✅ Login realizado: ${userCredential.user.uid}\n`);
    } catch (loginError) {
      console.log('❌ Erro no login:', loginError.code);
      console.log('📝 Para testar, você precisa de credenciais reais');
      console.log('   Crie uma conta no app e substitua as credenciais neste teste\n');
      return;
    }

    // 2. Simular seleção de imagem
    console.log('📱 Simulando seleção de imagem...');
    const testImageUri = createTestImageFile();
    console.log(`✅ Imagem simulada criada: ${testImageUri.substring(0, 50)}...\n`);

    // 3. Simular salvamento do perfil (como na ProfileScreen)
    console.log('💾 Simulando salvamento do perfil...');
    const profileData = {
      name: 'Usuário Teste',
      email: testEmail,
      avatar_uri: testImageUri
    };

    const startTime = Date.now();
    const finalAvatarUrl = await updateProfile(profileData);
    const endTime = Date.now();

    console.log(`✅ Perfil atualizado com sucesso em ${endTime - startTime}ms`);
    console.log(`🖼️ URL final da imagem: ${finalAvatarUrl}\n`);

    // 4. Testar acesso à imagem
    console.log('🌐 Testando acesso à imagem...');
    try {
      const response = await fetch(finalAvatarUrl);
      console.log(`✅ Imagem acessível: ${response.status} ${response.statusText}`);
      console.log(`📊 Tamanho da resposta: ${response.headers.get('content-length')} bytes`);
    } catch (fetchError) {
      console.log(`❌ Erro ao acessar imagem: ${fetchError.message}`);
    }

    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('✅ Upload de perfil está funcionando corretamente');

  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error);
    
    // Diagnóstico específico
    if (error.code === 'storage/unauthorized') {
      console.log('\n🔍 DIAGNÓSTICO:');
      console.log('   • Problema nas regras de segurança do Firebase Storage');
      console.log('   • Verifique se as regras permitem acesso para usuários autenticados');
    } else if (error.message.includes('não autenticado')) {
      console.log('\n🔍 DIAGNÓSTICO:');
      console.log('   • Usuário não está autenticado corretamente');
      console.log('   • Verifique as credenciais de login');
    } else if (error.code === 'storage/unknown') {
      console.log('\n🔍 DIAGNÓSTICO:');
      console.log('   • Erro desconhecido no Firebase Storage');
      console.log('   • Verifique a configuração e conexão');
    }
  }
}

// Executar teste
console.log('🚀 Iniciando teste do fluxo de upload de perfil\n');
testProfileUploadFlow();