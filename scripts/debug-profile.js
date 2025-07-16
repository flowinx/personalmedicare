import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Debug Profile Script ===');

// Verificar se o app está rodando
try {
  console.log('1. Verificando se o app está rodando...');
  const psOutput = execSync('ps aux | grep "expo start" | grep -v grep', { encoding: 'utf8' });
  console.log('App status:', psOutput ? 'Rodando' : 'Não está rodando');
} catch (error) {
  console.log('App não está rodando');
}

// Verificar arquivos do banco de dados
console.log('\n2. Verificando arquivos do banco de dados...');
const dbPath = path.join(__dirname, '..', 'personalmedicare.db');
if (fs.existsSync(dbPath)) {
  console.log('Arquivo do banco encontrado:', dbPath);
  const stats = fs.statSync(dbPath);
  console.log('Tamanho do arquivo:', stats.size, 'bytes');
  console.log('Última modificação:', stats.mtime);
} else {
  console.log('Arquivo do banco não encontrado');
}

// Verificar logs do Metro
console.log('\n3. Verificando logs do Metro...');
try {
  const logOutput = execSync('tail -n 20 ~/.expo/logs/metro.log 2>/dev/null || echo "Log não encontrado"', { encoding: 'utf8' });
  console.log('Últimos logs do Metro:');
  console.log(logOutput);
} catch (error) {
  console.log('Erro ao ler logs do Metro:', error.message);
}

console.log('\n=== Fim do Debug ==='); 