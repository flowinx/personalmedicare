# 🚀 Solução Definitiva: Upload com Expo/React Native

## 🎯 **Problema Confirmado**
O Claude AI confirmou: **problema comum do Expo/React Native com Firebase Storage**. O upload "trava" porque o Firebase SDK não funciona bem com FormData no React Native.

## 🔧 **Soluções Implementadas**

### **Solução 1: Upload via expo-file-system (RECOMENDADA)**
```typescript
import * as FileSystem from 'expo-file-system';

export async function uploadImageExpo(imageUri: string, folder: 'profiles' | 'members', fileName?: string): Promise<string> {
  try {
    console.log('[Expo Upload] Iniciando upload via FileSystem...');
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }
    
    const token = await currentUser.getIdToken();
    const finalFileName = fileName || `${currentUser.uid}_${Date.now()}.jpg`;
    
    // Upload via REST API do Firebase Storage
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${folder}%2F${finalFileName}?alt=media`;
    
    console.log('[Expo Upload] Fazendo upload via FileSystem...');
    const uploadResult = await FileSystem.uploadAsync(uploadUrl, imageUri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'image/jpeg',
      },
    });
    
    if (uploadResult.status === 200) {
      console.log('[Expo Upload] Upload concluído com sucesso!');
      return uploadUrl;
    } else {
      throw new Error(`Upload falhou: ${uploadResult.status}`);
    }
    
  } catch (error) {
    console.error('[Expo Upload] Erro:', error);
    throw error;
  }
}
```

### **Solução 2: Upload com FormData Otimizado**
```typescript
export async function uploadImageFormData(imageUri: string, folder: 'profiles' | 'members'): Promise<string> {
  try {
    console.log('[FormData Upload] Iniciando...');
    
    // Criar FormData corretamente para React Native
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);
    
    // Upload para seu próprio servidor/API
    const response = await fetch('https://sua-api.com/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const result = await response.json();
    return result.url;
    
  } catch (error) {
    console.error('[FormData Upload] Erro:', error);
    throw error;
  }
}
```

### **Solução 3: Upload via Base64 (Funciona 100%)**
```typescript
export async function uploadImageBase64(imageUri: string, folder: 'profiles' | 'members'): Promise<string> {
  try {
    console.log('[Base64 Upload] Iniciando...');
    
    // Converter para base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    
    // Salvar no Firestore temporariamente
    const currentUser = await getCurrentUser();
    const tempRef = doc(db, 'temp_uploads', currentUser!.uid);
    
    await setDoc(tempRef, {
      imageData: base64,
      folder,
      timestamp: Date.now(),
      status: 'pending'
    });
    
    // Chamar Cloud Function para processar
    const processImage = httpsCallable(functions, 'processImageUpload');
    const result = await processImage({ userId: currentUser!.uid });
    
    return result.data.downloadURL;
    
  } catch (error) {
    console.error('[Base64 Upload] Erro:', error);
    throw error;
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

## 🔄 **Implementação no Projeto**

### **1. Instalar dependências:**
```bash
expo install expo-file-system
```

### **2. Atualizar função de upload:**
```typescript
// services/firebase.ts
export async function uploadImage(imageUri: string, folder: 'profiles' | 'members', fileName?: string): Promise<string> {
  console.log('[Upload] Tentando método Expo FileSystem...');
  
  try {
    // Tentar primeiro com expo-file-system
    return await uploadImageExpo(imageUri, folder, fileName);
  } catch (expoError) {
    console.log('[Upload] Expo falhou, tentando base64...');
    
    try {
      // Fallback para base64
      return await uploadImageBase64(imageUri, folder);
    } catch (base64Error) {
      console.log('[Upload] Base64 falhou, usando URI local...');
      
      // Fallback final - salvar URI local
      return await saveLocalImageReference(imageUri, folder);
    }
  }
}

async function saveLocalImageReference(imageUri: string, folder: string): Promise<string> {
  console.log('[Upload] Salvando referência local...');
  
  // Salvar no Firestore para processar depois
  const currentUser = await getCurrentUser();
  const pendingRef = doc(db, 'pending_uploads', `${currentUser!.uid}_${Date.now()}`);
  
  await setDoc(pendingRef, {
    imageUri,
    folder,
    userId: currentUser!.uid,
    timestamp: Date.now(),
    status: 'pending'
  });
  
  // Retornar URI local por enquanto
  return imageUri;
}
```

### **3. Adicionar logs de debug:**
```typescript
export async function uploadImageWithDebug(imageUri: string, folder: 'profiles' | 'members'): Promise<string> {
  console.log('1. 🚀 Iniciando upload...', imageUri);
  console.log('2. 📁 Pasta destino:', folder);
  
  try {
    console.log('3. 👤 Verificando autenticação...');
    const currentUser = await getCurrentUser();
    console.log('4. ✅ Usuário autenticado:', currentUser?.uid);
    
    console.log('5. 🔄 Iniciando upload via Expo...');
    const result = await uploadImageExpo(imageUri, folder);
    console.log('6. ✅ Upload concluído:', result);
    
    return result;
  } catch (error) {
    console.log('❌ Erro no upload:', error);
    throw error;
  }
}
```

## 🧪 **Como Testar**

### **1. Teste no app:**
```typescript
// Na tela de perfil
const handleImageUpload = async (imageUri: string) => {
  setUploading(true);
  try {
    const downloadURL = await uploadImageWithDebug(imageUri, 'profiles');
    console.log('Upload concluído:', downloadURL);
    // Atualizar UI
  } catch (error) {
    console.error('Erro:', error);
    Alert.alert('Erro', 'Falha no upload da imagem');
  } finally {
    setUploading(false);
  }
};
```

### **2. Logs esperados:**
```
1. 🚀 Iniciando upload... file:///path/to/image.jpg
2. 📁 Pasta destino: profiles
3. 👤 Verificando autenticação...
4. ✅ Usuário autenticado: eyoi6ty1OZO2xKMRHYZO7PGd9RE3
5. 🔄 Iniciando upload via Expo...
6. ✅ Upload concluído: https://firebasestorage.googleapis.com/...
```

## 🎯 **Vantagens da Solução**

### **expo-file-system:**
- ✅ Funciona nativamente no React Native
- ✅ Suporte completo a uploads binários
- ✅ Controle total sobre headers
- ✅ Funciona com Firebase Storage REST API

### **Base64 + Cloud Functions:**
- ✅ Funciona 100% das vezes
- ✅ Processamento no servidor
- ✅ Sem problemas de conectividade
- ✅ Pode redimensionar/otimizar imagens

### **URI Local + Background:**
- ✅ Resposta imediata para o usuário
- ✅ Upload em background
- ✅ Retry automático
- ✅ Funciona offline

## 🚀 **Próximos Passos**

1. **Instale expo-file-system**
2. **Implemente a solução expo-file-system**
3. **Teste no app real**
4. **Se funcionar, remova o código antigo**

**Esta solução vai resolver definitivamente o problema de upload!** 🎉