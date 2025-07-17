import { N8NConfig } from '../constants/N8NConfig';

interface N8NWebhookResponse {
  success?: boolean;
  data?: {
    medication: string;
    description: string;
    indications: string;
    warnings: string;
    dosage?: string;
  };
  output?: string; // Formato que o N8N está retornando
  error?: string;
}

export async function fetchMedicationInfo(medicationName: string): Promise<string> {
  if (!medicationName.trim()) {
    throw new Error('Nome do medicamento não pode estar vazio');
  }

  const N8N_WEBHOOK_URL = N8NConfig.MEDICATION_INFO_WEBHOOK;

  try {
    console.log('[N8N Webhook] Buscando informações para:', medicationName);
    console.log('[N8N Webhook] URL do webhook:', N8N_WEBHOOK_URL);
    
    const requestBody = {
      medication: medicationName.trim(),
      timestamp: new Date().toISOString(),
      source: 'personalmedicare-app'
    };
    
    console.log('[N8N Webhook] Corpo da requisição:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[N8N Webhook] Status da resposta:', response.status);
    console.log('[N8N Webhook] Headers da resposta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[N8N Webhook] Erro na resposta:', errorText);
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('[N8N Webhook] Resposta bruta:', responseText);
    
    let data: N8NWebhookResponse;
    try {
      data = JSON.parse(responseText);
      console.log('[N8N Webhook] Dados parseados:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('[N8N Webhook] Erro ao fazer parse da resposta JSON:', parseError);
      throw new Error('Resposta inválida do servidor');
    }
    
    // Verificar se há erro no formato antigo
    if (data.success === false) {
      console.error('[N8N Webhook] Erro retornado pelo webhook:', data.error);
      throw new Error(data.error || 'Erro ao buscar informações do medicamento');
    }

    // Verificar se há dados no formato antigo
    if (data.data) {
      // Formato antigo com data estruturada
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

      const finalResponse = formattedResponse.trim();
      console.log('[N8N Webhook] Resposta final formatada (formato antigo):', finalResponse);
      console.log('[N8N Webhook] Tamanho da resposta final:', finalResponse.length);

      return finalResponse;
    }

    // Verificar se há output no formato novo
    if (data.output) {
      console.log('[N8N Webhook] Usando formato novo com output');
      const finalResponse = data.output.trim();
      console.log('[N8N Webhook] Resposta final (formato novo):', finalResponse);
      console.log('[N8N Webhook] Tamanho da resposta final:', finalResponse.length);

      return finalResponse;
    }

    // Se não há nem data nem output, retornar erro
    console.log('[N8N Webhook] Nenhuma informação encontrada para este medicamento');
    throw new Error('Nenhuma informação encontrada para este medicamento');

  } catch (error) {
    console.error('[N8N Webhook] Erro ao buscar informações do medicamento:', error);
    console.error('[N8N Webhook] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    // Fallback para caso o webhook não esteja disponível
    const fallbackResponse = `💊 ${medicationName}\n\n📋 Informações não disponíveis no momento. Consulte seu médico ou farmacêutico para orientações sobre este medicamento.`;
    console.log('[N8N Webhook] Retornando resposta de fallback:', fallbackResponse);
    return fallbackResponse;
  }
} 