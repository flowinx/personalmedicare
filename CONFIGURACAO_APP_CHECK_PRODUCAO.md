# Configuração App Check para Produção

## 1. Firebase Console - Configurações

### Passo 1: Habilitar App Check
1. Acesse Firebase Console → Projeto → App Check
2. Clique em "Começar"
3. Selecione seu app iOS/Android

### Passo 2: Configurar Provedores

#### Para iOS (DeviceCheck):
```
1. Em "Apps" → selecione seu app iOS
2. Clique em "DeviceCheck" 
3. Clique em "Salvar"
4. Status deve ficar "Ativo"
```

#### Para Android (Play Integrity):
```
1. Em "Apps" → selecione seu app Android  
2. Clique em "Play Integrity API"
3. Clique em "Salvar"
4. Status deve ficar "Ativo"
```

### Passo 3: Configurar Enforcement
```
1. Vá para "APIs protegidas"
2. Para cada serviço (Firestore, Storage, etc.):
   - Desenvolvimento: "Unenforced" (permite sem token)
   - Produção: "Enforced" (requer token válido)
```

## 2. Código - Configuração Otimizada

### services/appCheck.ts
```typescript
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from 'firebase/app-check';
import { app } from './firebase';

let appCheckInitialized = false;

export const initializeAppCheckForProduction = () => {
  if (appCheckInitialized) return;
  
  try {
    if (__DEV__) {
      // Desenvolvimento: usar debug token
      console.log('[App Check] Modo desenvolvimento - usando debug token');
      
      // Debug tokens por plataforma
      const debugToken = Platform.OS === 'ios' 
        ? '3AC14E49-E961-4C72-AC0B-8C640A6D9844'  // iOS debug token
        : 'ANDROID_DEBUG_TOKEN_HERE';              // Android debug token
        
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('debug-token'),
        isTokenAutoRefreshEnabled: true
      });
      
    } else {
      // Produção: usar provedores reais
      console.log('[App Check] Modo produção - usando DeviceCheck/Play Integrity');
      
      initializeAppCheck(app, {
        provider: Platform.OS === 'ios' 
          ? new DeviceCheckProvider()
          : new PlayIntegrityProvider(),
        isTokenAutoRefreshEnabled: true
      });
    }
    
    appCheckInitialized = true;
    console.log('[App Check] ✅ Inicializado com sucesso');
    
  } catch (error) {
    console.error('[App Check] ❌ Erro na inicialização:', error);
  }
};

export const getAppCheckToken = async (): Promise<string | null> => {
  try {
    const appCheckTokenResult = await getToken(getAppCheck(app), false);
    return appCheckTokenResult.token;
  } catch (error) {
    console.warn('[App Check] Não foi possível obter token:', error);
    return null;
  }
};
```

## 3. Configuração por Ambiente

### .env.development
```
FIREBASE_APP_CHECK_DEBUG_TOKEN_IOS=3AC14E49-E961-4C72-AC0B-8C640A6D9844
FIREBASE_APP_CHECK_DEBUG_TOKEN_ANDROID=YOUR_ANDROID_DEBUG_TOKEN
FIREBASE_APP_CHECK_ENFORCED=false
```

### .env.production  
```
FIREBASE_APP_CHECK_ENFORCED=true
```

## 4. Upload com App Check Otimizado

### services/uploadOptimized.ts
```typescript
import { getAppCheckToken } from './appCheck';

export async function uploadWithAppCheck(imageUri: string, folder: string): Promise<string> {
  try {
    // Obter token do usuário
    const user = await getCurrentUser();
    const authToken = await user.getIdToken(true);
    
    // Obter token App Check (se disponível)
    const appCheckToken = await getAppCheckToken();
    
    // Headers otimizados
    const headers: any = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'image/jpeg',
    };
    
    // Adicionar App Check se disponível
    if (appCheckToken) {
      headers['X-Firebase-AppCheck'] = appCheckToken;
      console.log('[Upload] App Check token adicionado');
    } else {
      console.log('[Upload] Sem App Check token - usando modo unenforced');
    }
    
    // Fazer upload
    const result = await FileSystem.uploadAsync(uploadUrl, imageUri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers,
    });
    
    return result;
    
  } catch (error) {
    console.error('[Upload] Erro:', error);
    throw error;
  }
}
```

## 5. Monitoramento e Debug

### Debug Tokens no Console
```
1. Firebase Console → App Check → Apps
2. Clique no app → "Debug tokens"
3. Adicione os tokens de debug:
   - iOS: 3AC14E49-E961-4C72-AC0B-8C640A6D9844
   - Android: [seu token android]
4. Tokens são válidos por 7 dias
```

### Logs de Monitoramento
```typescript
// Adicionar ao código de produção
export const logAppCheckStatus = async () => {
  try {
    const token = await getAppCheckToken();
    
    console.log('[App Check Status]', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      environment: __DEV__ ? 'development' : 'production',
      platform: Platform.OS
    });
    
  } catch (error) {
    console.error('[App Check Status] Erro:', error);
  }
};
```

## 6. Checklist de Deploy

### Antes do Deploy:
- [ ] App Check configurado no Firebase Console
- [ ] Debug tokens adicionados para desenvolvimento  
- [ ] Provedores corretos (DeviceCheck/Play Integrity)
- [ ] Enforcement configurado como "Unenforced" para testes

### Deploy de Produção:
- [ ] Alterar enforcement para "Enforced"
- [ ] Testar upload em dispositivo real
- [ ] Monitorar logs de erro
- [ ] Ter fallback para casos de falha

### Rollback se necessário:
- [ ] Voltar enforcement para "Unenforced"
- [ ] Investigar logs de erro
- [ ] Corrigir problemas antes de tentar novamente

## 7. Troubleshooting

### Erro 401 (Unauthorized):
```
- Verificar se App Check está "Unenforced" em desenvolvimento
- Verificar se debug token está correto
- Verificar se token de auth está válido
```

### Erro 403 (Forbidden):
```  
- Verificar regras de Storage
- Verificar se usuário está autenticado
- Verificar se App Check token é válido
```

### Performance Lenta:
```
- Usar cache de tokens App Check
- Implementar retry com backoff
- Monitorar tamanho das imagens
```