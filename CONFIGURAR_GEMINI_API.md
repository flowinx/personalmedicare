# 🔧 Como Configurar a API do Google Gemini

## Problema Identificado
A função do dossiê médico não está funcionando porque a **chave da API do Google Gemini não está configurada**.

## ✅ Solução Passo a Passo

### 1. Obter a Chave da API do Google Gemini

1. **Acesse o Google AI Studio**:
   - Vá para: https://makersuite.google.com/app/apikey
   - Ou: https://aistudio.google.com/app/apikey

2. **Faça login** com sua conta Google

3. **Crie uma nova chave da API**:
   - Clique em "Create API Key"
   - Escolha um projeto existente ou crie um novo
   - Copie a chave gerada (algo como: `AIzaSyC...`)

### 2. Configurar a Chave no Projeto

1. **Abra o arquivo `.env`** na raiz do projeto

2. **Substitua a linha**:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   **Por**:
   ```
   GEMINI_API_KEY=AIzaSyC...sua_chave_aqui
   ```

3. **Salve o arquivo**

### 3. Reiniciar o Servidor

1. **Pare o servidor Expo** (Ctrl+C no terminal)
2. **Execute novamente**: `npx expo start`

## 🧪 Testar a Configuração

Após configurar:
1. Abra o app
2. Vá para "Relatórios"
3. Selecione um membro da família
4. O dossiê médico deve ser gerado automaticamente

## ⚠️ Importante

- **Nunca compartilhe** sua chave da API
- **Não faça commit** do arquivo `.env` para o Git
- A chave é **gratuita** com limites de uso
- Para uso em produção, considere configurar **cotas e restrições**

## 🔍 Verificar se Funcionou

Se configurado corretamente, você verá:
- ✅ Dossiê médico sendo gerado
- ✅ Análise personalizada do membro
- ✅ Recomendações baseadas em IA

Se ainda não funcionar:
- Verifique se a chave foi copiada corretamente
- Confirme que não há espaços extras
- Reinicie o servidor Expo