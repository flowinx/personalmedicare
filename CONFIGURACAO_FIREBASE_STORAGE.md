# 🔥 Configuração do Firebase Storage

## ❌ Problema Identificado

O erro `storage/unknown` ocorre porque:
1. O Firebase Storage não foi configurado no projeto
2. As regras de segurança podem estar muito restritivas

## 🛠️ Solução Passo a Passo

### 1. Configurar Firebase Storage no Console

1. **Acesse o Console do Firebase:**
   - Vá para: https://console.firebase.google.com/project/glasscare-2025/storage
   - Ou acesse https://console.firebase.google.com e selecione o projeto "Personal Medicare"

2. **Ativar o Storage:**
   - Clique em "Storage" no menu lateral
   - Clique em "Get Started" (Começar)
   - Escolha o modo de segurança:
     - **Para desenvolvimento:** Selecione "Start in test mode" (mais permissivo)
     - **Para produção:** Selecione "Start in production mode" (mais restritivo)
   - **IMPORTANTE - Escolha da Região:**
     - Selecione uma região **GRATUITA** para evitar custos:
       - **us-central1** (Iowa) - GRATUITO
       - **us-west1** (Oregon) - GRATUITO
       - **us-east1** (South Carolina) - GRATUITO
     - **EVITE regiões pagas** como:
       - europe-west1, asia-southeast1, etc.
   - Clique em "Done"

### 2. Configurar Regras de Segurança

#### Opção A: Regras para Desenvolvimento (Temporárias)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // ATENÇÃO: Regras permissivas apenas para desenvolvimento
      // Permitir leitura e escrita para usuários autenticados
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Opção B: Regras para Produção (Recomendadas)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Regras para imagens de perfil de usuários
    match /profiles/{fileName} {
      allow read, write: if request.auth != null 
                      && request.auth.uid != null
                      && fileName.matches(request.auth.uid + '_.*');
    }
    
    // Regras para imagens de membros da família
    match /members/{fileName} {
      allow read, write: if request.auth != null 
                      && request.auth.uid != null
                      && fileName.matches(request.auth.uid + '_.*');
    }
    
    // Negar acesso a qualquer outro caminho
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### 3. Aplicar as Regras

#### Método 1: Pelo Console (Mais Fácil)
1. No console do Firebase, vá para Storage > Rules
2. Cole uma das regras acima
3. Clique em "Publish"

#### Método 2: Pelo CLI (Após configurar o Storage)
```bash
# Depois de configurar o Storage no console
node deploy-storage-rules.js
```

### 4. Testar a Funcionalidade

1. **Reinicie o aplicativo:**
   ```bash
   npm start
   ```

2. **Teste o upload de imagem:**
   - Adicione ou edite um membro
   - Selecione uma foto
   - Verifique os logs no terminal

3. **Verificar no Console:**
   - Vá para Storage no console do Firebase
   - Verifique se as imagens aparecem nas pastas `/profiles/` e `/members/`

## 🔍 Diagnóstico de Problemas

### Logs Detalhados
O código foi atualizado para fornecer logs mais detalhados. Procure por:
- `[Firebase Storage] Iniciando upload da imagem`
- `[Firebase Storage] Usuário autenticado`
- `[Firebase Storage] Blob criado - Tamanho: X bytes`
- `[Firebase Storage] Upload concluído`

### Erros Comuns

1. **"O local dos dados foi definido em uma região que não é compatível com buckets sem custo"**
   - Problema: Região escolhida não é gratuita
   - Solução: Use us-central1, us-west1 ou us-east1

2. **`storage/unauthorized`**
   - Problema: Regras de segurança muito restritivas
   - Solução: Use as regras de desenvolvimento temporariamente

3. **`storage/unknown`**
   - Problema: Storage não configurado ou problemas de rede
   - Solução: Configure o Storage no console primeiro

4. **`Usuário não autenticado`**
   - Problema: Usuário não está logado
   - Solução: Faça login no aplicativo

## 📋 Checklist de Verificação

- [ ] Firebase Storage configurado no console
- [ ] **Região GRATUITA selecionada** (us-central1, us-west1 ou us-east1)
- [ ] Regras de segurança aplicadas
- [ ] Usuário autenticado no aplicativo
- [ ] Conexão com internet estável
- [ ] Logs detalhados verificados

## 🚀 Próximos Passos

1. Configure o Firebase Storage no console
2. Use regras permissivas para teste inicial
3. Teste o upload de imagens
4. Aplique regras de produção quando tudo estiver funcionando

---

**Importante:** Sempre use regras de segurança adequadas em produção para proteger os dados dos usuários.