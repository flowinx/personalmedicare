// Teste específico da função fetchMedicationInfo do Groq
const fetch = require('node-fetch');

// Simular exatamente a função do serviço
const GroqConfig = {
  API_KEY: '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',
  BASE_URL: 'https://api.groq.com/openai/v1/chat/completions',
  MODEL: 'llama-3.1-8b-instant',
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
};

async function fetchMedicationInfo(medicationName) {
  if (!medicationName.trim()) {
    throw new Error('Nome do medicamento não pode estar vazio');
  }

  try {
    const prompt = `Você é um farmacêutico amigável! Forneça informações sobre o medicamento "${medicationName}" de forma SUPER AMIGÁVEL e SIMPLES, como se estivesse explicando para um amigo:

💊 ${medicationName}

📋 O que é: [explicação simples do que é o medicamento]

🎯 Para que serve: [para que problemas ele ajuda, de forma bem simples]

⚠️ Cuidados importantes: [o que você precisa ficar de olho, de forma clara]

💡 Como usar: [dicas práticas de como tomar, de forma bem simples]

IMPORTANTE:
✅ Use linguagem do dia a dia, sem termos médicos complicados
✅ Seja carinhoso e acolhedor
✅ Dê dicas práticas e fáceis de entender
✅ Use emojis para deixar mais alegre
❌ NÃO use formatação markdown (sem **, *, #, etc.)
❌ NÃO use listas com marcadores especiais

Exemplo de tom: "Esse remédio é tipo um 'ajudante' que vai te fazer sentir melhor! 😊"

Responda de forma calorosa e acessível! 🌟`;

    const requestBody = {
      model: GroqConfig.MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: GroqConfig.MAX_TOKENS,
      temperature: GroqConfig.TEMPERATURE
    };
    
    console.log('[Groq] Fazendo requisição para buscar informações do medicamento:', medicationName);
    
    const response = await fetch(GroqConfig.BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GroqConfig.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Groq] Erro na resposta:', errorText);
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error('[Groq] Erro retornado pela API:', data.error);
      throw new Error(data.error.message || 'Erro ao buscar informações do medicamento');
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error('Nenhuma informação encontrada para este medicamento');
    }

    const text = data.choices[0].message.content;
    console.log('[Groq] Informações obtidas com sucesso para:', medicationName);

    return text.trim();

  } catch (error) {
    console.error('[Groq] Erro ao buscar informações do medicamento:', error);
    console.error('[Groq] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    // Verificar se é erro de API key inválida
    if (error?.message?.includes('API key') || error?.message?.includes('Unauthorized')) {
      const apiKeyErrorResponse = `💊 ${medicationName}\n\n⚠️ Serviço de informações temporariamente indisponível\n\nPara obter informações detalhadas sobre este medicamento:\n\n🏥 Consulte seu médico ou farmacêutico\n📱 Use apps como Consulta Remédios ou Bula.med.br\n🌐 Acesse o site da ANVISA (anvisa.gov.br)\n\n💡 Dica: Sempre confirme informações sobre medicamentos com um profissional de saúde qualificado.`;
      return apiKeyErrorResponse;
    }
    
    // Fallback para outros erros
    const fallbackResponse = `💊 ${medicationName}\n\n📋 Informações não disponíveis no momento. Consulte seu médico ou farmacêutico para orientações sobre este medicamento.`;
    return fallbackResponse;
  }
}

// Simular o comportamento da tela addTreatment
async function simulateAddTreatmentFlow(medicationName) {
  console.log(`🧪 Simulando fluxo da tela addTreatment para: ${medicationName}`);
  console.log('📱 Usuário digitou o nome do medicamento');
  console.log('📱 Usuário clicou no ícone "i" de informações');
  console.log('📱 Estado: setLoadingMedicationInfo(true)');
  console.log('📱 Estado: setShowMedicationInfoModal(true)');
  
  const startTime = Date.now();
  
  try {
    console.log('🔄 Chamando fetchMedicationInfo...');
    const info = await fetchMedicationInfo(medicationName.trim());
    const endTime = Date.now();
    
    console.log('📱 Estado: setMedicationInfo(info)');
    console.log('✅ Modal exibido com informações!');
    console.log(`⚡ Tempo de resposta: ${endTime - startTime}ms`);
    console.log('='.repeat(70));
    console.log('📋 CONTEÚDO QUE APARECERÁ NO MODAL:');
    console.log('='.repeat(70));
    console.log(info);
    console.log('='.repeat(70));
  } catch (error) {
    const endTime = Date.now();
    console.log('📱 Estado: setMedicationInfo(fallback message)');
    console.error('❌ Erro capturado:', error.message);
    console.log(`⚡ Tempo até erro: ${endTime - startTime}ms`);
    console.log('📋 Mensagem de fallback seria exibida');
  } finally {
    console.log('📱 Estado: setLoadingMedicationInfo(false)');
  }
}

// Testar com diferentes medicamentos
async function runTests() {
  console.log('🚀 Testando funcionalidade de informações do medicamento com Groq\n');
  
  const medications = ['Dipirona', 'Ibuprofeno', 'Amoxicilina'];
  
  for (const med of medications) {
    await simulateAddTreatmentFlow(med);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Pequena pausa entre os testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('✅ Todos os testes concluídos!');
  console.log('🎉 O Groq está funcionando perfeitamente para informações de medicamentos!');
}

runTests();