#!/usr/bin/env node

/**
 * Script para testar configuração de login social
 * Verifica se todos os arquivos necessários estão presentes
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

function checkFile(filePath, description) {
  const fullPath = path.join(projectRoot, filePath);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  return exists;
}

function checkGoogleServicesJson() {
  const googleServicesPath = path.join(projectRoot, 'android/app/google-services.json');
  const examplePath = path.join(projectRoot, 'android/app/google-services.json.example');
  
  if (fs.existsSync(googleServicesPath)) {
    try {
      const content = fs.readFileSync(googleServicesPath, 'utf8');
      const json = JSON.parse(content);
      
      if (json.client && json.client[0] && json.client[0].client_info) {
        const packageName = json.client[0].client_info.android_client_info.package_name;
        if (packageName === 'com.flowinx.personalmedicareapp') {
          console.log('✅ google-services.json: Configurado corretamente');
          return true;
        } else {
          console.log(`❌ google-services.json: Package name incorreto (${packageName})`);
          return false;
        }
      } else {
        console.log('❌ google-services.json: Estrutura inválida');
        return false;
      }
    } catch (error) {
      console.log('❌ google-services.json: Arquivo inválido (JSON malformado)');
      return false;
    }
  } else if (fs.existsSync(examplePath)) {
    console.log('⚠️  google-services.json: Usando arquivo de exemplo (baixe o real do Firebase)');
    return false;
  } else {
    console.log('❌ google-services.json: Arquivo não encontrado');
    return false;
  }
}

function checkEnvVariables() {
  const envPath = path.join(projectRoot, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ Arquivo .env não encontrado');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'GOOGLE_WEB_CLIENT_ID',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_API_KEY'
  ];
  
  let allPresent = true;
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=YOUR_`)) {
      console.log(`✅ ${varName}: Configurado`);
    } else {
      console.log(`❌ ${varName}: Não configurado ou usando placeholder`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

function main() {
  console.log('🔐 Verificando configuração de login social...\n');
  
  let allGood = true;
  
  // Verificar arquivos essenciais
  console.log('📁 Verificando arquivos:');
  allGood &= checkFile('package.json', 'Package.json');
  allGood &= checkFile('app.json', 'App.json');
  allGood &= checkFile('.env', 'Variáveis de ambiente');
  allGood &= checkFile('services/firebase.ts', 'Serviço Firebase');
  allGood &= checkFile('screens/LoginScreen.tsx', 'Tela de login');
  
  console.log('\n🔧 Verificando configurações específicas:');
  
  // Verificar google-services.json
  allGood &= checkGoogleServicesJson();
  
  // Verificar variáveis de ambiente
  console.log('\n🌍 Verificando variáveis de ambiente:');
  allGood &= checkEnvVariables();
  
  // Verificar dependências
  console.log('\n📦 Verificando dependências:');
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = [
      '@react-native-google-signin/google-signin',
      'expo-apple-authentication',
      '@react-native-firebase/app',
      '@react-native-firebase/auth'
    ];
    
    requiredDeps.forEach(dep => {
      if (deps[dep]) {
        console.log(`✅ ${dep}: ${deps[dep]}`);
      } else {
        console.log(`❌ ${dep}: Não instalado`);
        allGood = false;
      }
    });
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allGood) {
    console.log('🎉 Configuração completa! Login social pronto para uso.');
    console.log('\n📱 Próximos passos:');
    console.log('1. Testar no simulador/emulador: npx expo start');
    console.log('2. Testar em dispositivo: eas build --platform all --profile development');
    console.log('3. Build de produção: eas build --platform all --profile production');
  } else {
    console.log('⚠️  Configuração incompleta. Verifique os itens marcados com ❌');
    console.log('\n📖 Consulte o arquivo CONFIGURACAO_LOGIN_SOCIAL.md para instruções detalhadas.');
  }
  
  process.exit(allGood ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { main };