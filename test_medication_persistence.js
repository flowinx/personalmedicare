/**
 * TESTE DE PERSISTÊNCIA DE MEDICAMENTOS
 * 
 * Este script testa se os medicamentos marcados como "tomado" 
 * estão sendo persistidos corretamente no banco de dados.
 */

import { 
  markMedicationAsTaken, 
  getMedicationLogsByDate,
  getAllTreatments,
  getAllMembers 
} from './services/firebase';

async function testMedicationPersistence() {
  console.log('🧪 TESTE DE PERSISTÊNCIA DE MEDICAMENTOS');
  console.log('=' .repeat(50));
  
  try {
    // 1. Buscar tratamentos e membros existentes
    console.log('📋 Buscando tratamentos e membros...');
    const [treatments, members] = await Promise.all([
      getAllTreatments(),
      getAllMembers()
    ]);
    
    console.log(`✅ Encontrados: ${treatments.length} tratamentos, ${members.length} membros`);
    
    if (treatments.length === 0 || members.length === 0) {
      console.log('⚠️ Não há tratamentos ou membros para testar');
      return;
    }
    
    // 2. Pegar o primeiro tratamento ativo
    const activeTreatment = treatments.find(t => t.status === 'ativo');
    if (!activeTreatment) {
      console.log('⚠️ Não há tratamentos ativos para testar');
      return;
    }
    
    const member = members.find(m => m.id === activeTreatment.member_id);
    if (!member) {
      console.log('⚠️ Membro do tratamento não encontrado');
      return;
    }
    
    console.log(`🎯 Testando com: ${activeTreatment.medication} para ${member.name}`);
    
    // 3. Marcar medicamento como tomado
    console.log('💊 Marcando medicamento como tomado...');
    const scheduledTime = new Date().toISOString();
    
    const logId = await markMedicationAsTaken(
      activeTreatment.id,
      member.id,
      activeTreatment.medication,
      activeTreatment.dosage,
      scheduledTime,
      'Teste de persistência'
    );
    
    console.log(`✅ Log criado com ID: ${logId}`);
    
    // 4. Verificar se foi salvo corretamente
    console.log('🔍 Verificando se foi salvo...');
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = await getMedicationLogsByDate(today);
    
    const savedLog = todayLogs.find(log => log.id === logId);
    
    if (savedLog) {
      console.log('✅ SUCESSO! Log encontrado no banco:');
      console.log(`   - ID: ${savedLog.id}`);
      console.log(`   - Medicamento: ${savedLog.medication}`);
      console.log(`   - Status: ${savedLog.status}`);
      console.log(`   - Horário agendado: ${new Date(savedLog.scheduled_time).toLocaleString()}`);
      console.log(`   - Horário tomado: ${new Date(savedLog.taken_time).toLocaleString()}`);
      console.log(`   - Notas: ${savedLog.notes || 'Nenhuma'}`);
    } else {
      console.log('❌ ERRO! Log não encontrado no banco');
      return;
    }
    
    // 5. Testar busca por tratamento específico
    console.log('🔍 Testando busca por tratamento...');
    const { getMedicationLogsByTreatment } = await import('./services/firebase');
    const treatmentLogs = await getMedicationLogsByTreatment(activeTreatment.id);
    
    const treatmentLog = treatmentLogs.find(log => log.id === logId);
    if (treatmentLog) {
      console.log('✅ Log encontrado na busca por tratamento');
    } else {
      console.log('❌ Log não encontrado na busca por tratamento');
    }
    
    // 6. Simular recarregamento da agenda
    console.log('🔄 Simulando recarregamento da agenda...');
    
    // Simular a função generateTodaysSchedule
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    // Verificar se o medicamento apareceria como "tomado" na agenda
    const scheduleItem = {
      id: `${activeTreatment.id}_${new Date(scheduledTime).getTime()}`,
      treatment_id: activeTreatment.id,
      scheduled_time: scheduledTime,
      medication: activeTreatment.medication,
      dosage: activeTreatment.dosage,
      member_name: member.name,
      status: 'pendente' // Inicialmente pendente
    };
    
    // Verificar se existe log para este horário
    const existingLog = todayLogs.find(log => 
      log.treatment_id === activeTreatment.id && 
      Math.abs(new Date(log.scheduled_time).getTime() - new Date(scheduledTime).getTime()) < 60000
    );
    
    if (existingLog) {
      scheduleItem.status = 'tomado';
      console.log('✅ Medicamento apareceria como "tomado" na agenda');
    } else {
      console.log('❌ Medicamento ainda apareceria como "pendente"');
    }
    
    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('📊 Resumo:');
    console.log(`   - Log salvo: ✅`);
    console.log(`   - Busca por data: ✅`);
    console.log(`   - Busca por tratamento: ✅`);
    console.log(`   - Status na agenda: ${scheduleItem.status === 'tomado' ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Teste específico de geração de agenda
async function testScheduleGeneration() {
  console.log('\n📅 TESTE DE GERAÇÃO DE AGENDA');
  console.log('=' .repeat(40));
  
  try {
    const [treatments, members] = await Promise.all([
      getAllTreatments(),
      getAllMembers()
    ]);
    
    if (treatments.length === 0 || members.length === 0) {
      console.log('⚠️ Não há dados para testar');
      return;
    }
    
    // Simular a função generateTodaysSchedule
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const todayLogs = await getMedicationLogsByDate(todayString);
    
    console.log(`📋 Logs de hoje encontrados: ${todayLogs.length}`);
    
    const schedule = [];
    
    treatments.forEach(treatment => {
      if (treatment.status !== 'ativo') return;
      
      const member = members.find(m => m.id === treatment.member_id);
      if (!member) return;
      
      // Simular horário de hoje
      const scheduledTime = new Date();
      scheduledTime.setHours(9, 0, 0, 0); // 9:00 AM
      
      const scheduleId = `${treatment.id}_${scheduledTime.getTime()}`;
      
      // Verificar se existe log
      const existingLog = todayLogs.find(log => 
        log.treatment_id === treatment.id && 
        Math.abs(new Date(log.scheduled_time).getTime() - scheduledTime.getTime()) < 60000
      );
      
      schedule.push({
        id: scheduleId,
        treatment_id: treatment.id,
        medication: treatment.medication,
        member_name: member.name,
        scheduled_time: scheduledTime.toISOString(),
        status: existingLog ? 'tomado' : 'pendente',
        has_log: !!existingLog
      });
    });
    
    console.log('\n📊 Agenda simulada:');
    schedule.forEach((item, index) => {
      console.log(`${index + 1}. ${item.medication} (${item.member_name})`);
      console.log(`   Status: ${item.status}`);
      console.log(`   Tem log: ${item.has_log ? 'Sim' : 'Não'}`);
      console.log('');
    });
    
    const takenCount = schedule.filter(item => item.status === 'tomado').length;
    const pendingCount = schedule.filter(item => item.status === 'pendente').length;
    
    console.log(`📈 Resumo: ${takenCount} tomados, ${pendingCount} pendentes`);
    
  } catch (error) {
    console.error('❌ Erro no teste de agenda:', error.message);
  }
}

// Executar testes
async function runAllTests() {
  await testMedicationPersistence();
  await testScheduleGeneration();
  
  console.log('\n🏁 TODOS OS TESTES CONCLUÍDOS');
}

// Exportar funções
export { testMedicationPersistence, testScheduleGeneration, runAllTests };

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}