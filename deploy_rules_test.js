// Script para fazer deploy das regras de teste
const { exec } = require('child_process');
const fs = require('fs');

console.log('🔧 Fazendo deploy das regras de Storage para teste...\n');

// Verificar se o arquivo de regras existe
if (!fs.existsSync('storage.rules')) {
  console.error('❌ Arquivo storage.rules não encontrado!');
  process.exit(1);
}

// Mostrar as regras que serão deployadas
console.log('📋 Regras que serão deployadas:');
console.log('-'.repeat(50));
const rules = fs.readFileSync('storage.rules', 'utf8');
console.log(rules);
console.log('-'.repeat(50));

// Fazer deploy
console.log('\n🚀 Executando deploy...');
exec('firebase deploy --only storage', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Erro no deploy:', error.message);
    
    if (error.message.includes('not logged in')) {
      console.log('\n💡 Solução:');
      console.log('1. Execute: firebase login');
      console.log('2. Execute novamente: node deploy_rules_test.js');
    } else if (error.message.includes('No project')) {
      console.log('\n💡 Solução:');
      console.log('1. Execute: firebase use glasscare-2025');
      console.log('2. Execute novamente: node deploy_rules_test.js');
    }
    
    return;
  }

  if (stderr) {
    console.log('⚠️  Warnings:', stderr);
  }

  console.log('✅ Deploy concluído!');
  console.log(stdout);
  
  console.log('\n🧪 Agora execute o teste:');
  console.log('node test_anonymous_upload.js');
});