# 🔧 REGRAS CORRETAS DO FIRESTORE

## 📋 **REGRAS PARA FIRESTORE (Banco de Dados):**

### **Versão Correta para seu projeto:**

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para profiles (perfis de usuário)
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Regras para members (membros da família)
    match /members/{memberId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Regras para treatments (tratamentos)
    match /treatments/{treatmentId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Regras para medications (medicamentos)
    match /medications/{medicationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Regras para documents (documentos)
    match /documents/{documentId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Regras para weightRecords (registros de peso)
    match /weightRecords/{recordId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Regras para uploads temporários
    match /temp_uploads/{uploadId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Regras para uploads pendentes
    match /pending_uploads/{uploadId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### **Versão Temporária (Debug):**

Se a versão acima não funcionar imediatamente, use esta temporariamente:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 **COMO APLICAR:**

1. **Firebase Console → Firestore → Rules**
2. **Substitua** as regras atuais
3. **Publish**
4. **Teste o app**

## ⚡ **AÇÃO IMEDIATA:**

**Use a versão temporária primeiro** para confirmar que o problema são as regras.

Se o app funcionar, mude para a versão completa.