// Teste para verificar se as variáveis de ambiente estão sendo carregadas
const fs = require('fs');
const path = require('path');

// Ler o arquivo .env diretamente
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

console.log('📄 Conteúdo do arquivo .env:');
console.log(envContent);

// Extrair a chave do Gemini
const geminiKeyMatch = envContent.match(/GEMINI_API_KEY=(.+)/);
if (geminiKeyMatch) {
  const geminiKey = geminiKeyMatch[1].trim();
  console.log('\n🔑 Chave do Gemini encontrada:');
  console.log(`Tamanho: ${geminiKey.length} caracteres`);
  console.log(`Primeiros 10 caracteres: ${geminiKey.substring(0, 10)}...`);
  console.log(`Últimos 10 caracteres: ...${geminiKey.substring(geminiKey.length - 10)}`);
  
  // Verificar se a chave parece válida (chaves do Google geralmente começam com AIza)
  if (geminiKey.startsWith('AIza')) {
    console.log('✅ Formato da chave parece correto');
  } else {
    console.log('❌ Formato da chave pode estar incorreto');
  }
} else {
  console.log('❌ Chave do Gemini não encontrada no .env');
}