import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { createWorker } from 'tesseract.js';

export async function extractTextFromDocument(fileUri: string, mimeType: string): Promise<string> {
  try {
    if (mimeType.startsWith('image/')) {
      return await extractTextFromImage(fileUri);
    } else if (mimeType === 'application/pdf') {
      // TODO: Implementar extração de texto de PDF
      // Por enquanto, retornaremos um erro
      throw new Error('Extração de texto de PDFs será implementada em breve.');
    } else {
      throw new Error('Tipo de arquivo não suportado.');
    }
  } catch (error) {
    console.error('Erro ao extrair texto do documento:', error);
    throw error;
  }
}

async function extractTextFromImage(imageUri: string): Promise<string> {
  try {
    // Primeiro, otimizamos a imagem para melhor OCR
    const processedImage = await manipulateAsync(
      imageUri,
      [
        { resize: { width: 1024 } }, // Redimensiona mantendo a proporção
      ],
      { compress: 0.8, format: SaveFormat.JPEG }
    );

    // Inicializa o worker do Tesseract
    const worker = await createWorker('por');

    // Realiza o OCR
    const { data: { text } } = await worker.recognize(processedImage.uri);

    // Termina o worker
    await worker.terminate();

    // Limpa arquivos temporários
    if (processedImage.uri !== imageUri) {
      await FileSystem.deleteAsync(processedImage.uri, { idempotent: true });
    }

    return text;
  } catch (error) {
    console.error('Erro ao extrair texto da imagem:', error);
    throw new Error('Não foi possível extrair o texto da imagem.');
  }
} 