/**
 * DEBUG - PERSISTÊNCIA DA AGENDA
 * 
 * Este script debugga especificamente o problema de persistência
 * na tela inicial quando medicamentos são marcados como tomados.
 */

import { 
  markMedicationAsTaken, 
  getMedicationLogsByDate,
  getAllTreatments,
  getAllMembers 
} from './services/firebase';

// Simular a função generateTodaysSchedule exatamente como no HomeScreen
async function debugGenerateTodaysSchedule(treatments, members) {
  console.log('🔍 DEBUG: Simulando generateTodaysSchedule');
  console.log('=' .repeat(50));
  
  const today = new Date();
  const schedule = [];

  // Buscar logs de medicamentos de hoje
  const todayString = today.toISOString().split('T')[0];
  console.log(`📅 Data de hoje: ${todayString}`);
  
  let todayLogs = [];
  
  try {
    todayLogs = await getMedicationLogsByDate(todayString);
    console.log(`📋 Logs encontrados: ${todayLogs.length}`);
    
    if (todayLogs.length > 0) {
      console.log('\n📊 LOGS DETALHADOS:');
      todayLogs.forEach((log, index) => {
        console.log(`${index + 1}. ${log.medication}`);
        console.log(`   Treatment ID: ${log.treatment_id}`);
        console.log(`   Scheduled: ${log.scheduled_time}`);
        console.log(`   Taken: ${log.taken_time}`);
        console.log(`   Status: ${log.status}`);
        console.log('');
      });
    }
  } catch (error) {
    console.warn('⚠️ Erro ao buscar logs:', error.message);
  }

  treatments.forEach(treatment => {
    if (treatment.status !== 'ativo') return;

    const member = members.find(m => m.id === treatment.member_id);
    if (!member) return;

    const startDate = new Date(treatment.start_datetime);
    if (startDate > today) return;

    console.log(`\n🏥 Processando tratamento: ${treatment.medication} (${member.name})`);

    // Generate schedule items for today based on frequency
    const frequencyHours = treatment.frequency_unit === 'horas' ? treatment.frequency_value : treatment.frequency_value * 24;
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    let currentTime = new Date(startDate);

    // Calculate next time based on frequency
    if (currentTime < todayStart) {
      const timeDiff = todayStart.getTime() - currentTime.getTime();
      const frequencyMs = frequencyHours * 60 * 60 * 1000;
      const periodsPassed = Math.floor(timeDiff / frequencyMs) + 1;
      currentTime = new Date(currentTime.getTime() + (periodsPassed * frequencyMs));
    }

    // Generate times for today
    while (currentTime <= todayEnd) {
      const scheduleId = `${treatment.id}_${currentTime.getTime()}`;
      
      console.log(`   ⏰ Horário gerado: ${currentTime.toISOString()}`);
      console.log(`   🆔 Schedule ID: ${scheduleId}`);
      
      // Verificar se existe log para este horário específico
      const existingLog = todayLogs.find(log => {
        const timeDiff = Math.abs(new Date(log.scheduled_time).getTime() - currentTime.getTime());
        const matches = log.treatment_id === treatment.id && timeDiff < 60000; // 1 minuto de tolerância
        
        if (matches) {
          console.log(`   ✅ LOG ENCONTRADO! Diferença: ${timeDiff}ms`);
        } else if (log.treatment_id === treatment.id) {
          console.log(`   ❌ Log do mesmo tratamento, mas horário diferente:`);
          console.log(`      Log: ${log.scheduled_time}`);
          console.log(`      Atual: ${currentTime.toISOString()}`);
          console.log(`      Diferença: ${timeDiff}ms`);
        }
        
        return matches;
      });

      const status = existingLog ? 'tomado' : 'pendente';
      console.log(`   📊 Status final: ${status}`);

      schedule.push({
        id: scheduleId,
        scheduled_time: currentTime.toISOString(),
        status: status,
        treatment_id: treatment.id,
        medication: treatment.medication,
        dosage: treatment.dosage,
        member_name: member.name,
        member_avatar_uri: member.avatar_uri || '',
        member_id: member.id,
        log_id: existingLog?.id || null,
      });

      currentTime = new Date(currentTime.getTime() + (frequencyHours * 60 * 60 * 1000));
    }
  });

  const sortedSchedule = schedule.sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());
  
  console.log('\n📋 AGENDA FINAL:');
  sortedSchedule.forEach((item, index) => {
    console.log(`${index + 1}. ${item.medication} - ${item.status.toUpperCase()}`);
    console.log(`   Horário: ${new Date(item.scheduled_time).toLocaleString()}`);
    console.log(`   Log ID: ${item.log_id || 'Nenhum'}`);
    console.log('');
  });

  return sortedSchedule;
}

