import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';

interface CacheEntry {
  uri: string;
  timestamp: number;
  localPath: string;
}

class ImageCache {
  private cache: Map<string, CacheEntry> = new Map();
  private cacheDir: string;
  private maxAge: number = 24 * 60 * 60 * 1000; // 24 horas
  private maxSize: number = 50; // máximo 50 imagens em cache

  constructor() {
    this.cacheDir = `${FileSystem.cacheDirectory}images/`;
    this.initializeCache();
  }

  private async initializeCache() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      }
      await this.loadCacheIndex();
    } catch (error) {
      console.warn('Erro ao inicializar cache de imagens:', error);
    }
  }

  private async loadCacheIndex() {
    try {
      const indexPath = `${this.cacheDir}index.json`;
      const indexInfo = await FileSystem.getInfoAsync(indexPath);
      
      if (indexInfo.exists) {
        const indexContent = await FileSystem.readAsStringAsync(indexPath);
        const cacheData = JSON.parse(indexContent);
        
        for (const [key, entry] of Object.entries(cacheData)) {
          this.cache.set(key, entry as CacheEntry);
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar índice do cache:', error);
    }
  }

  private async saveCacheIndex() {
    try {
      const indexPath = `${this.cacheDir}index.json`;
      const cacheData = Object.fromEntries(this.cache);
      await FileSystem.writeAsStringAsync(indexPath, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Erro ao salvar índice do cache:', error);
    }
  }

  private generateCacheKey(uri: string): string {
    return uri.replace(/[^a-zA-Z0-9]/g, '_');
  }

  async getCachedImage(uri: string): Promise<string> {
    const cacheKey = this.generateCacheKey(uri);
    const cached = this.cache.get(cacheKey);

    // Verificar se existe e não expirou
    if (cached && (Date.now() - cached.timestamp) < this.maxAge) {
      const fileInfo = await FileSystem.getInfoAsync(cached.localPath);
      if (fileInfo.exists) {
        return cached.localPath;
      }
    }

    // Download e cache da imagem
    return await this.downloadAndCache(uri, cacheKey);
  }

  private async downloadAndCache(uri: string, cacheKey: string): Promise<string> {
    try {
      const localPath = `${this.cacheDir}${cacheKey}.jpg`;
      
      // Download da imagem
      const downloadResult = await FileSystem.downloadAsync(uri, localPath);
      
      if (downloadResult.status === 200) {
        // Adicionar ao cache
        this.cache.set(cacheKey, {
          uri,
          timestamp: Date.now(),
          localPath
        });

        // Limpar cache se necessário
        await this.cleanupCache();
        
        // Salvar índice
        await this.saveCacheIndex();
        
        return localPath;
      } else {
        // Se falhou o download, retornar URI original
        return uri;
      }
    } catch (error) {
      console.warn('Erro ao fazer cache da imagem:', error);
      return uri;
    }
  }

  private async cleanupCache() {
    if (this.cache.size <= this.maxSize) return;

    // Ordenar por timestamp (mais antigos primeiro)
    const entries = Array.from(this.cache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    );

    // Remover os mais antigos
    const toRemove = entries.slice(0, this.cache.size - this.maxSize);
    
    for (const [key, entry] of toRemove) {
      try {
        await FileSystem.deleteAsync(entry.localPath, { idempotent: true });
        this.cache.delete(key);
      } catch (error) {
        console.warn('Erro ao limpar cache:', error);
      }
    }
  }

  async clearCache() {
    try {
      await FileSystem.deleteAsync(this.cacheDir, { idempotent: true });
      this.cache.clear();
      await this.initializeCache();
    } catch (error) {
      console.warn('Erro ao limpar cache:', error);
    }
  }

  // Pré-carregar imagem em background
  async preloadImage(uri: string) {
    try {
      await this.getCachedImage(uri);
    } catch (error) {
      console.warn('Erro ao pré-carregar imagem:', error);
    }
  }
}

export const imageCache = new ImageCache();

// Hook para usar imagens com cache
export const useCachedImage = (uri: string | undefined) => {
  const [cachedUri, setCachedUri] = React.useState<string | undefined>(uri);

  React.useEffect(() => {
    if (!uri) {
      setCachedUri(undefined);
      return;
    }

    imageCache.getCachedImage(uri).then(setCachedUri);
  }, [uri]);

  return cachedUri;
};