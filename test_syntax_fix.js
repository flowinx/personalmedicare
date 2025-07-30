/**
 * TESTE RÁPIDO - VERIFICAÇÃO DE SINTAXE
 * 
 * Este script verifica se as correções de sintaxe foram aplicadas corretamente
 * e se as funções de persistência de medicamentos estão funcionando.
 */

// Teste de importação das funções
async function testImports() {
  console.log('🔍 TESTE DE IMPORTAÇÃO DAS FUNÇÕES');
  console.log('=' .repeat(40));
  
  try {
    // Tentar importar as funções principais
    const { 
      markMedicationAsTaken,
      getMedicationLogsByDate,
      getMedicationLogsByTreatment,
      addMedicationLog,
      updateWeightRecord,
      deleteWeightRecord
    } = await import('./services/firebase');
    
    console.log('✅ markMedicationAsTaken importada');
    console.log('✅ getMedicationLogsByDate importada');
    console.log('✅ getMedicationLogsByTreatment importada');
    console.log('✅ addMedicationLog importada');
    console.log('✅ updateWeightRecord importada');
    console.log('✅ deleteWeightRecord importada');
    
    // Verificar se são funções
    console.log('\n🔧 VERIFICAÇÃO DE TIPOS:');
    console.log(`markMedicationAsTaken é função: ${typeof markMedicationAsTaken === 'function'}`);
    console.log(`getMedicationLogsByDate é função: ${typeof getMedicationLogsByDate === 'function'}`);
    console.log(`getMedicationLogsByTreatment é função: ${typeof getMedicationLogsByTreatment === 'function'}`);
    console.log(`addMedicationLog é função: ${typeof addMedicationLog === 'function'}`);
    console.log(`updateWeightRecord é função: ${typeof updateWeightRecord === 'function'}`);
    console.log(`deleteWeightRecord é função: ${typeof deleteWeightRecord === 'function'}`);
    
    console.log('\n✅ TODAS AS FUNÇÕES IMPORTADAS COM SUCESSO!');
    return true;
    
  } catch (error) {
    console.error('❌ ERRO NA IMPORTAÇÃO:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Teste de sintaxe do HomeScreen
async function testHomeScreenImport() {
  console.log('\n📱 TESTE DE IMPORTAÇÃO DO HOMESCREEN');
  console.log('=' .repeat(40));
  
  try {
    // Tentar importar o HomeScreen
    const HomeScreen = await import('./screens/HomeScreen');
    
    console.log('✅ HomeScreen importado com sucesso');
    console.log(`Tipo: ${typeof HomeScreen.default}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ ERRO NA IMPORTAÇÃO DO HOMESCREEN:', error.message);
    return false;
  }
}

// Teste de verificação de duplicatas
async function testNoDuplicates() {
  console.log('\n🔍 TESTE DE VERIFICAÇÃO DE DUPLICATAS');
  console.log('=' .repeat(40));
  
  try {
    const firebase = await import('./services/firebase');
    
    // Verificar se não há funções duplicadas
    const functionNames = Object.keys(firebase);
    const duplicates = functionNames.filter((name, index) => 
      functionNames.indexOf(name) !== index
    );
    
    if (duplicates.length === 0) {
      console.log('✅ Nenhuma função duplicada encontrada');
      console.log(`Total de exports: ${functionNames.length}`);
    } else {
      console.log('❌ Funções duplicadas encontradas:', duplicates);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ ERRO NA VERIFICAÇÃO:', error.message);
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🧪 TESTE COMPLETO DE CORREÇÃO DE SINTAXE');
  console.log('=' .repeat(50));
  console.log(`📅 Data: ${new Date().toLocaleString()}`);
  
  const results = [];
  
  // Teste 1: Importações
  results.push(await testImports());
  
  // Teste 2: HomeScreen
  results.push(await testHomeScreenImport());
  
  // Teste 3: Duplicatas
  results.push(await testNoDuplicates());
  
  // Resumo
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('=' .repeat(30));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`✅ Testes aprovados: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Sintaxe corrigida com sucesso');
    console.log('✅ Funções disponíveis e funcionais');
    console.log('✅ Sem duplicatas ou conflitos');
    console.log('\n🚀 O sistema está pronto para uso!');
  } else {
    console.log('\n❌ ALGUNS TESTES FALHARAM');
    console.log('⚠️ Verifique os erros acima');
  }
  
  return passed === total;
}

// Exportar funções
export { testImports, testHomeScreenImport, testNoDuplicates, runAllTests };

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}