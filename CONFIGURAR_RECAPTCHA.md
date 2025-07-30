# 🔧 CONFIGURAR RECAPTCHA PARA APP CHECK

## 🎯 **ABORDAGEM CORRETA**

Você está certo! Vamos usar a abordagem padrão com **ReCaptchaV3Provider**.

## 📋 **PASSOS PARA OBTER CHAVE RECAPTCHA:**

### **1. Acesse Google reCAPTCHA:**
https://www.google.com/recaptcha/admin/create

### **2. Criar novo site:**
- **Label:** "GlassCare App Check"
- **reCAPTCHA type:** **v3**
- **Domains:** 
  - `localhost`
  - `exp.host` (para Expo)
  - `*.exp.direct` (para Expo)
  - Seu domínio se tiver

### **3. Copiar chave do site (Site Key):**
Após criar, copie a **Site Key** (chave pública)

## 🔧 **IMPLEMENTAÇÃO:**

Já implementei no código usando uma chave temporária:
```typescript
provider: new ReCaptchaV3Provider('SUA_CHAVE_AQUI')
```

## 🚀 **TESTE RÁPIDO:**

Você pode testar com a chave temporária primeiro:
`6LcqoHMTAAAAAGjdGFb2hgQ9uFwdN2ee-hELLotA`

## ⚡ **PRÓXIMO PASSO:**

1. **Teste com chave temporária** primeiro
2. **Se funcionar**, obtenha sua própria chave
3. **Substitua** no código

**Quer testar com a chave temporária primeiro?**