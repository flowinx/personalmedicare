# 🔍 Diagnóstico: Upload de Imagens de Perfil e Membros

## 📋 Problema Identificado
O upload de imagens de perfil de usuários e membros não está funcionando corretamente no Firebase Storage.

## 🧪 Testes Criados
Foram criados vários arquivos de teste para diagnosticar o problema:

### 1. `test_firebase_upload.js`
- Testa login anônimo (falha porque não está habilitado)
- Testa upload básico no Storage

### 2. `test_firebase_upload_real.js`
- Testa com usuário real autenticado
- Verifica regras de segurança
- Testa upload para pastas `profiles/` e `members/`

### 3. `test_profile_upload.js`
- Simula o fluxo completo da ProfileScreen
- Testa a função `updateProfile` do serviço Firebase
- Inclui compressão de imagem

### 4. `test_storage_rules.js`
- Testa especificamente as regras de segurança
- Verifica se uploads são permitidos/negados corretamente

## 🔧 Como Diagnosticar

### Passo 1: Verificar Autenticação
```bash
node test_firebase_upload_real.js
```

**Se der erro de login:**
1. Crie uma conta no app PersonalMediCare
2. Substitua as credenciais nos arquivos de teste:
   ```javascript
   const testEmail = 'seu_email@exemplo.com';
   const testPassword = 'sua_senha';
   ```

### Passo 2: Testar Regras de Segurança
```bash
node test_storage_rules.js
```

**Resultados esperados:**
- ❌ Upload sem autenticação deve falhar
- ✅ Upload com nome correto deve funcionar
- ❌ Upload com nome incorreto deve falhar

### Passo 3: Testar Fluxo Completo
```bash
node test_profile_upload.js
```

## 🛠️ Possíveis Problemas e Soluções

### 1. **Usuário não autenticado**
**Sintoma:** Erro `auth/user-not-found` ou `storage/unauthorized`

**Solução:**
- Verificar se o usuário está logado no app
- Verificar se as credenciais estão corretas
- Verificar se o Firebase Auth está configurado

### 2. **Regras de segurança muito restritivas**
**Sintoma:** Erro `storage/unauthorized` mesmo com usuário logado

**Solução:**
- Verificar se as regras em `storage.rules` estão corretas
- Fazer deploy das regras: `firebase deploy --only storage`
- Verificar se o nome do arquivo segue o padrão: `profile_{userId}_*` ou `member_{userId}_*`

### 3. **Regras de segurança muito permissivas**
**Sintoma:** Upload funciona sem autenticação

**Solução:**
- Revisar e corrigir as regras em `storage.rules`
- Fazer deploy das regras atualizadas

### 4. **Problema na função uploadImage**
**Sintoma:** Erro durante o processo de upload

**Possíveis causas:**
- Imagem muito grande (>5MB)
- Formato de imagem não suportado
- Problema de rede/timeout
- Configuração incorreta do Storage

### 5. **Problema no ImagePicker**
**Sintoma:** Erro ao selecionar imagem

**Solução:**
- Verificar permissões de câmera/galeria
- Verificar se o expo-image-picker está instalado
- Verificar se a compressão está funcionando

## 📱 Como Testar no App

### 1. Teste de Upload de Perfil
1. Abra o app PersonalMediCare
2. Vá para a tela de Perfil
3. Toque no avatar para editar
4. Selecione uma imagem da galeria
5. Salve o perfil
6. Verifique se a imagem aparece corretamente

### 2. Teste de Upload de Membro
1. Vá para "Adicionar Membro"
2. Preencha os dados
3. Toque no avatar para adicionar foto
4. Selecione uma imagem
5. Salve o membro
6. Verifique se a imagem aparece na lista

## 🔍 Logs para Monitorar

### No código React Native:
```javascript
console.log('[Upload] Iniciando upload da imagem:', imageUri);
console.log('[Upload] Usuário autenticado:', currentUser.uid);
console.log('[Upload] Blob criado - Tamanho:', blob.size, 'bytes');
console.log('[Upload] Upload concluído:', uploadResult.metadata.name);
```

### No Firebase Console:
1. Vá para Storage > Files
2. Verifique se os arquivos estão sendo criados
3. Vá para Storage > Rules
4. Verifique se as regras estão ativas

## 🚨 Problemas Comuns

### 1. **Timeout no Upload**
- Reduzir qualidade da imagem
- Verificar conexão de internet
- Aumentar timeout na função

### 2. **Imagem não aparece após upload**
- Verificar se a URL está sendo salva corretamente
- Verificar se o componente ProfileImage está funcionando
- Verificar cache da imagem

### 3. **Erro de CORS**
- Verificar configuração do Firebase Storage
- Verificar se o domínio está autorizado

## 📋 Checklist de Verificação

- [ ] Firebase Auth está funcionando
- [ ] Usuário consegue fazer login
- [ ] Storage está ativo no Firebase Console
- [ ] Regras de segurança estão corretas
- [ ] Regras foram deployadas
- [ ] ImagePicker está funcionando
- [ ] Compressão de imagem está funcionando
- [ ] Função uploadImage não tem erros
- [ ] URLs de download são válidas
- [ ] Componente ProfileImage exibe as imagens

## 🔧 Comandos Úteis

```bash
# Testar upload básico
node test_firebase_upload_real.js

# Testar regras de segurança
node test_storage_rules.js

# Testar fluxo completo
node test_profile_upload.js

# Deploy das regras (se necessário)
firebase deploy --only storage

# Ver logs do Firebase
firebase functions:log
```

## 📞 Próximos Passos

1. Execute os testes de diagnóstico
2. Identifique qual teste falha
3. Aplique a solução correspondente
4. Teste no app real
5. Monitore os logs para confirmar funcionamento