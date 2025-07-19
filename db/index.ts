// Re-export das funções do Firebase
// Importa as funções específicas
import {
    addMember,
    addTreatment,
    clearAllData,
    deleteMember,
    deleteTreatment,
    Document,
    getAllMembers,
    getAllTreatments,
    getDocumentsByMemberId,
    getMemberById,
    getProfile,
    getTreatmentById,
    getTreatmentsByMemberId,
    initMembersDB,
    initProfileDB,
    Member,
    saveDocument,
    Treatment,
    updateMember,
    updateProfile,
    updateTreatment,
    UserProfile
} from '../services/firebase';

export {
    addMember, addTreatment, deleteMember, deleteTreatment, Document, getAllMembers, getAllTreatments, getDocumentsByMemberId, getMemberById, getProfile, getTreatmentById, getTreatmentsByMemberId, Member, saveDocument, Treatment, updateMember, updateProfile, updateTreatment, UserProfile
};

// Função de inicialização que usa o Firebase
export async function initDatabase() {
  try {
    console.log('Inicializando banco de dados Firebase...');
    
    // Inicializa todos os bancos de dados
    await initMembersDB();
    await initProfileDB();
    
    console.log('Banco de dados Firebase inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados Firebase:', error);
    throw error;
  }
}

// Função para resetar o banco (útil para debug)
export async function resetDatabase() {
  console.log('Resetando banco de dados Firebase...');
  
  try {
    await clearAllData();
    await initDatabase();
    console.log('Reset do banco de dados Firebase concluído');
  } catch (error) {
    console.error('Erro ao resetar banco de dados Firebase:', error);
    throw error;
  }
}