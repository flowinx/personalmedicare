// Teste específico para simular o comportamento da tela addTreatment
const fetch = require('node-fetch');

// Simular a configuração do Gemini
const GeminiConfig = {
  API_KEY: 'AIzaSyCNL5rlz2joAKG8_yD-_c1JTmPFI3aj2JA',
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent'
};

// Simular a função fetchMedicationInfo exatamente como está no código
async function fetchMedicationInfo(medicationName) {
  if (!medicationName.trim()) {
    throw new Error('Nome do medicamento não pode estar vazio');
  }

  try {
    const prompt = `Forneça informações sobre o medicamento "${medicationName}" de forma SUPER AMIGÁVEL e SIMPLES, como se estivesse explicando para um amigo:

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
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };
    
    const response = await fetch(`${GeminiConfig.BASE_URL}?key=${GeminiConfig.API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Gemini] Erro na resposta:', errorText);
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error('[Gemini] Erro retornado pela API:', data.error);
      throw new Error(data.error.message || 'Erro ao buscar informações do medicamento');
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Nenhuma informação encontrada para este medicamento');
    }

    const text = data.candidates[0].content.parts[0].text;

    return text.trim();

  } catch (error) {
    console.error('[Gemini] Erro ao buscar informações do medicamento:', error);
    console.error('[Gemini] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    // Verificar se é erro de API key inválida
    if (error?.message?.includes('API Key not found') || error?.message?.includes('API_KEY_INVALID')) {
      const apiKeyErrorResponse = `💊 ${medicationName}\n\n⚠️ Serviço de informações temporariamente indisponível\n\nPara obter informações detalhadas sobre este medicamento:\n\n🏥 Consulte seu médico ou farmacêutico\n📱 Use apps como Consulta Remédios ou Bula.med.br\n🌐 Acesse o site da ANVISA (anvisa.gov.br)\n\n💡 Dica: Sempre confirme informações sobre medicamentos com um profissional de saúde qualificado.`;
      return apiKeyErrorResponse;
    }
    
    // Fallback para outros erros
    const fallbackResponse = `💊 ${medicationName}\n\n📋 Informações não disponíveis no momento. Consulte seu médico ou farmacêutico para orientações sobre este medicamento.`;
    return fallbackResponse;
  }
}

// Simular o comportamento da tela
async function simulateButtonPress(medicationName) {
  console.log(`🧪 Simulando clique no botão de informações para: ${medicationName}`);
  console.log('📱 Estado: setLoadingMedicationInfo(true)');
  console.log('📱 Estado: setShowMedicationInfoModal(true)');
  
  try {
    console.log('🔄 Chamando fetchMedicationInfo...');
    const info = await fetchMedicationInfo(medicationName.trim());
    console.log('📱 Estado: setMedicationInfo(info)');
    console.log('✅ Informações obtidas com sucesso!');
    console.log('='.repeat(60));
    console.log('📋 CONTEÚDO DO MODAL:');
    console.log('='.repeat(60));
    console.log(info);
    console.log('='.repeat(60));
  } catch (error) {
    console.log('📱 Estado: setMedicationInfo(fallback message)');
    console.error('❌ Erro capturado:', error.message);
    console.log('📋 Mensagem de fallback seria exibida');
  } finally {
    console.log('📱 Estado: setLoadingMedicationInfo(false)');
  }
}

// Testar com diferentes medicamentos
async function runTests() {
  console.log('🚀 Iniciando testes da funcionalidade de informações do medicamento\n');
  
  await simulateButtonPress('Paracetamol');
  console.log('\n' + '='.repeat(80) + '\n');
  
  await simulateButtonPress('Dipirona');
  console.log('\n' + '='.repeat(80) + '\n');
  
  await simulateButtonPress('Ibuprofeno');
}

runTests();