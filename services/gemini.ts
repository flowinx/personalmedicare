import { GeminiConfig } from '../constants/GeminiConfig';

interface GeminiResponse {
  candidates?: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
  error?: {
    code: number;
    message: string;
  };
}

export async function fetchMedicationInfo(medicationName: string): Promise<string> {
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

    const data: GeminiResponse = await response.json();

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
    
    // Fallback para caso a API não esteja disponível
    const fallbackResponse = `💊 ${medicationName}\n\n📋 Informações não disponíveis no momento. Consulte seu médico ou farmacêutico para orientações sobre este medicamento.`;
    return fallbackResponse;
  }
}

export async function analyzeDocument(text: string): Promise<string> {
  if (!text.trim()) {
    throw new Error('Texto não pode estar vazio');
  }

  try {
    const prompt = `Analise o seguinte texto de um documento médico e forneça um resumo estruturado com as informações mais importantes:

${text}

Forneça um resumo organizado com:
- Principais informações médicas
- Medicamentos mencionados
- Dosagens e frequências
- Avisos importantes
- Recomendações

Formate a resposta de forma clara e objetiva.`;

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
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Erro ao analisar documento');
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Nenhuma análise gerada');
    }

    return data.candidates[0].content.parts[0].text.trim();

  } catch (error) {
    console.error('[Gemini] Erro ao analisar documento:', error);
    throw new Error('Erro ao analisar o documento. Tente novamente.');
  }
}

export async function askGeminiChat(userMessage: string): Promise<string> {
  if (!userMessage.trim()) {
    throw new Error('Mensagem não pode estar vazia');
  }

  try {
    const prompt = `Você é um assistente médico virtual amigável e profissional! 🏥

Responda à seguinte pergunta de forma clara e amigável, como se estivesse conversando com um amigo:

${userMessage}

IMPORTANTE:
✅ Use emojis com moderação (1-2 por resposta) para deixar a conversa mais amigável
✅ Fale de forma simples, sem termos médicos complicados
✅ Use linguagem do dia a dia, como se estivesse explicando para alguém que não entende nada de medicina
✅ Seja carinhoso e acolhedor
✅ Dê dicas práticas e fáceis de seguir
✅ Sempre lembre que você é um assistente e não substitui o médico
❌ NÃO use formatação markdown (sem **, *, #, -, etc.)
❌ NÃO use listas com marcadores especiais
❌ NÃO use títulos com #

Exemplo de tom: "Oi! Vou te ajudar com isso de forma bem simples, tá? 😊"

Responda de forma calorosa e acessível, usando texto simples e emojis com moderação!`;

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
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Erro no chat');
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Nenhuma resposta gerada');
    }

    return data.candidates[0].content.parts[0].text.trim();

  } catch (error) {
    console.error('[Gemini] Erro no chat:', error);
    throw new Error('Erro ao processar sua pergunta. Tente novamente.');
  }
} 