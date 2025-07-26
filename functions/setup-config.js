// Script para configurar variáveis de ambiente das Firebase Functions
// Execute: node setup-config.js

const { execSync } = require('child_process');

console.log('🔧 Configurando variáveis de ambiente das Firebase Functions...\n');

try {
  // Configurar email do Personal Medicare
  console.log('📧 Configurando email...');
  execSync('firebase functions:config:set email.user="personalmedicare@gmail.com"', { stdio: 'inherit' });
  
  // IMPORTANTE: Substitua pela senha de app real do Gmail
  console.log('🔑 Configurando senha do email...');
  execSync('firebase functions:config:set email.password="your_gmail_app_password_here"', { stdio: 'inherit' });
  
  // Email de destino
  console.log('📬 Configurando email de destino...');
  execSync('firebase functions:config:set email.destination="flowinxcorp@gmail.com"', { stdio: 'inherit' });
  
  console.log('\n✅ Configuração concluída!');
  console.log('\n⚠️  IMPORTANTE:');
  console.log('1. Substitua "your_gmail_app_password_here" pela senha de app real do Gmail');
  console.log('2. Execute: firebase functions:config:set email.password="sua_senha_real_aqui"');
  console.log('3. Para ver as configurações: firebase functions:config:get');
  
} catch (error) {
  console.error('❌ Erro na configuração:', error.message);
  console.log('\n💡 Certifique-se de que o Firebase CLI está instalado e você está logado:');
  console.log('   npm install -g firebase-tools');
  console.log('   firebase login');
}