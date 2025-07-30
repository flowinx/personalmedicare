// Teste com regras ultra permissivas para diagnóstico
const fs = require('fs');

console.log('🔧 Criando regras ultra permissivas para teste...\n');

// Backup das regras atuais
const currentRules = fs.readFileSync('storage.rules', 'utf8');
fs.writeFileSync('storage.rules.backup', currentRules);
console.log('✅ Backup das regras atuais salvo em storage.rules.backup');

// Criar regras ultra permissivas
const permissiveRules = `rules_version = '2';

// REGRAS TEMPORÁRIAS ULTRA PERMISSIVAS - APENAS PARA TESTE
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir TUDO para usuários autenticados (incluindo anônimos)
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
`;

fs.writeFileSync('storage.rules', permissiveRules);
console.log('✅ Regras ultra permissivas criadas');

console.log('\n📋 Novas regras:');
console.log('-'.repeat(50));
console.log(permissiveRules);
console.log('-'.repeat(50));

console.log('\n🚀 Agora execute:');
console.log('1. firebase deploy --only storage');
console.log('2. node test_manual_auth.js');
console.log('\n⚠️  IMPORTANTE: Estas regras são APENAS para teste!');
console.log('   Restaure as regras originais depois do teste.');
console.log('\n🔄 Para restaurar as regras originais:');
console.log('   cp storage.rules.backup storage.rules');
console.log('   firebase deploy --only storage');