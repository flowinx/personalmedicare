# Como Adicionar GoogleService-Info.plist 📱

## ⚠️ CRÍTICO: Arquivo Obrigatório para App Store

O arquivo `GoogleService-Info.plist` é **obrigatório** para que o Google Sign-In funcione no build de produção.

## Passos Detalhados 📋

### 1. **Acessar Firebase Console**
1. Vá para [Firebase Console](https://console.firebase.google.com)
2. Selecione o projeto: `glasscare-2025`
3. Clique no ícone de engrenagem ⚙️ → "Configurações do projeto"

### 2. **Localizar o App iOS**
1. Role até a seção "Seus apps"
2. Procure pelo app iOS com Bundle ID: `com.flowinx.personalmedicareapp`
3. Se não existir, clique em "Adicionar app" → iOS

### 3. **Baixar o Arquivo**
1. Clique no app iOS
2. Na seção "Configuração do SDK", clique em "Baixar GoogleService-Info.plist"
3. Salve o arquivo no seu computador

### 4. **Adicionar ao Projeto Xcode**
1. Abra o projeto no Xcode: `ios/PersonalMediCare.xcworkspace`
2. No navegador do projeto (lado esquerdo), clique com botão direito na pasta `PersonalMediCare`
3. Selecione "Add Files to PersonalMediCare..."
4. Navegue até o arquivo `GoogleService-Info.plist` baixado
5. **IMPORTANTE**: Marque "Add to target" para `PersonalMediCare`
6. Clique em "Add"

### 5. **Verificar se Foi Adicionado**
1. No Xcode, verifique se o arquivo aparece na pasta do projeto
2. Clique no arquivo para ver seu conteúdo
3. Deve conter informações como:
   ```xml
   <key>BUNDLE_ID</key>
   <string>com.flowinx.personalmedicareapp</string>
   <key>CLIENT_ID</key>
   <string>648780623753-qa0ht7pv2u6kc5j44g1dmui909o0vdu0.apps.googleusercontent.com</string>
   ```

## Verificação Final ✅

### **Estrutura Esperada**:
```
ios/PersonalMediCare/
├── AppDelegate.swift
├── Info.plist
├── GoogleService-Info.plist  ← DEVE ESTAR AQUI
├── PersonalMediCare.entitlements
└── ...
```

### **Teste no Xcode**:
1. Faça um build do projeto
2. Se não houver erros relacionados ao Firebase, está correto
3. Se aparecer erro "GoogleService-Info.plist not found", repita os passos

## Problemas Comuns 🔧

### **Arquivo não aparece no build**
```
Solução: Verificar se "Add to target" foi marcado
```

### **Bundle ID incorreto**
```
Solução: Baixar novamente do Firebase com Bundle ID correto
```

### **Erro de compilação**
```
Solução: Limpar build folder (Product → Clean Build Folder)
```

## Após Adicionar o Arquivo 🚀

1. **Fazer build de teste**
2. **Testar Google Sign-In em dispositivo físico**
3. **Verificar se não há crashes**
4. **Proceder com build para App Store**

---

**⚠️ SEM ESTE ARQUIVO, O GOOGLE SIGN-IN NÃO FUNCIONARÁ NA APP STORE!**

Certifique-se de adicionar antes de fazer o build final para submissão.