// Teste completo de persistência
async function testCompletePersistence() {
  console.log('🧪 TESTE COMPLETO DE PERSISTÊNCIA');
  console.log('=' .repeat(50));
  
  try {
    // 1. Buscar dados
    console.log('📋 Buscando tratamentos e membros...');
    const [treatments, members] = await Promise.all([
      getAllTreatments(),
      getAllMembers()
    ]);
    
    console.log(`✅ ${treatments.length} tratamentos, ${members.length} membros`);
    
    if (treatments.length === 0) {
      console.log('⚠️ Nenhum tratamento encontrado para testar');
      return;
    }

    // 2. Gerar agenda inicial
    console.log('\n🔄 Gerando agenda inicial...');
    const initialSchedule = await debugGenerateTodaysSchedule(treatments, members);
    
    const pendingItems = initialSchedule.filter(item => item.status === 'pendente');
    if (pendingItems.length === 0) {
      console.log('⚠️ Nenhum item pendente para testar');
      return;
    }

    // 3. Marcar primeiro item como tomado
    const testItem = pendingItems[0];
    console.log(`\n💊 Marcando como tomado: ${testItem.medication}`);
    console.log(`   Horário agendado: ${testItem.scheduled_time}`);
    
    await markMedicationAsTaken(
      testItem.treatment_id,
      testItem.member_id,
      testItem.medication,
      testItem.dosage,
      testItem.scheduled_time,
      'Teste de debug'
    );
    
    console.log('✅ Medicamento marcado como tomado');

    // 4. Aguardar um pouco (simular delay real)
    console.log('\n⏳ Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Gerar agenda novamente (simular refresh)
    console.log('\n🔄 Gerando agenda após marcar como tomado...');
    const updatedSchedule = await debugGenerateTodaysSchedule(treatments, members);
    
    // 6. Verificar se o item está marcado como tomado
    const updatedItem = updatedSchedule.find(item => item.id === testItem.id);
    
    if (updatedItem) {
      console.log('\n🎯 RESULTADO DO TESTE:');
      console.log(`Medicamento: ${updatedItem.medication}`);
      console.log(`Status antes: pendente`);
      console.log(`Status depois: ${updatedItem.status}`);
      console.log(`Log ID: ${updatedItem.log_id}`);
      
      if (updatedItem.status === 'tomado') {
        console.log('✅ SUCESSO! Persistência funcionando corretamente');
      } else {
        console.log('❌ FALHA! Medicamento voltou ao status pendente');
        console.log('\n🔍 POSSÍVEIS CAUSAS:');
        console.log('1. Problema na comparação de horários');
        console.log('2. Log não foi salvo corretamente');
        console.log('3. Query de busca não encontrou o log');
      }
    } else {
      console.log('❌ Item não encontrado na agenda atualizada');
    }

  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Teste específico de comparação de horários
async function testTimeComparison() {
  console.log('\n⏰ TESTE DE COMPARAÇÃO DE HORÁRIOS');
  console.log('=' .repeat(40));
  
  // Simular horários com pequenas diferenças
  const baseTime = new Date();
  const scheduledTime = baseTime.toISOString();
  
  const testCases = [
    { name: 'Exato', time: new Date(baseTime).toISOString() },
    { name: '30s depois', time: new Date(baseTime.getTime() + 30000).toISOString() },
    { name: '1min depois', time: new Date(baseTime.getTime() + 60000).toISOString() },
    { name: '2min depois', time: new Date(baseTime.getTime() + 120000).toISOString() },
  ];
  
  console.log(`Horário base: ${scheduledTime}`);
  
  testCases.forEach(testCase => {
    const timeDiff = Math.abs(new Date(testCase.time).getTime() - new Date(scheduledTime).getTime());
    const matches = timeDiff < 60000; // 1 minuto de tolerância
    
    console.log(`${testCase.name}: ${testCase.time}`);
    console.log(`  Diferença: ${timeDiff}ms`);
    console.log(`  Match: ${matches ? '✅' : '❌'}`);
    console.log('');
  });
}

// Executar testes
async function runDebugTests() {
  await testCompletePersistence();
  await testTimeComparison();
  
  console.log('\n🏁 DEBUG CONCLUÍDO');
}

// Exportar funções
export { debugGenerateTodaysSchedule, testCompletePersistence, testTimeComparison, runDebugTests };

// Executar se chamado diretamente
if (require.main === module) {
  runDebugTests().catch(console.error);
}