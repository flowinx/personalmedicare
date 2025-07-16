const { getDatabase, initDatabase, clearDatabaseInstance } = require('../db/index');

async function testDatabase() {
  console.log('🧪 Testando banco de dados...');
  
  try {
    // 1. Limpar instância anterior
    clearDatabaseInstance();
    console.log('✅ Instância anterior limpa');
    
    // 2. Inicializar banco
    await initDatabase();
    console.log('✅ Banco inicializado com sucesso');
    
    // 3. Testar conexão
    const db = await getDatabase();
    console.log('✅ Conexão com banco estabelecida');
    
    // 4. Testar query simples
    const result = await db.getAllAsync('SELECT name FROM sqlite_master WHERE type="table"');
    console.log('✅ Query de teste executada:', result);
    
    // 5. Testar perfil
    const profileResult = await db.getAllAsync('SELECT * FROM user_profile WHERE id = 1');
    console.log('✅ Perfil carregado:', profileResult[0]);
    
    console.log('🎉 Todos os testes passaram! O banco está funcionando corretamente.');
    
  } catch (error) {
    console.error('❌ Erro no teste do banco:', error);
    process.exit(1);
  }
}

testDatabase(); 