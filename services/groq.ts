import { Config } from '../constants/Config';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function analyzeDocument(documentText: string): Promise<string> {
  console.log('[Groq] Valor da GROQ_API_KEY:', Config.GROQ_API_KEY);
  if (!Config.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY não configurada');
  }

  const messages: Message[] = [
    {
      role: 'system',
      content: `Você é um assistente especializado em análise de documentos médicos. 
      Sua tarefa é analisar o texto do documento fornecido e criar um resumo claro e estruturado, 
      destacando os pontos mais importantes como diagnósticos, resultados de exames, 
      recomendações médicas e próximos passos. Use linguagem acessível e organize as informações 
      de forma que facilite a compreensão do paciente.`
    },
    {
      role: 'user',
      content: documentText
    }
  ];

  try {
    const response = await fetch(Config.GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Config.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API da Groq: ${response.statusText}`);
    }

    const data = await response.json() as GroqResponse;
    return data.choices[0]?.message?.content || 'Não foi possível analisar o documento.';
  } catch (error) {
    console.error('Erro ao analisar documento:', error);
    throw new Error('Erro ao analisar o documento. Por favor, tente novamente.');
  }
}

export async function askGroqChat(userMessage: string): Promise<string> {
  console.log('[GroqChat] Pergunta enviada:', userMessage);
  console.log('[Groq] Valor da GROQ_API_KEY:', Config.GROQ_API_KEY);
  if (!Config.GROQ_API_KEY) {
    console.error('[GroqChat] GROQ_API_KEY não configurada');
    throw new Error('GROQ_API_KEY não configurada');
  }
  if (!Config.GROQ_API_URL) {
    console.error('[GroqChat] GROQ_API_URL não configurada');
    throw new Error('GROQ_API_URL não configurada');
  }
  console.log('[GroqChat] Vai chamar fetch para', Config.GROQ_API_URL);
  try {
    const response = await fetch(Config.GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Config.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente médico inteligente. Responda dúvidas sobre saúde, medicamentos, sintomas, prevenção, bem-estar e oriente o usuário de forma clara, empática e acessível. Sempre lembre que não substitui um médico real. NÃO utilize nenhuma formatação markdown (como **, *, #, -, etc.). NÃO use listas, bullets, asteriscos ou qualquer símbolo de formatação. Responda apenas em texto corrido, com frases curtas, linguagem simples e destaque pontos importantes com emojis quando apropriado.`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API da Groq: ${response.statusText}`);
    }

    const data = await response.json() as GroqResponse;
    return data.choices[0]?.message?.content || 'Não foi possível analisar o documento.';
  } catch (error) {
    console.error('Erro ao analisar documento:', error);
    throw new Error('Erro ao analisar o documento. Por favor, tente novamente.');
  }
}