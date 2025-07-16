# Configuração do Webhook N8N para Informações de Medicamentos

## Visão Geral

Este documento explica como configurar um webhook no N8N para fornecer informações precisas sobre medicamentos no app Personal Medi Care.

## Estrutura do Webhook

### URL do Webhook
```
https://n8n.flowinx.com/webhook/medication-info
```

### Payload de Entrada
O app envia um JSON com a seguinte estrutura:
```json
{
  "medication": "Nome do medicamento",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "source": "personalmedicare-app"
}
```

### Payload de Resposta Esperado
O webhook deve retornar um JSON com a seguinte estrutura:
```json
{
  "success": true,
  "data": {
    "medication": "Nome do medicamento",
    "description": "Descrição geral do medicamento",
    "indications": "Para que serve o medicamento",
    "warnings": "Principais avisos e contraindicações",
    "dosage": "Dosagem sugerida (opcional)"
  }
}
```

## Configuração no N8N

### 1. Criar um Novo Workflow
1. Acesse o N8N
2. Clique em "New Workflow"
3. Nomeie como "Medication Info Webhook"

### 2. Adicionar Webhook Trigger
1. Adicione um nó "Webhook"
2. Configure:
   - **HTTP Method**: POST
   - **Path**: `/webhook/medication-info`
   - **Response Mode**: Respond to Webhook

### 3. Processar os Dados
1. Adicione um nó "Set" para extrair o nome do medicamento:
   ```json
   {
     "medication": "={{ $json.medication }}"
   }
   ```

### 4. Integrar com Base de Dados de Medicamentos
Você pode integrar com:
- **Anvisa API** (se disponível)
- **OpenFDA API**
- **Base de dados própria** de medicamentos
- **ChatGPT/Groq** com prompt específico para medicamentos

### 5. Exemplo com Groq
```javascript
// Nó "HTTP Request" para Groq
{
  "url": "https://api.groq.com/openai/v1/chat/completions",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer YOUR_GROQ_API_KEY",
    "Content-Type": "application/json"
  },
  "body": {
    "model": "llama3-8b-8192",
    "messages": [
      {
        "role": "system",
        "content": "Você é um especialista em medicamentos. Forneça informações precisas sobre medicamentos em português brasileiro. Sempre inclua: descrição, indicações, avisos principais e dosagem quando relevante."
      },
      {
        "role": "user",
        "content": "Forneça informações sobre o medicamento: {{ $json.medication }}"
      }
    ],
    "temperature": 0.3,
    "max_tokens": 500
  }
}
```

### 6. Processar Resposta da IA
```javascript
// Nó "Code" para processar resposta
const aiResponse = $input.all()[0].json.choices[0].message.content;

// Extrair informações estruturadas
const medicationInfo = {
  medication: $('medication'),
  description: aiResponse.split('\n')[0] || '',
  indications: aiResponse.includes('Para que serve') ? aiResponse.split('Para que serve:')[1]?.split('\n')[0] : '',
  warnings: aiResponse.includes('Avisos:') ? aiResponse.split('Avisos:')[1]?.split('\n')[0] : '',
  dosage: aiResponse.includes('Dosagem:') ? aiResponse.split('Dosagem:')[1]?.split('\n')[0] : ''
};

return {
  success: true,
  data: medicationInfo
};
```

### 7. Configurar Resposta
1. Adicione um nó "Respond to Webhook"
2. Configure para retornar o JSON processado

## Tratamento de Erros

### Resposta de Erro
```json
{
  "success": false,
  "error": "Descrição do erro"
}
```

### Casos de Erro Comuns
- Medicamento não encontrado
- API externa indisponível
- Timeout na requisição
- Dados inválidos

## Testando o Webhook

### Usando cURL
```bash
curl -X POST https://n8n.flowinx.com/webhook/medication-info \
  -H "Content-Type: application/json" \
  -d '{
    "medication": "Paracetamol",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "source": "personalmedicare-app"
  }'
```

### Usando Postman
1. Método: POST
2. URL: `https://n8n.flowinx.com/webhook/medication-info`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "medication": "Paracetamol",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "source": "personalmedicare-app"
}
```

## Monitoramento

### Logs Importantes
- Requisições recebidas
- Tempo de resposta
- Erros de processamento
- Medicamentos mais consultados

### Métricas Sugeridas
- Total de consultas por dia
- Taxa de sucesso
- Tempo médio de resposta
- Medicamentos mais populares

## Segurança

### Recomendações
1. Implementar rate limiting
2. Validar entrada de dados
3. Sanitizar respostas
4. Logs de auditoria
5. Autenticação (se necessário)

## Próximos Passos

1. **Implementar cache** para medicamentos consultados frequentemente
2. **Adicionar mais fontes** de dados de medicamentos
3. **Implementar busca fuzzy** para nomes similares
4. **Adicionar informações** sobre interações medicamentosas
5. **Integrar com APIs** de farmácias para preços 