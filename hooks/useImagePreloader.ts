import { useEffect } from 'react';
import { imageCache } from '../utils/imageCache';

/**
 * Hook para pré-carregar imagens em background
 */
export const useImagePreloader = (imageUris: (string | undefined)[]) => {
  useEffect(() => {
    const preloadImages = async () => {
      const validUris = imageUris.filter((uri): uri is string => !!uri);
      
      if (validUris.length === 0) return;
      
      // Pré-carregar em background sem bloquear a UI
      setTimeout(() => {
        validUris.forEach(uri => {
          imageCache.preloadImage(uri);
        });
      }, 100); // Pequeno delay para não impactar o carregamento inicial
    };
    
    preloadImages();
  }, [imageUris]);
};

/**
 * Hook para limpar cache quando necessário
 */
export const useImageCacheCleaner = () => {
  const clearCache = async () => {
    try {
      await imageCache.clearCache();
      console.log('Cache de imagens limpo');
    } catch (error) {
      console.warn('Erro ao limpar cache:', error);
    }
  };
  
  return { clearCache };
};