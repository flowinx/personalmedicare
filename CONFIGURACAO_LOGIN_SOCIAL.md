# 🔐 Configuração de Login Social - Google e Apple

## 📋 Status Atual

### ✅ Já Configurado
- [x] Dependências instaladas (`@react-native-google-signin/google-signin`, `expo-apple-authentication`)
- [x] Código de autenticação implementado em `services/firebase.ts`
- [x] Interface de login em `LoginScreen.tsx`
- [x] Apple Sign-In configurado no `app.json` (entitlements)
- [x] Google Web Client ID configurado no `.env`
- [x] URL Schemes configurados no iOS (`Info.plist`)
- [x] Plugin Google Services configurado no `android/build.gradle`
- [x] Plugin Google Services aplicado no `android/app/build.gradle`
- [x] Arquivo exemplo `google-services.json.example` criado

### ⚠️ Configurações Pendentes

## 🔧 Configurações Necessárias

### 1. Google Sign-In - Android

#### Arquivo `google-services.json` (OBRIGATÓRIO)

**Passo a passo:**

1. **Acesse o Firebase Console:**
   - Vá para: https://console.firebase.google.com/
   - Selecione o projeto `glasscare-2025`

2. **Configure o Android App:**
   - Vá em "Project Settings" > "General"
   - Na seção "Your apps", clique em "Add app" > Android
   - Package name: `com.flowinx.personalmedicareapp`
   - App nickname: `Personal MediCare Android`
   - SHA-1: (opcional para desenvolvimento)

3. **Baixe o arquivo:**
   - Baixe o `google-services.json`
   - Substitua o arquivo `android/app/google-services.json.example`
   - Renomeie para `android/app/google-services.json`

4. **✅ Build.gradle já configurado:**
   - Plugin Google Services já adicionado
   - Configuração completa nos arquivos build.gradle

### 2. Apple Sign-In - iOS

#### Configurações no Apple Developer

1. **Apple Developer Console:**
   - Acesse: https://developer.apple.com/account/
   - Vá em "Certificates, Identifiers & Profiles"

2. **Configure o App ID:**
   - Bundle ID: `com.flowinx.personalmedicareapp`
   - Habilite "Sign In with Apple"

3. **Configurações no Xcode:**
   - Abra o projeto iOS no Xcode
   - Vá em "Signing & Capabilities"
   - Adicione "Sign In with Apple" capability

### 3. Configurações do Firebase Authentication

#### Habilitar Provedores

1. **Firebase Console:**
   - Vá para "Authentication" > "Sign-in method"

2. **Google:**
   - Habilite o provedor Google
   - Configure o Web client ID
   - Adicione domínios autorizados

3. **Apple:**
   - Habilite o provedor Apple
   - Configure o Service ID (opcional)
   - Adicione o Team ID e Key ID

## 📱 Configurações Específicas por Plataforma

### iOS - Configurações Adicionais

#### Info.plist (Já configurado)
```xml
<!-- URL Schemes para Google -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.648780623753-p6t59ds95j25g8d1m783g3q67hr0hqr3</string>
        </array>
    </dict>
</array>
```

#### app.json (Já configurado)
```json
{
  "ios": {
    "entitlements": {
      "com.apple.developer.applesignin": ["Default"]
    }
  }
}
```

### Android - Configurações Adicionais

#### Arquivo google-services.json (PENDENTE)
```bash
# Localização necessária:
android/app/google-services.json
```

#### build.gradle (Verificar se está configurado)
```gradle
// android/build.gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}

// android/app/build.gradle
apply plugin: 'com.google.gms.google-services'
```

## 🧪 Testes

### Teste Local
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### Teste de Produção
```bash
# Build de desenvolvimento
eas build --platform all --profile development

# Build de produção
eas build --platform all --profile production
```

## 🔍 Troubleshooting

### Erros Comuns

#### Google Sign-In
- **"DEVELOPER_ERROR"**: Verifique o SHA-1 e package name
- **"SIGN_IN_FAILED"**: Verifique o google-services.json
- **"Network Error"**: Verifique a conexão e configurações do Firebase

#### Apple Sign-In
- **"Not Available"**: Teste em dispositivo físico (não funciona no simulador)
- **"Invalid Response"**: Verifique as configurações no Apple Developer
- **"Request Failed"**: Verifique o Bundle ID e entitlements

### Logs de Debug
```javascript
// Adicionar no código para debug
console.log('[Auth] Iniciando login...');
console.log('[Auth] Resultado:', result);
```

## 📋 Checklist de Configuração

### Google Sign-In
- [ ] Baixar `google-services.json` do Firebase
- [ ] Substituir arquivo exemplo em `android/app/google-services.json.example`
- [x] Plugin configurado no `android/app/build.gradle`
- [ ] Testar login no Android
- [ ] Testar login no iOS

### Apple Sign-In
- [ ] Configurar App ID no Apple Developer
- [ ] Habilitar "Sign In with Apple"
- [ ] Testar em dispositivo físico iOS
- [ ] Verificar entitlements no Xcode

### Firebase
- [ ] Habilitar provedor Google
- [ ] Habilitar provedor Apple
- [ ] Configurar domínios autorizados
- [ ] Testar autenticação no console

## 🚀 Próximos Passos

1. **Baixar google-services.json** (PRIORITÁRIO)
2. **Testar login Google no Android**
3. **Testar login Apple no iOS físico**
4. **Configurar builds de produção**
5. **Submeter para as lojas**

---

**Nota**: O login com Apple só funciona em dispositivos físicos iOS, não no simulador. Para testes completos, use um iPhone real.

**Suporte**: Em caso de problemas, verifique os logs do Firebase Console e do Expo/EAS.