import { GroqConfig } from '../constants/GroqConfig';

interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  error?: {
    message: string;
    type: string;
  };
}

export async function fetchMedicationInfo(medicationName: string): Promise<string> {
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

    const data: GroqResponse = await response.json();

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

export async function askGroqChat(userMessage: string): Promise<string> {
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

    const response = await fetch(GroqConfig.BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GroqConfig.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data: GroqResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Erro no chat');
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error('Nenhuma resposta gerada');
    }

    return data.choices[0].message.content.trim();

  } catch (error) {
    console.error('[Groq] Erro no chat:', error);
    throw new Error('Erro ao processar sua pergunta. Tente novamente.');
  }
}

export async function generateMedicalDossier(memberData: {
  name: string;
  age: number;
  bloodType?: string;
  weight?: string;
  height?: string;
  relation: string;
  treatments: Array<{
    medication: string;
    dosage?: string;
    frequency_value: number;
    frequency_unit: string;
    duration: string;
    status: string;
    notes?: string;
  }>;
  notes?: string;
}): Promise<string> {
  try {
    const activeTreatments = memberData.treatments.filter(t => t.status === 'ativo');
    const completedTreatments = memberData.treatments.filter(t => t.status === 'finalizado');
    
    const prompt = `Como um médico especialista experiente, analise o perfil médico completo do paciente e forneça um dossiê médico detalhado e profissional:

👤 PERFIL DO PACIENTE:
• Nome: ${memberData.name}
• Idade: ${memberData.age} anos
• Relação: ${memberData.relation}
• Tipo Sanguíneo: ${memberData.bloodType || 'Não informado'}
• Peso: ${memberData.weight || 'Não informado'}
• Altura: ${memberData.height || 'Não informado'}
${memberData.notes ? `• Observações: ${memberData.notes}` : ''}

💊 TRATAMENTOS ATIVOS (${activeTreatments.length}):
${activeTreatments.map(t => 
  `• ${t.medication}${t.dosage ? ` - ${t.dosage}` : ''} - ${t.frequency_value} ${t.frequency_unit} por ${t.duration}${t.notes ? ` (${t.notes})` : ''}`
).join('\n') || 'Nenhum tratamento ativo'}

📋 HISTÓRICO DE TRATAMENTOS (${completedTreatments.length}):
${completedTreatments.map(t => 
  `• ${t.medication}${t.dosage ? ` - ${t.dosage}` : ''} - Finalizado`
).join('\n') || 'Nenhum tratamento finalizado'}

Por favor, forneça uma análise médica completa e profissional seguindo esta estrutura:

🔍 ANÁLISE CLÍNICA GERAL
[Avaliação geral do estado de saúde baseado nos dados disponíveis]

💊 ANÁLISE FARMACOLÓGICA
[Análise dos medicamentos em uso, possíveis interações, adequação das dosagens]

⚠️ ALERTAS E PRECAUÇÕES
[Identificação de possíveis riscos, contraindicações ou cuidados especiais]

📊 INDICADORES DE SAÚDE
[Análise de peso, altura, IMC se possível, e outros indicadores relevantes]

🎯 RECOMENDAÇÕES MÉDICAS
[Sugestões específicas para otimizar o tratamento e a saúde geral]

📅 MONITORAMENTO SUGERIDO
[Frequência de consultas, exames recomendados, acompanhamentos necessários]

IMPORTANTE:
✅ Use linguagem médica profissional mas acessível
✅ Seja específico e detalhado nas análises
✅ Considere a idade e características do paciente
✅ Identifique padrões nos medicamentos
✅ Forneça insights valiosos baseados na experiência médica
✅ Use emojis médicos para organizar as seções
❌ NÃO use formatação markdown (sem **, *, #, etc.)
❌ NÃO substitua diagnóstico médico real
❌ SEMPRE recomende consulta médica para decisões importantes

Forneça uma análise completa, profissional e informativa que agregue real valor ao acompanhamento médico do paciente.`;

    const requestBody = {
      model: GroqConfig.MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000, // Mais tokens para análise completa
      temperature: 0.3 // Temperatura mais baixa para análise médica
    };

    const response = await fetch(GroqConfig.BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GroqConfig.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data: GroqResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Erro ao gerar dossiê médico');
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error('Nenhuma análise médica gerada');
    }

    const result = data.choices[0].message.content.trim();
    return result;

  } catch (error) {
    console.error('[Groq] Erro ao gerar dossiê médico:', error);
    throw new Error('Erro ao gerar análise médica. Tente novamente.');
  }
}