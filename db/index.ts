import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Função para abrir o banco e retornar a sessão
export async function getDatabase() {
  if (Platform.OS === 'web') {
    console.log('Retornando mock para web');
    // Retorna um mock para web
    return {
      runAsync: async () => {},
      getAllAsync: async () => [],
      // Adicione outros métodos mock se necessário
    };
  }
  // Abre o banco de dados de forma assíncrona
  const db = await SQLite.openDatabaseAsync('personalmedicare.db');
  return db;
}

export async function initDatabase() {
  const db = await getDatabase();
  await db.runAsync(`CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    relation TEXT,
    dob TEXT,
    notes TEXT,
    avatar_uri TEXT
  );`);
  await db.runAsync(`CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    avatar_uri TEXT
  );`);
  await db.runAsync(`CREATE TABLE IF NOT EXISTS treatments (
    id INTEGER PRIMARY KEY NOT NULL,
    member_id INTEGER,
    medication TEXT,
    dosage TEXT,
    frequency_value INTEGER,
    frequency_unit TEXT,
    duration TEXT,
    notes TEXT,
    start_datetime TEXT,
    status TEXT,
    FOREIGN KEY(member_id) REFERENCES members(id)
  );`);
  await db.runAsync(`CREATE TABLE IF NOT EXISTS schedule (
    id INTEGER PRIMARY KEY NOT NULL,
    treatment_id INTEGER,
    scheduled_time TEXT,
    status TEXT,
    FOREIGN KEY(treatment_id) REFERENCES treatments(id)
  );`);

  // Garante que o perfil padrão existe
  const result = await db.getAllAsync('SELECT * FROM user_profile WHERE id = 1');
  if (result.length === 0) {
    await db.runAsync('INSERT INTO user_profile (id, name, email) VALUES (?, ?, ?)', [1, 'Nome do Usuário', 'usuario@email.com']);
  }

  // Adicione outras tabelas conforme necessário
}

async function carregarDados() {
  const db = await getDatabase();
  const result = await db.getAllAsync('SELECT * FROM ...');
  // ...
} 