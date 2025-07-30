/**
 * TESTE DE PERFORMANCE - IMAGENS GRANDES
 * 
 * Este script testa o upload e cache de imagens grandes para verificar:
 * - Tempo de upload
 * - Compressão automática
 * - Cache local
 * - Fallbacks em caso de erro
 */

import { uploadImage } from './services/firebase';
import { imageCache } from './utils/imageCache';
import * as FileSystem from 'expo-file-system';

// Simular diferentes tamanhos de imagem
const testImages = [
  {
    name: 'Pequena (50KB)',
    size: 50 * 1024,
    uri: 'https://picsum.photos/200/200'
  },
  {
    name: 'Média (200KB)', 
    size: 200 * 1024,
    uri: 'https://picsum.photos/400/400'
  },
  {
    name: 'Grande (1MB)',
    size: 1024 * 1024,
    uri: 'https://picsum.photos/800/800'
  },
  {
    name: 'Muito Grande (3MB)',
    size: 3 * 1024 * 1024,
    uri: 'https://picsum.photos/1200/1200'
  }
];

async function testImagePerformance() {
  console.log('🚀 INICIANDO TESTE DE PERFORMANCE DE IMAGENS');
  console.log('=' .repeat(50));

  for (const testImage of testImages) {
    console.log(`\n📸 Testando: ${testImage.name}`);
    console.log(`🔗 URI: ${testImage.uri}`);
    
    try {
      // 1. Teste de Upload
      console.log('⏱️ Testando upload...');
      const uploadStart = Date.now();
      
      const uploadedUrl = await uploadImage(testImage.uri, 'members', `test_${Date.now()}.jpg`);
      
      const uploadTime = Date.now() - uploadStart;
      console.log(`✅ Upload concluído em: ${uploadTime}ms`);
      console.log(`🔗 URL: ${uploadedUrl.substring(0, 50)}...`);
      
      // 2. Teste de Cache
      console.log('💾 Testando cache...');
      const cacheStart = Date.now();
      
      const cachedUri = await imageCache.getCachedImage(uploadedUrl);
      
      const cacheTime = Date.now() - cacheStart;
      console.log(`✅ Cache concluído em: ${cacheTime}ms`);
      
      // 3. Verificar tamanho do arquivo em cache
      if (cachedUri.startsWith('file://')) {
        const fileInfo = await FileSystem.getInfoAsync(cachedUri);
        if (fileInfo.exists) {
          console.log(`📊 Tamanho em cache: ${(fileInfo.size / 1024).toFixed(1)}KB`);
        }
      }
      
      // 4. Teste de segundo acesso (deve ser instantâneo)
      console.log('🔄 Testando segundo acesso...');
      const secondAccessStart = Date.now();
      
      const secondCachedUri = await imageCache.getCachedImage(uploadedUrl);
      
      const secondAccessTime = Date.now() - secondAccessStart;
      console.log(`✅ Segundo acesso em: ${secondAccessTime}ms (deve ser < 10ms)`);
      
      // Resumo
      console.log(`📋 RESUMO - ${testImage.name}:`);
      console.log(`   Upload: ${uploadTime}ms`);
      console.log(`   Cache: ${cacheTime}ms`);
      console.log(`   Segundo acesso: ${secondAccessTime}ms`);
      
      // Alertas de performance
      if (uploadTime > 30000) {
        console.log(`⚠️ ALERTA: Upload muito lento (${uploadTime}ms)`);
      }
      
      if (secondAccessTime > 100) {
        console.log(`⚠️ ALERTA: Cache não está funcionando corretamente`);
      }
      
    } catch (error) {
      console.log(`❌ ERRO: ${error.message}`);
      
      // Testar fallbacks
      console.log('🔄 Testando fallbacks...');
      try {
        // Tentar cache direto da URI original
        const fallbackCached = await imageCache.getCachedImage(testImage.uri);
        console.log(`✅ Fallback funcionou: ${fallbackCached}`);
      } catch (fallbackError) {
        console.log(`❌ Fallback também falhou: ${fallbackError.message}`);
      }
    }
    
    console.log('-'.repeat(30));
  }
  
  // Teste de limpeza de cache
  console.log('\n🧹 Testando limpeza de cache...');
  try {
    await imageCache.clearCache();
    console.log('✅ Cache limpo com sucesso');
  } catch (error) {
    console.log(`❌ Erro ao limpar cache: ${error.message}`);
  }
  
  console.log('\n🏁 TESTE DE PERFORMANCE CONCLUÍDO');
}

// Função para testar apenas o cache (sem upload)
async function testCacheOnly() {
  console.log('💾 TESTE ESPECÍFICO DE CACHE');
  console.log('=' .repeat(30));
  
  const testUrls = [
    'https://picsum.photos/200/200?random=1',
    'https://picsum.photos/400/400?random=2', 
    'https://picsum.photos/600/600?random=3'
  ];
  
  for (const url of testUrls) {
    console.log(`\n🔗 Testando: ${url}`);
    
    try {
      // Primeiro acesso
      const start1 = Date.now();
      const cached1 = await imageCache.getCachedImage(url);
      const time1 = Date.now() - start1;
      
      console.log(`📥 Primeiro acesso: ${time1}ms`);
      console.log(`📁 Cached URI: ${cached1.substring(0, 50)}...`);
      
      // Segundo acesso (deve ser do cache)
      const start2 = Date.now();
      const cached2 = await imageCache.getCachedImage(url);
      const time2 = Date.now() - start2;
      
      console.log(`⚡ Segundo acesso: ${time2}ms`);
      
      if (time2 < 50) {
        console.log(`✅ Cache funcionando corretamente`);
      } else {
        console.log(`⚠️ Cache pode não estar funcionando`);
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
  }
}

// Exportar funções para uso
export { testImagePerformance, testCacheOnly };

// Se executado diretamente
if (require.main === module) {
  console.log('Escolha o teste:');
  console.log('1. Performance completa (upload + cache)');
  console.log('2. Apenas cache');
  
  // Para executar: node test_large_image_performance.js
  // Ou importar as funções em outro arquivo
}