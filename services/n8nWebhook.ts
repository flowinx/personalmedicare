import { N8NConfig } from '../constants/N8NConfig';

interface N8NWebhookResponse {
  success: boolean;
  data?: {
    medication: string;
    description: string;
    indications: string;
    warnings: string;
    dosage?: string;
  };
  error?: string;
}

export async function fetchMedicationInfo(medicationName: string): Promise<string> {
  if (!medicationName.trim()) {
    throw new Error('Nome do medicamento não pode estar vazio');
  }

  const N8N_WEBHOOK_URL = N8NConfig.MEDICATION_INFO_WEBHOOK;

  try {
    console.log('[N8N Webhook] Buscando informações para:', medicationName);
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        medication: medicationName.trim(),
        timestamp: new Date().toISOString(),
        source: 'personalmedicare-app'
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    const data: N8NWebhookResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao buscar informações do medicamento');
    }

    if (!data.data) {
      throw new Error('Nenhuma informação encontrada para este medicamento');
    }

    // Formata a resposta de forma amigável
    const { description, indications, warnings, dosage } = data.data;
    
    let formattedResponse = `💊 ${medicationName}\n\n`;
    
    if (description) {
      formattedResponse += `📋 ${description}\n\n`;
    }
    
    if (indications) {
      formattedResponse += `🎯 Para que serve: ${indications}\n\n`;
    }
    
    if (warnings) {
      formattedResponse += `⚠️ Avisos: ${warnings}\n\n`;
    }
    
    if (dosage) {
      formattedResponse += `💡 Dosagem sugerida: ${dosage}`;
    }

    return formattedResponse.trim();

  } catch (error) {
    console.error('[N8N Webhook] Erro ao buscar informações do medicamento:', error);
    
    // Fallback para caso o webhook não esteja disponível
    return `💊 ${medicationName}\n\n📋 Informações não disponíveis no momento. Consulte seu médico ou farmacêutico para orientações sobre este medicamento.`;
  }
} 