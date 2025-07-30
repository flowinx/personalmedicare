/**
 * TESTE ESPECÍFICO - CORREÇÃO DE DATA
 * 
 * Este teste verifica se a correção da busca por data está funcionando.
 */

import { 
  markMedicationAsTaken, 
  getMedicationLogsByDate,
  getAllTreatments,
  getAllMembers 
} from './services/firebase';

async function testDateFix() {
  console.log('🔧 TESTE: CORREÇÃO DE DATA');
  console.log('=' .repeat(40));
  
  try {
    // 1. Buscar dados para teste
    const treatments = await getAllTreatments();
    const members = await getAllMembers();
    
    if (treatments.length === 0 || members.length === 0) {
      console.log('⚠️ Não há dados para testar');
      return;
    }
    
    const treatment = treatments[0];
    const member = members.find(m => m.id === treatment.member_id);
    
    if (!member) {
      console.log('⚠️ Membro não encontrado');
      return;
    }
    
    console.log(`📋 Testando com: ${treatment.medication} para ${member.name}`);
    
    // 2. Usar data de hoje real
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // 3. Criar horário de hoje (não futuro)
    const testTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30, 0);
    const scheduledTimeISO = testTime.toISOString();
    
    console.log(`📅 Data de hoje: ${todayString}`);
    console.log(`⏰ Horário de teste: ${scheduledTimeISO}`);
    
    // 4. Salvar log
    console.log('💾 Salvando log...');
    const logId = await markMedicationAsTaken(
      treatment.id,
      member.id,
      treatment.medication,
      treatment.dosage,
      scheduledTimeISO,
      'Teste correção de data'
    );
    
    console.log(`✅ Log salvo com ID: ${logId}`);
    
    // 5. Aguardar
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 6. Buscar logs de hoje
    console.log(`🔍 Buscando logs de hoje (${todayString})...`);
    const todayLogs = await getMedicationLogsByDate(todayString);
    
    console.log(`📊 Logs encontrados: ${todayLogs.length}`);
    
    // 7. Verificar se o log foi encontrado
    const foundLog = todayLogs.find(log => log.id === logId);
    
    if (foundLog) {
      console.log('✅ SUCESSO! Log encontrado:');
      console.log(`   Medicamento: ${foundLog.medication}`);
      console.log(`   Scheduled: ${foundLog.scheduled_time}`);
      console.log(`   Taken: ${foundLog.taken_time}`);
      console.log(`   Status: ${foundLog.status}`);
      
      // 8. Testar comparação de horários
      const scheduledDate = new Date(foundLog.scheduled_time);
      const testDate = new Date(scheduledTimeISO);
      const timeDiff = Math.abs(scheduledDate.getTime() - testDate.getTime());
      
      console.log('\n⏰ TESTE DE COMPARAÇÃO:');
      console.log(`   Salvo: ${foundLog.scheduled_time}`);
      console.log(`   Teste: ${scheduledTimeISO}`);
      console.log(`   Diferença: ${timeDiff}ms`);
      console.log(`   Match (5min): ${timeDiff < 300000 ? '✅' : '❌'}`);
      
      return { success: true, logId, foundLog };
      
    } else {
      console.log('❌ FALHA! Log não encontrado');
      console.log('\nLogs disponíveis:');
      todayLogs.forEach((log, index) => {
        console.log(`${index + 1}. ${log.medication} - ${log.scheduled_time}`);
      });
      
      return { success: false, logId, todayLogs };
    }
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
    return { success: false, error: error.message };
  }
}

// Teste de busca por diferentes datas
async function testDateSearch() {
  console.log('\n📅 TESTE: BUSCA POR DIFERENTES DATAS');
  console.log('=' .repeat(40));
  
  const today = new Date();
  const testDates = [
    today.toISOString().split('T')[0], // Hoje
    new Date(today.getTime() - 24*60*60*1000).toISOString().split('T')[0], // Ontem
    new Date(today.getTime() + 24*60*60*1000).toISOString().split('T')[0], // Amanhã
  ];
  
  for (const date of testDates) {
    try {
      console.log(`\n🔍 Buscando logs para: ${date}`);
      const logs = await getMedicationLogsByDate(date);
      console.log(`   Encontrados: ${logs.length} logs`);
      
      if (logs.length > 0) {
        logs.forEach((log, index) => {
          console.log(`   ${index + 1}. ${log.medication} - ${log.scheduled_time}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }
  }
}

// Executar testes
async function runDateFixTests() {
  console.log('🔧 INICIANDO TESTES DE CORREÇÃO DE DATA');
  console.log('=' .repeat(50));
  
  const result1 = await testDateFix();
  await testDateSearch();
  
  console.log('\n📊 RESUMO:');
  console.log(`Correção de data: ${result1.success ? '✅ FUNCIONANDO' : '❌ FALHA'}`);
  
  if (result1.success) {
    console.log('\n🎉 PROBLEMA RESOLVIDO!');
    console.log('A busca por data agora está funcionando corretamente.');
    console.log('Os medicamentos marcados como tomados devem persistir após recarregar.');
  } else {
    console.log('\n⚠️ PROBLEMA PERSISTE');
    console.log('Verifique os logs acima para mais detalhes.');
  }
  
  return result1;
}

// Exportar funções
export { testDateFix, testDateSearch, runDateFixTests };

// Executar se chamado diretamente
if (require.main === module) {
  runDateFixTests().catch(console.error);
}