# 🔧 REGRAS CORRETAS DO FIREBASE STORAGE

## 📋 **REGRAS RECOMENDADAS PARA SEU PROJETO:**

### **Versão 1: Básica (Recomendada)**
```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Regra para profiles (imagens de perfil)
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Regra para members (imagens de membros da família)
    match /members/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Regra para documentos
    match /documents/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Regra geral para outros arquivos
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **Versão 2: Mais Restritiva (Produção)**
```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Profiles - apenas o próprio usuário
    match /profiles/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId
        && resource.size < 5 * 1024 * 1024; // Máximo 5MB
    }
    
    // Members - apenas o usuário autenticado
    match /members/{fileName} {
      allow read, write: if request.auth != null
        && fileName.matches('.*\\.(jpg|jpeg|png|gif)$') // Apenas imagens
        && resource.size < 5 * 1024 * 1024; // Máximo 5MB
    }
    
    // Documentos - apenas o usuário autenticado
    match /documents/{allPaths=**} {
      allow read, write: if request.auth != null
        && resource.size < 10 * 1024 * 1024; // Máximo 10MB
    }
  }
}
```

### **Versão 3: Debug/Desenvolvimento (Temporária)**
```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // TEMPORÁRIO: Permite tudo para usuários autenticados
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 **COMO APLICAR:**

### **1. Firebase Console:**
1. Acesse: https://console.firebase.google.com/project/glasscare-2025/storage/rules
2. **Substitua** as regras atuais pela **Versão 1** acima
3. **Publish** as mudanças

### **2. Teste Imediato:**
Após aplicar as regras, teste o upload novamente.

## 🎯 **REGRAS PROBLEMÁTICAS COMUNS:**

### **❌ Regras que causam erro 401:**
```javascript
// ERRADO: Muito restritivo
allow write: if request.auth.uid == resource.metadata.owner;

// ERRADO: Sintaxe incorreta
allow read, write: if request.auth.uid = userId;

// ERRADO: Condições impossíveis
allow write: if request.auth != null && request.auth == null;
```

## 📋 **RECOMENDAÇÃO:**

**Comece com a Versão 3 (Debug)** para testar se o problema são as regras.

Se funcionar, mude para **Versão 1** para produção.

## ⚡ **PRÓXIMO PASSO:**

**Vá para o Firebase Console → Storage → Rules** e substitua pelas regras da Versão 3 primeiro.

**Teste o upload imediatamente após aplicar!** 🚀