#!/usr/bin/env node

/**
 * Script para implantar as regras de segurança do Firebase Storage
 * 
 * Uso:
 * 1. Certifique-se de ter o Firebase CLI instalado: npm install -g firebase-tools
 * 2. Faça login no Firebase: firebase login
 * 3. Execute este script: node deploy-storage-rules.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Implantando regras de segurança do Firebase Storage...\n');

// Verificar se o arquivo de regras existe
const rulesFile = path.join(__dirname, 'storage.rules');
if (!fs.existsSync(rulesFile)) {
  console.error('❌ Arquivo storage.rules não encontrado!');
  process.exit(1);
}

try {
  // Verificar se o Firebase CLI está instalado
  console.log('🔍 Verificando Firebase CLI...');
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI encontrado\n');
  
  // Verificar se está logado no Firebase
  console.log('🔐 Verificando autenticação...');
  try {
    execSync('firebase projects:list', { stdio: 'pipe' });
    console.log('✅ Usuário autenticado\n');
  } catch (error) {
    console.log('❌ Usuário não autenticado. Execute: firebase login');
    process.exit(1);
  }
  
  // Implantar as regras
  console.log('📤 Implantando regras de segurança do Storage...');
  execSync('firebase deploy --only storage', { stdio: 'inherit' });
  
  console.log('\n✅ Regras de segurança do Firebase Storage implantadas com sucesso!');
  console.log('\n📋 Resumo das regras:');
  console.log('   • Usuários autenticados podem fazer upload de imagens');
  console.log('   • Cada usuário só pode acessar suas próprias imagens');
  console.log('   • Imagens são organizadas em /profiles/ e /members/');
  console.log('   • Nomes de arquivo devem começar com o UID do usuário');
  
} catch (error) {
  console.error('❌ Erro ao implantar regras:', error.message);
  console.log('\n💡 Dicas para resolver:');
  console.log('   1. Certifique-se de estar logado: firebase login');
  console.log('   2. Verifique se o projeto está configurado: firebase use <project-id>');
  console.log('   3. Verifique se tem permissões no projeto Firebase');
  process.exit(1);
}