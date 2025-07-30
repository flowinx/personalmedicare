# 🧪 TESTE RÁPIDO - Diagnóstico Erro 401

## Se não encontrar App Check no Firebase Console:

### **Teste 1: Verificar se App Check existe**
1. Acesse: https://console.firebase.google.com/project/glasscare-2025
2. Menu lateral → procure "App Check"
3. Se **NÃO EXISTIR**, o problema é outro

### **Teste 2: Verificar Storage Rules**
1. Firebase Console → **Storage** → **Rules**
2. Verifique se as regras estão assim:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **Teste 3: Verificar Authentication**
1. Firebase Console → **Authentication** → **Users**
2. Confirme se seu usuário está listado
3. Verifique se está **ativo** (não desabilitado)

### **Teste 4: Verificar Project ID**
No seu `.env`, confirme se está correto:
```
FIREBASE_PROJECT_ID=glasscare-2025
FIREBASE_STORAGE_BUCKET=glasscare-2025.firebasestorage.app
```

## 🔧 **SOLUÇÃO ALTERNATIVA**

Se App Check não existir, tente esta URL modificada:

```typescript
// No arquivo firebase.ts, linha ~200, mude:
const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o?name=${encodeURIComponent(folder + '/' + finalFileName)}`;

// Para:
const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(folder + '/' + finalFileName)}`;
```

## 📞 **PRÓXIMOS PASSOS**

1. **Primeiro**: Procure "App Check" no Firebase Console
2. **Se encontrar**: Desabilite conforme instruções acima
3. **Se NÃO encontrar**: Me informe e vamos investigar outras causas do 401
4. **Teste**: Tente upload novamente após qualquer mudança

## 🎯 **RESULTADO ESPERADO**

Após a correção:
```
LOG  [Expo Upload] 📊 Status: 200 ← Sucesso!
LOG  [Expo Upload] ✅ Sucesso! URL: https://...
```