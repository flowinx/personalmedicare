/**
 * TESTE ESPECÍFICO - DEBUG DA AGENDA
 * 
 * Este teste verifica especificamente se os logs estão sendo
 * salvos e recuperados corretamente na agenda.
 */

import { 
  markMedicationAsTaken, 
  getMedicationLogsByDate,
  getAllTreatments,
  getAllMembers 
} from './services/firebase';

// Teste simples de salvar e buscar
async function testSaveAndRetrieve() {
  console.log('🧪 TESTE: SALVAR E BUSCAR LOG');
  console.log('=' .repeat(40));
  
  try {
    // 1. Buscar um tratamento para testar
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
    
    // 2. Criar um horário específico para teste
    const now = new Date();
    const testTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30, 0); // 10:30 AM hoje
    const scheduledTimeISO = testTime.toISOString();
    
    console.log(`⏰ Horário de teste: ${scheduledTimeISO}`);
    
    // 3. Salvar o log
    console.log('💾 Salvando log...');
    const logId = await markMedicationAsTaken(
      treatment.id,
      member.id,
      treatment.medication,
      treatment.dosage,
      scheduledTimeISO,
      'Teste de debug'
    );
    
    console.log(`✅ Log salvo com ID: ${logId}`);
    
    // 4. Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 5. Buscar logs de hoje
    const today = new Date().toISOString().split('T')[0];
    console.log(`🔍 Buscando logs de ${today}...`);
    
    const todayLogs = await getMedicationLogsByDate(today);
    console.log(`📊 Total de logs encontrados: ${todayLogs.length}`);
    
    // 6. Procurar o log específico
    const savedLog = todayLogs.find(log => log.id === logId);
    
    if (savedLog) {
      console.log('✅ LOG ENCONTRADO:');
      console.log(`   ID: ${savedLog.id}`);
      console.log(`   Treatment ID: ${savedLog.treatment_id}`);
      console.log(`   Medicamento: ${savedLog.medication}`);
      console.log(`   Horário agendado: ${savedLog.scheduled_time}`);
      console.log(`   Horário tomado: ${savedLog.taken_time}`);
      console.log(`   Status: ${savedLog.status}`);
    } else {
      console.log('❌ LOG NÃO ENCONTRADO!');
      console.log('Logs disponíveis:');
      todayLogs.forEach((log, index) => {
        console.log(`${index + 1}. ${log.medication} - ${log.scheduled_time}`);
      });
    }
    
    // 7. Testar comparação de horários
    console.log('\n⏰ TESTE DE COMPARAÇÃO DE HORÁRIOS:');
    
    if (savedLog) {
      // Simular diferentes horários para ver qual seria encontrado
      const testTimes = [
        testTime, // Exato
        new Date(testTime.getTime() + 30000), // +30s
        new Date(testTime.getTime() + 60000), // +1min
        new Date(testTime.getTime() + 300000), // +5min
        new Date(testTime.getTime() + 600000), // +10min
      ];
      
      testTimes.forEach((time, index) => {
        const timeDiff = Math.abs(new Date(savedLog.scheduled_time).getTime() - time.getTime());
        const matches1min = timeDiff < 60000; // 1 minuto
        const matches5min = timeDiff < 300000; // 5 minutos
        
        console.log(`Teste ${index + 1}: ${time.toISOString()}`);
        console.log(`  Diferença: ${timeDiff}ms`);
        console.log(`  Match 1min: ${matches1min ? '✅' : '❌'}`);
        console.log(`  Match 5min: ${matches5min ? '✅' : '❌'}`);
        console.log('');
      });
    }
    
    return { success: true, logId, savedLog };
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
    return { success: false, error: error.message };
  }
}

// Teste de simulação da agenda completa
async function testFullScheduleSimulation() {
  console.log('\n📅 TESTE: SIMULAÇÃO COMPLETA DA AGENDA');
  console.log('=' .repeat(50));
  
  try {
    // 1. Buscar dados
    const treatments = await getAllTreatments();
    const members = await getAllMembers();
    
    console.log(`📋 ${treatments.length} tratamentos, ${members.length} membros`);
    
    // 2. Buscar logs de hoje
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = await getMedicationLogsByDate(today);
    
    console.log(`📊 ${todayLogs.length} logs de hoje`);
    
    // 3. Simular geração da agenda
    const schedule = [];
    const todayDate = new Date();
    
    treatments.forEach(treatment => {
      if (treatment.status !== 'ativo') return;
      
      const member = members.find(m => m.id === treatment.member_id);
      if (!member) return;
      
      // Simular horário de hoje às 9:00
      const scheduledTime = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 9, 0, 0);
      const scheduleId = `${treatment.id}_${scheduledTime.getTime()}`;
      
      // Procurar log correspondente
      const existingLog = todayLogs.find(log => {
        const timeDiff = Math.abs(new Date(log.scheduled_time).getTime() - scheduledTime.getTime());
        return log.treatment_id === treatment.id && timeDiff < 300000; // 5 minutos
      });
      
      const status = existingLog ? 'tomado' : 'pendente';
      
      schedule.push({
        id: scheduleId,
        medication: treatment.medication,
        member_name: member.name,
        scheduled_time: scheduledTime.toISOString(),
        status: status,
        treatment_id: treatment.id,
        log_id: existingLog?.id || null
      });
      
      console.log(`${treatment.medication} (${member.name}): ${status.toUpperCase()}`);
      if (existingLog) {
        console.log(`  ✅ Log encontrado: ${existingLog.id}`);
      }
    });
    
    console.log(`\n📊 Agenda gerada: ${schedule.length} itens`);
    console.log(`   Tomados: ${schedule.filter(s => s.status === 'tomado').length}`);
    console.log(`   Pendentes: ${schedule.filter(s => s.status === 'pendente').length}`);
    
    return schedule;
    
  } catch (error) {
    console.error('❌ ERRO NA SIMULAÇÃO:', error.message);
    return [];
  }
}

// Executar todos os testes
async function runScheduleDebugTests() {
  console.log('🔍 INICIANDO TESTES DE DEBUG DA AGENDA');
  console.log('=' .repeat(60));
  
  const result1 = await testSaveAndRetrieve();
  const result2 = await testFullScheduleSimulation();
  
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log(`Salvar/Buscar: ${result1.success ? '✅' : '❌'}`);
  console.log(`Simulação agenda: ${result2.length > 0 ? '✅' : '❌'}`);
  
  if (!result1.success) {
    console.log(`Erro: ${result1.error}`);
  }
  
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('1. Execute este teste');
  console.log('2. Marque um medicamento como tomado no app');
  console.log('3. Execute o teste novamente');
  console.log('4. Verifique se o log aparece');
  
  return { result1, result2 };
}

// Exportar funções
export { testSaveAndRetrieve, testFullScheduleSimulation, runScheduleDebugTests };

// Executar se chamado diretamente
if (require.main === module) {
  runScheduleDebugTests().catch(console.error);
}