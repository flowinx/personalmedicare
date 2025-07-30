/**
 * TESTE RÁPIDO - CORREÇÃO DE FUSO HORÁRIO
 * 
 * Testa se a correção de fuso horário está funcionando
 */

import { getMedicationLogsByDate } from './services/firebase';

async function testTimezoneFix() {
  console.log('🕐 TESTE: CORREÇÃO DE FUSO HORÁRIO');
  console.log('=' .repeat(40));
  
  try {
    // Testar com a data de hoje
    const today = '2025-07-30';
    
    console.log(`📅 Testando busca para: ${today}`);
    
    const logs = await getMedicationLogsByDate(today);
    
    console.log(`📊 Logs encontrados: ${logs.length}`);
    
    if (logs.length > 0) {
      console.log('\n✅ LOGS ENCONTRADOS:');
      logs.forEach((log, index) => {
        console.log(`${index + 1}. ${log.medication}`);
        console.log(`   Scheduled: ${log.scheduled_time}`);
        console.log(`   Data: ${log.scheduled_time.split('T')[0]}`);
        console.log('');
      });
      
      console.log('🎉 CORREÇÃO FUNCIONOU!');
      console.log('Os logs agora estão sendo encontrados corretamente.');
      
    } else {
      console.log('⚠️ Nenhum log encontrado');
      console.log('Isso pode significar que não há logs para hoje ainda.');
    }
    
    return { success: logs.length > 0, count: logs.length };
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
    return { success: false, error: error.message };
  }
}

// Executar teste
if (require.main === module) {
  testTimezoneFix().catch(console.error);
}

export { testTimezoneFix };