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
      throw new Error(data.error.message || 'Erro ao gerar dossiê médico');
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Nenhuma análise médica gerada');
    }

    return data.candidates[0].content.parts[0].text.trim();

  } catch (error) {
    console.error('[Gemini] Erro ao gerar dossiê médico:', error);
    throw new Error('Erro ao gerar análise médica. Tente novamente.');
  }
}

export interface MedicationCompleteInfo {
  categoria: string;
  unidade: string;
  descricao: string;
  indicacoes: string;
  contraindicacoes: string;
  posologia: string;
  cuidados: string;
}

export async function getMedicationCompleteInfo(medicationName: string): Promise<MedicationCompleteInfo> {
  if (!medicationName.trim()) {
    throw new Error('Nome do medicamento não pode estar vazio');
  }

  try {
    const prompt = `Você é um farmacêutico especialista! Analise o medicamento "${medicationName}" e forneça as informações EXATAS no formato JSON abaixo:

{
  "categoria": "[Uma das categorias: Analgésico, Antibiótico, Anti-inflamatório, Antialérgico, Vitamina, Suplemento, Cardiovascular, Digestivo, Respiratório, Dermatológico, Oftálmico, Outros]",
  "unidade": "[Uma das unidades: comprimidos, cápsulas, ml, mg, g, gotas, sachês, ampolas, frascos, unidades]",
  "descricao": "[Descrição simples do que é o medicamento em 1-2 frases]",
  "indicacoes": "[Para que serve, de forma simples e clara]",
  "contraindicacoes": "[Principais contraindicações de forma clara]",
  "posologia": "[Como tomar de forma simplificada]",
  "cuidados": "[Cuidados importantes de forma simples]"
}

IMPORTANTE:
✅ Responda APENAS o JSON válido, sem texto adicional
✅ Use linguagem simples e acessível
✅ Seja preciso na categoria e unidade
✅ NÃO use formatação markdown
✅ Mantenha as informações concisas mas completas

Se não conhecer o medicamento, use categoria "Outros" e unidade "unidades" com informações genéricas.`;

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
      throw new Error(data.error.message || 'Erro ao buscar informações do medicamento');
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Nenhuma informação encontrada');
    }

    let responseText = data.candidates[0].content.parts[0].text.trim();
    
    // Limpar possíveis caracteres de formatação markdown
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    responseText = responseText.replace(/^[\s\S]*?({[\s\S]*})[\s\S]*$/, '$1');
    
    console.log('[Gemini] Resposta limpa:', responseText);
    
    // Tentar fazer parse do JSON
    try {
      const medicationInfo = JSON.parse(responseText);
      
      // Validar se tem todas as propriedades necessárias
      if (!medicationInfo.categoria || !medicationInfo.unidade || !medicationInfo.descricao) {
        throw new Error('Resposta incompleta da IA');
      }
      
      return medicationInfo;
    } catch (parseError) {
      console.error('[Gemini] Erro ao fazer parse do JSON:', parseError);
      console.error('[Gemini] Resposta original recebida:', data.candidates[0].content.parts[0].text);
      console.error('[Gemini] Resposta limpa:', responseText);
      
      // Fallback com informações padrão
      return {
        categoria: 'Outros',
        unidade: 'unidades',
        descricao: `Medicamento ${medicationName}`,
        indicacoes: 'Consulte seu médico para informações sobre indicações.',
        contraindicacoes: 'Consulte seu médico para informações sobre contraindicações.',
        posologia: 'Siga as orientações do seu médico.',
        cuidados: 'Mantenha em local seco e arejado, longe do alcance de crianças.'
      };
    }

  } catch (error) {
    console.error('[Gemini] Erro ao buscar informações completas do medicamento:', error);
    
    // Fallback para caso a API não esteja disponível
    return {
      categoria: 'Outros',
      unidade: 'unidades',
      descricao: `Medicamento ${medicationName}`,
      indicacoes: 'Consulte seu médico para informações sobre indicações.',
      contraindicacoes: 'Consulte seu médico para informações sobre contraindicações.',
      posologia: 'Siga as orientações do seu médico.',
      cuidados: 'Mantenha em local seco e arejado, longe do alcance de crianças.'
    };
  }
}

export async function extractActiveIngredient(medicationName: string): Promise<string> {
  if (!medicationName.trim()) {
    throw new Error('Nome do medicamento não pode estar vazio');
  }

  try {
    const prompt = `Você é um farmacêutico especialista! Analise o medicamento "${medicationName}" e extraia APENAS o princípio ativo (substância ativa) principal.

IMPORTANTE:
✅ Responda APENAS com o nome do princípio ativo, sem texto adicional
✅ Use o nome científico/genérico da substância ativa
✅ Se houver múltiplos princípios ativos, liste o principal
✅ NÃO inclua dosagem, marca comercial ou outras informações
✅ Se não souber, responda apenas com a primeira palavra do medicamento

Exemplos:
- "Dipirona 500mg" → "Dipirona"
- "Tylenol 750mg" → "Paracetamol"
- "Aspirina" → "Ácido Acetilsalicílico"
- "Alenia 400" → "Budesonida + Formoterol"

Medicamento: ${medicationName}
Princípio ativo:`;

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
      throw new Error(data.error.message || 'Erro ao extrair princípio ativo');
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Nenhuma informação encontrada');
    }

    let activeIngredient = data.candidates[0].content.parts[0].text.trim();
    
    // Limpar possíveis formatações
    activeIngredient = activeIngredient.replace(/[*#`-]/g, '').trim();
    
    // Se a resposta for muito longa, pegar apenas a primeira linha
    activeIngredient = activeIngredient.split('\n')[0].trim();
    
    return activeIngredient || medicationName.split(' ')[0];

  } catch (error) {
    console.error('[Gemini] Erro ao extrair princípio ativo:', error);
    
    // Fallback: usar a primeira palavra do nome
    return medicationName.split(' ')[0] || '';
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