# 🔑 Configuração da Chave API do Gemini - URGENTE

## ⚠️ PROBLEMA IDENTIFICADO

O erro `400` nas funções do Gemini está ocorrendo porque a chave da API ainda não foi configurada no arquivo `.env`.

**Valor atual (INCORRETO):**
```
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🚀 SOLUÇÃO RÁPIDA

### 1. Obter Chave da API

1. **Acesse**: [Google AI Studio](https://aistudio.google.com/app/apikey) <mcreference link="https://ai.google.dev/gemini-api/docs/api-key" index="4">4</mcreference>
2. **Faça login** com sua conta Google
3. **Clique em "Create API Key"** <mcreference link="https://apidog.com/pt/blog/google-gemini-api-key-for-free-pt/" index="1">1</mcreference>
4. **Copie a chave** (formato: `AIzaSyC...`)
5. **IMPORTANTE**: A chave é gratuita mas tem limitações <mcreference link="https://translate.google.com/translate?u=https%3A%2F%2Fzapier.com%2Fblog%2Fgemini-api%2F&hl=pt&sl=en&tl=pt&client=srp" index="2">2</mcreference>

### 2. Configurar no Projeto

1. **Abra o arquivo** `.env` na raiz do projeto
2. **Substitua a linha**:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   **Por**:
   ```
   GEMINI_API_KEY=AIzaSyC...sua_chave_real_aqui
   ```

3. **Salve o arquivo**

### 3. Reiniciar Servidor

1. **Pare o servidor** (Ctrl+C)
2. **Reinicie**: `npx expo start --clear`

## ✅ TESTE

Após configurar:
1. Vá para **"Novo Tratamento"**
2. Digite um nome de medicamento
3. Clique em **"Buscar Informações"**
4. Deve funcionar sem erro 400

## 🔧 Funções que serão corrigidas:

- ✅ Busca de informações de medicamentos
- ✅ Análise de documentos
- ✅ Geração de dossiê médico
- ✅ Chat inteligente
- ✅ Extração de princípio ativo

---

**⏰ PRIORIDADE ALTA**: Configure agora para resolver todos os erros do Gemini!