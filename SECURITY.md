# Configuração de Segurança

## Variáveis de Ambiente

Este projeto usa variáveis de ambiente para proteger informações sensíveis como chaves de API.

### Configuração Inicial

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Preencha as variáveis no arquivo `.env` com suas chaves reais:
   - `FIREBASE_API_KEY`: Chave da API do Firebase
   - `FIREBASE_AUTH_DOMAIN`: Domínio de autenticação do Firebase
   - `FIREBASE_PROJECT_ID`: ID do projeto Firebase
   - `FIREBASE_STORAGE_BUCKET`: Bucket de storage do Firebase
   - `FIREBASE_MESSAGING_SENDER_ID`: ID do sender para messaging
   - `FIREBASE_APP_ID`: ID da aplicação Firebase
   - `GEMINI_API_KEY`: Chave da API do Google Gemini
   - `GOOGLE_WEB_CLIENT_ID`: Client ID do Google Sign-In

### Arquivos Sensíveis

Os seguintes arquivos contêm informações sensíveis e NÃO devem ser commitados:

- `.env`
- `android/app/google-services.json`
- `ios/PersonalMediCare/GoogleService-Info.plist`

### Regeneração de Chaves

Se as chaves foram expostas acidentalmente:

1. **Firebase**: Regenere as chaves no console do Firebase
2. **Google Gemini**: Regenere a chave no Google AI Studio
3. **Google Sign-In**: Regenere as credenciais no Google Cloud Console

### Produção

Para produção, configure as variáveis de ambiente no seu serviço de deploy (Vercel, Netlify, etc.) ou use um serviço de gerenciamento de secrets.