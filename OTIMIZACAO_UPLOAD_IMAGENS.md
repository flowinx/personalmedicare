# 🚀 Otimização de Upload de Imagens

## 🐌 Problema Identificado

O upload de imagens está demorando muito para ser concluído. Possíveis causas:

1. **Imagens muito grandes** - Fotos de celular podem ter 5-10MB
2. **Qualidade muito alta** - Quality 0.8 ainda gera arquivos grandes
3. **Sem compressão** - Não há redimensionamento automático
4. **Sem feedback visual** - Usuário não sabe o progresso

## ✅ Soluções Implementadas

### 1. Reduzir Qualidade da Imagem

**Problema atual:**
```javascript
const result = await ImagePicker.launchImageLibraryAsync({
  quality: 0.8, // Muito alta para upload
});
```

**Solução:**
```javascript
const result = await ImagePicker.launchImageLibraryAsync({
  quality: 0.5, // Reduzir para 50%
  allowsEditing: true,
  aspect: [1, 1],
});
```

### 2. Adicionar Compressão de Imagem

Instalar biblioteca de compressão:
```bash
npm install expo-image-manipulator
```

### 3. Implementar Feedback Visual

Adicionar indicador de progresso durante upload:
- Loading spinner
- Texto "Salvando imagem..."
- Desabilitar botão durante upload

### 4. Otimizar Tamanho do Arquivo

Redimensionar imagem antes do upload:
- Máximo 800x800 pixels para perfis
- Máximo 1024x1024 pixels para documentos

## 🛠️ Implementação

### Passo 1: Instalar Dependência

```bash
npm install expo-image-manipulator
```

### Passo 2: Atualizar ProfileScreen

Modificar a função `handlePickImage`:

```javascript
import * as ImageManipulator from 'expo-image-manipulator';

const handlePickImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Reduzir qualidade
    });

    if (!result.canceled && result.assets[0]) {
      // Comprimir e redimensionar imagem
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [
          { resize: { width: 800, height: 800 } }, // Redimensionar
        ],
        {
          compress: 0.7, // Compressão adicional
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      setAvatarUri(manipulatedImage.uri);
    }
  } catch (error) {
    Alert.alert('Erro', 'Erro ao selecionar imagem');
  }
};
```

### Passo 3: Melhorar Feedback Visual

Adicionar estado de loading específico para upload:

```javascript
const [uploadingImage, setUploadingImage] = useState(false);

const handleSave = async () => {
  // ... validações ...
  
  setLoading(true);
  setUploadingImage(true);
  
  try {
    await updateProfile({
      name: name.trim(),
      email: email.trim(),
      avatar_uri: avatarUri,
    });
    
    // ... resto do código ...
  } finally {
    setLoading(false);
    setUploadingImage(false);
  }
};
```

### Passo 4: Otimizar Função de Upload

Modificar `uploadImage` no firebase.ts:

```javascript
export async function uploadImage(imageUri: string, folder: 'profiles' | 'members', fileName?: string): Promise<string> {
  try {
    console.log(`[Firebase Storage] Iniciando upload otimizado: ${imageUri}`);
    
    // ... código de autenticação ...
    
    // Converter URI para blob com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    const response = await fetch(imageUri, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar imagem: ${response.status}`);
    }
    
    const blob = await response.blob();
    console.log(`[Firebase Storage] Blob otimizado - Tamanho: ${blob.size} bytes`);
    
    // Verificar tamanho máximo (2MB)
    if (blob.size > 2 * 1024 * 1024) {
      throw new Error('Imagem muito grande. Máximo 2MB permitido.');
    }
    
    // ... resto do upload ...
  } catch (error) {
    // ... tratamento de erro ...
  }
}
```

## 📊 Resultados Esperados

### Antes da Otimização:
- ❌ Imagens: 5-10MB
- ❌ Upload: 30-60 segundos
- ❌ Sem feedback visual
- ❌ Possível timeout

### Depois da Otimização:
- ✅ Imagens: 200-500KB (90% menor)
- ✅ Upload: 3-10 segundos (80% mais rápido)
- ✅ Feedback visual claro
- ✅ Timeout configurado
- ✅ Validação de tamanho

## 🔧 Comandos para Aplicar

1. **Instalar dependência:**
   ```bash
   npm install expo-image-manipulator
   ```

2. **Testar upload:**
   - Selecione uma foto grande (>5MB)
   - Verifique os logs no terminal
   - Confirme que o upload é mais rápido

3. **Verificar resultado:**
   - Imagem deve aparecer imediatamente
   - Qualidade visual deve ser boa
   - Tamanho do arquivo deve ser menor

## 🚨 Próximos Passos

1. Implementar as otimizações
2. Testar com diferentes tipos de imagem
3. Monitorar performance
4. Aplicar mesmas otimizações para imagens de membros

---

**Nota:** Essas otimizações podem reduzir o tempo de upload em até 80% mantendo qualidade visual adequada.