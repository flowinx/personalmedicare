// Teste da função fetchMedicationInfo
const fetch = require('node-fetch');

const API_KEY = 'AIzaSyCNL5rlz2joAKG8_yD-_c1JTmPFI3aj2JA';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function testFetchMedicationInfo(medicationName) {
  console.log(`🧪 Testando informações do medicamento: ${medicationName}`);
  
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
    const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
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
    console.log('='.repeat(50));
    console.log(text.trim());
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testFetchMedicationInfo('Paracetamol');