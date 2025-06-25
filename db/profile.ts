import { getDatabase } from './index';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar_uri: string | null;
}

export async function initProfileDB(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`CREATE TABLE IF NOT EXISTS user_profile (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, email TEXT, avatar_uri TEXT);`);
  const result = await db.getAllAsync('SELECT * FROM user_profile WHERE id = 1');
  if (result.length === 0) {
    await db.runAsync('INSERT INTO user_profile (id, name, email) VALUES (?, ?, ?)', [1, 'Nome do Usuário', 'usuario@email.com']);
  }
}

export async function getProfile(): Promise<UserProfile | null> {
  const db = await getDatabase();
  const result = await db.getAllAsync('SELECT * FROM user_profile WHERE id = 1');
  return result.length > 0 ? result[0] : null;
}

export async function updateProfile(data: { name: string; email: string; avatar_uri?: string | null }): Promise<void> {
  const db = await getDatabase();
  if (data.avatar_uri !== undefined) {
    await db.runAsync('UPDATE user_profile SET name = ?, email = ?, avatar_uri = ? WHERE id = 1', [data.name, data.email, data.avatar_uri]);
  } else {
    await db.runAsync('UPDATE user_profile SET name = ?, email = ? WHERE id = 1', [data.name, data.email]);
  }
} 