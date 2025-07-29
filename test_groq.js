// Teste do serviço Groq
const fetch = require('node-fetch');

// Configuração do Groq (substitua pela sua chave)
const GroqConfig = {
  API_KEY: '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',
  BASE_URL: 'https://api.groq.com/openai/v1/chat/completions',
  MODEL: 'llama-3.1-8b-instant',
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
};

async function testGroqMedicationInfo(medicationName) {
  console.log(`🧪 Testando Groq com medicamento: ${medicationName}`);
  
  if (!GroqConfig.API_KEY || GroqConfig.API_KEY === 'your_groq_api_key_here') {
    console.log('❌ Chave da API do Groq não configurada!');
    console.log('📝 Para obter uma chave gratuita:');
    console.log('   1. Acesse: https://console.groq.com/');
    console.log('   2. Crie uma conta gratuita');
    console.log('   3. Gere uma API Key');
    console.log('   4. Substitua no arquivo .env: GROQ_API_KEY=sua_chave_aqui');
    return;
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
    
    console.log('📡 Fazendo requisição para o Groq...');
    
    const response = await fetch(GroqConfig.BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GroqConfig.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`📊 Status da resposta: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', errorText);
      return;
    }

    const data = await response.json();

    if (data.error) {
      console.error('❌ Erro retornado pela API:', data.error);
      return;
    }

    if (!data.choices || data.choices.length === 0) {
      console.error('❌ Nenhuma informação encontrada');
      return;
    }

    const text = data.choices[0].message.content;
    console.log('✅ Resposta do Groq:');
    console.log('='.repeat(60));
    console.log(text.trim());
    console.log('='.repeat(60));
    
    // Mostrar estatísticas
    if (data.usage) {
      console.log('\n📊 Estatísticas:');
      console.log(`   Tokens de entrada: ${data.usage.prompt_tokens}`);
      console.log(`   Tokens de saída: ${data.usage.completion_tokens}`);
      console.log(`   Total de tokens: ${data.usage.total_tokens}`);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

async function testGroqSpeed() {
  console.log('\n🚀 Testando velocidade do Groq...');
  
  const startTime = Date.now();
  await testGroqMedicationInfo('Paracetamol');
  const endTime = Date.now();
  
  console.log(`⚡ Tempo de resposta: ${endTime - startTime}ms`);
  console.log('💡 O Groq é conhecido por ser muito mais rápido que outros modelos!');
}

// Executar testes
console.log('🧪 Iniciando testes do Groq\n');
testGroqSpeed();