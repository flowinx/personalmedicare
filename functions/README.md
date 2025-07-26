# 📧 Sistema de Contato - Personal Medicare

Este sistema permite que usuários enviem mensagens através do app que são automaticamente enviadas por email para a equipe.

## 🚀 Funcionalidades

- ✅ **Email para equipe**: Mensagens enviadas para `flowinxcorp@gmail.com`
- ✅ **Email de confirmação**: Usuário recebe confirmação automática
- ✅ **Validações**: Campos obrigatórios e formato de email
- ✅ **Histórico**: Mensagens salvas no Firestore
- ✅ **Templates HTML**: Emails bem formatados
- ✅ **Tratamento de erros**: Mensagens específicas para cada erro

## ⚙️ Configuração

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. Configurar Projeto Firebase
```bash
firebase use --add
# Selecione seu projeto Firebase
```

### 3. Configurar Email do Gmail

#### 3.1. Criar Senha de App no Gmail
1. Acesse [Google Account Settings](https://myaccount.google.com/)
2. Vá em "Segurança" → "Verificação em duas etapas"
3. Role até "Senhas de app"
4. Gere uma nova senha para "Personal Medicare"
5. Copie a senha gerada (16 caracteres)

#### 3.2. Configurar Variáveis de Ambiente
```bash
# Email do Personal Medicare (remetente)
firebase functions:config:set email.user="flowinxcorp@gmail.com"

# Senha de app do Gmail (substitua pela senha real)
firebase functions:config:set email.password="rtxjuyxmuabechxz"

# Email de destino (equipe)
firebase functions:config:set email.destination="flowinxcorp@gmail.com"
```

### 4. Deploy das Functions
```bash
# Compilar
npm run build

# Deploy
firebase deploy --only functions
```

## 📱 Como Funciona

### Fluxo do Usuário:
1. **Usuário preenche** formulário no app
2. **App valida** campos obrigatórios
3. **Firebase Function** é chamada
4. **Dois emails** são enviados:
   - Para equipe (`flowinxcorp@gmail.com`)
   - Confirmação para usuário
5. **Mensagem salva** no Firestore
6. **Usuário recebe** confirmação no app

### Estrutura dos Emails:

#### Email para Equipe:
- **Assunto**: `[Personal Medicare] {assunto_selecionado}`
- **Conteúdo**: Nome, email, assunto, mensagem, timestamp
- **Formato**: HTML bem formatado
- **Reply-to**: Email do usuário

#### Email de Confirmação:
- **Assunto**: `Recebemos sua mensagem - Personal Medicare`
- **Conteúdo**: Confirmação personalizada com nome do usuário
- **Informações**: Tempo de resposta (24h), outros canais de contato

## 🔧 Desenvolvimento

### Testar Localmente:
```bash
# Instalar dependências
npm install

# Compilar
npm run build

# Executar emulador
firebase emulators:start --only functions
```

### Ver Logs:
```bash
firebase functions:log
```

### Ver Configurações:
```bash
firebase functions:config:get
```

## 📊 Monitoramento

As mensagens são salvas na collection `contact_messages` do Firestore com:
- Nome e email do usuário
- Assunto e mensagem
- Timestamp
- Status do envio
- IP do usuário

## 🛡️ Segurança

- ✅ **Validação de entrada**: Todos os campos são validados
- ✅ **Rate limiting**: Firebase Functions tem rate limiting nativo
- ✅ **Credenciais seguras**: Senhas armazenadas em config do Firebase
- ✅ **Logs**: Todas as operações são logadas
- ✅ **Tratamento de erros**: Erros não expõem informações sensíveis

## 🚨 Troubleshooting

### Erro: "functions/internal"
- Verifique se as credenciais do email estão corretas
- Confirme se a senha de app do Gmail está ativa
- Verifique os logs: `firebase functions:log`

### Erro: "functions/invalid-argument"
- Campos obrigatórios não preenchidos
- Formato de email inválido

### Erro: "functions/unavailable"
- Serviço temporariamente indisponível
- Tente novamente em alguns minutos

## 📞 Suporte

Se precisar de ajuda com a configuração:
- 📧 Email: flowinxcorp@gmail.com
- 📱 Verifique os logs do Firebase Console
- 🔍 Consulte a documentação do Firebase Functions