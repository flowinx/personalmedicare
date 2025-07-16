const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Iniciando limpeza completa do banco de dados...');

try {
  // 1. Parar o Metro bundler se estiver rodando
  console.log('📱 Parando Metro bundler...');
  try {
    execSync('pkill -f "expo start"', { stdio: 'ignore' });
  } catch (e) {
    // Ignora se não estiver rodando
  }

  // 2. Limpar cache do Expo
  console.log('🗑️ Limpando cache do Expo...');
  execSync('npx expo install --fix', { stdio: 'inherit' });
  
  // 3. Limpar cache do Metro
  console.log('🗑️ Limpando cache do Metro...');
  execSync('npx expo start --clear', { stdio: 'ignore', timeout: 5000 });
  
  // 4. Parar novamente
  try {
    execSync('pkill -f "expo start"', { stdio: 'ignore' });
  } catch (e) {
    // Ignora se não estiver rodando
  }

  // 5. Limpar cache do npm
  console.log('🗑️ Limpando cache do npm...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // 6. Remover node_modules e reinstalar
  console.log('📦 Reinstalando dependências...');
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  execSync('npm install', { stdio: 'inherit' });

  console.log('✅ Limpeza concluída!');
  console.log('🚀 Execute "npm start -- --clear" para iniciar o app com cache limpo');
  
} catch (error) {
  console.error('❌ Erro durante a limpeza:', error.message);
  process.exit(1);
} 