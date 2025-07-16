// Re-export das funções do novo sistema de memória
// Importa as funções específicas
import { clearAllData, initMembersDB, initProfileDB } from './memoryStorage';

export * from './memoryStorage';

// Função de inicialização que usa o novo sistema
export async function initDatabase() {
  try {
    console.log('Initializing memory storage database...');
    
    // Inicializa todos os bancos de dados
    await initMembersDB();
    await initProfileDB();
    
    console.log('Memory storage database initialized successfully');
  } catch (error) {
    console.error('Error initializing memory storage database:', error);
    throw error;
  }
}

// Função para resetar o banco (útil para debug)
export async function resetDatabase() {
  console.log('Resetting memory storage database...');
  
  try {
    await clearAllData();
    await initDatabase();
    console.log('Memory storage database reset completed');
  } catch (error) {
    console.error('Error resetting memory storage database:', error);
    throw error;
  }
}