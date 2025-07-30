// Script para verificar regras atuais do Firebase Storage
const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');

const firebaseConfig = {
  apiKey: "AIzaSyATxb3SOzlQCBpkWN4aDQsa8JefjC9eGac",
  authDomain: "glasscare-2025.firebaseapp.com",
  projectId: "glasscare-2025",
  storageBucket: "glasscare-2025.firebasestorage.app",
  messagingSenderId: "648780623753",
  appId: "1:648780623753:android:473040ed1cb8ce26863b58"
};

async function verificarRegras() {
  console.log('🔍 Verificando regras do Firebase Storage...');
  
  try {
    // Fazer requisição para obter regras atuais
    const response = await fetch(`https://firebasestorage.googleapis.com/v0/b/glasscare-2025.firebasestorage.app/o/.info%2Frules?alt=media`);
    
    if (response.ok) {
      const rules = await response.text();
      console.log('📋 Regras atuais do Storage:');
      console.log('=' .repeat(50));
      console.log(rules);
      console.log('=' .repeat(50));
    } else {
      console.log('❌ Não foi possível obter regras via API');
      console.log('💡 Verifique manualmente no Firebase Console → Storage → Rules');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar regras:', error.message);
  }
}

verificarRegras();