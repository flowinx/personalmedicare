# Debug: Persistência da Agenda 🔍

## Problema Reportado

Quando um medicamento é marcado como "concluído" na tela inicial:
- ✅ **Visualmente funciona**: Aparece como tomado imediatamente
- ❌ **Persistência falha**: Ao recarregar a tela, volta ao status original

## Modificações Implementadas para Debug 🛠️

### 1. Logs de Debug Adicionados

#### No `generateTodaysSchedule()`:
```typescript
// Logs para verificar quantos logs foram encontrados
console.log(`[HomeScreen] Logs encontrados para ${todayString}:`, todayLogs.length);

// Logs detalhados dos logs encontrados
if (todayLogs.length > 0) {
  console.log('[HomeScreen] Logs detalhados:', todayLogs.map(log => ({
    id: log.id,
    treatment_id: log.treatment_id,
    medication: log.medication,
    scheduled_time: log.scheduled_time,
    status: log.status
  })));
}

// Logs de comparação de horários
if (__DEV__ && log.treatment_id === treatment.id) {
  console.log(`[HomeScreen] Comparando horários para ${treatment.medication}:`);
  console.log(`  Log: ${log.scheduled_time}`);
  console.log(`  Atual: ${currentTime.toISOString()}`);
  console.log(`  Diferença: ${timeDiff}ms`);
  console.log(`  Match: ${matches}`);
}
```

#### No `handleMarkAsDone()`:
```typescript
// Log do que está sendo salvo
console.log('[HomeScreen] Marcando medicamento como tomado:', {
  scheduleId,
  medication: scheduleItem.medication,
  treatment_id: scheduleItem.treatment_id,
  member_id: scheduleItem.member_id,
  scheduled_time: scheduleItem.scheduled_time
});

// Log de confirmação de salvamento
console.log('[HomeScreen] ✅ Medicamento salvo no banco com ID:', logId);
```

### 2. Tolerância de Horário Aumentada

**Antes**: 1 minuto (60.000ms)
```typescript
Math.abs(new Date(log.scheduled_time).getTime() - currentTime.getTime()) < 60000
```

**Agora**: 5 minutos (300.000ms)
```typescript
Math.abs(new Date(log.scheduled_time).getTime() - currentTime.getTime()) < 300000
```

### 3. Testes de Debug Criados

#### `debug_schedule_persistence.js`
- Simula exatamente a função `generateTodaysSchedule`
- Testa salvamento e recuperação de logs
- Verifica comparação de horários

#### `test_schedule_debug.js`
- Teste simples de salvar e buscar
- Simulação completa da agenda
- Verificação de comparação de horários

## Como Debugar o Problema 🔬

### Passo 1: Executar Teste Inicial
```bash
node test_schedule_debug.js
```

**O que observar**:
- Quantos logs existem atualmente
- Se o teste consegue salvar e recuperar logs
- Se a comparação de horários está funcionando

### Passo 2: Testar no App com Logs
1. Abrir o app em modo desenvolvimento
2. Ir para a tela inicial
3. Observar os logs no console:
   ```
   [HomeScreen] Logs encontrados para 2025-01-30: X
   [HomeScreen] Logs detalhados: [...]
   ```

### Passo 3: Marcar Medicamento como Tomado
1. Clicar em um medicamento pendente
2. Observar os logs:
   ```
   [HomeScreen] Marcando medicamento como tomado: {...}
   [HomeScreen] ✅ Medicamento salvo no banco com ID: abc123
   ```

### Passo 4: Recarregar Tela (Pull to Refresh)
1. Fazer pull-to-refresh na tela
2. Observar os logs de `generateTodaysSchedule`:
   ```
   [HomeScreen] Logs encontrados para 2025-01-30: X+1
   [HomeScreen] Comparando horários para Medicamento:
     Log: 2025-01-30T10:30:00.000Z
     Atual: 2025-01-30T10:30:00.000Z
     Diferença: 0ms
     Match: true
   [HomeScreen] ✅ Medicamento Medicamento marcado como TOMADO
   ```

### Passo 5: Verificar Agenda Final
Observar o log da agenda final:
```
[HomeScreen] Agenda final: [
  {
    medication: "Medicamento",
    scheduled_time: "2025-01-30T10:30:00.000Z",
    status: "tomado",
    log_id: "abc123"
  }
]
```

## Possíveis Causas do Problema 🎯

### 1. Logs Não Estão Sendo Salvos
**Sintomas**:
- Log de salvamento não aparece
- Erro na função `markMedicationAsTaken`

**Verificação**:
```bash
node test_schedule_debug.js
```

### 2. Logs Não Estão Sendo Encontrados
**Sintomas**:
- Logs são salvos mas não aparecem na busca
- `getMedicationLogsByDate` retorna array vazio

**Verificação**:
- Verificar se a data está correta
- Verificar se o `userId` está correto

### 3. Comparação de Horários Falha
**Sintomas**:
- Logs são encontrados mas não fazem match
- Diferença de horário muito grande

**Verificação**:
- Observar logs de comparação
- Verificar se tolerância de 5 minutos é suficiente

### 4. Estado Local Não Atualiza
**Sintomas**:
- Logs fazem match mas interface não atualiza
- `setTodaysSchedule` não é chamado

**Verificação**:
- Verificar se `loadData` está sendo chamado
- Verificar se `generateTodaysSchedule` está sendo aguardado

## Soluções Baseadas no Debug 🛠️

### Se Logs Não Estão Sendo Salvos:
```typescript
// Verificar se função está sendo chamada
console.log('Chamando markMedicationAsTaken...');
const logId = await markMedicationAsTaken(...);
console.log('Log salvo:', logId);
```

### Se Logs Não Fazem Match:
```typescript
// Aumentar tolerância ainda mais
const matches = timeDiff < 600000; // 10 minutos

// Ou usar comparação mais flexível
const matches = log.treatment_id === treatment.id && 
               isSameDay(new Date(log.scheduled_time), currentTime);
```

### Se Estado Não Atualiza:
```typescript
// Forçar recarregamento após salvar
await markMedicationAsTaken(...);
await loadData(); // Recarregar dados
```

## Checklist de Debug ✅

- [ ] Executar `test_schedule_debug.js`
- [ ] Verificar logs no console do app
- [ ] Marcar medicamento e observar logs de salvamento
- [ ] Fazer pull-to-refresh e observar logs de busca
- [ ] Verificar se comparação de horários funciona
- [ ] Confirmar se agenda final mostra status correto

## Próximos Passos 🚀

1. **Execute os testes** para identificar onde está o problema
2. **Observe os logs** no console durante o uso do app
3. **Reporte os resultados** para implementar a correção específica

Com esses logs detalhados, conseguiremos identificar exatamente onde está o problema na cadeia de persistência! 🔍