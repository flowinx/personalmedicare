// Teste simples da função fetchMedicationInfo
const fetch = require('node-fetch');

const GeminiConfig = {
  API_KEY: 'AIzaSyDLL64gXACWEcnmSSJyjZV_pdVSTDn5yus',
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
};

async function testFetchMedicationInfo(medicationName) {
  console.log(`🧪 Testando medicamento: ${medicationName}`);
  
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
    
    console.log('📡 Fazendo requisição para a API...');
    const response = await fetch(`${GeminiConfig.BASE_URL}?key=${GeminiConfig.API_KEY}`, {
      method: 'POST',
      headers: {
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
    console.log('📋 Dados recebidos:', JSON.stringify(data, null, 2));

    if (data.error) {
      console.error('❌ Erro retornado pela API:', data.error);
      return;
    }

    if (!data.candidates || data.candidates.length === 0) {
      console.error('❌ Nenhuma informação encontrada');
      return;
    }

    const text = data.candidates[0].content.parts[0].text;
    console.log('✅ Resposta da IA:');
    console.log(text.trim());

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testFetchMedicationInfo('Paracetamol');