import { getDatabase } from './index';

export interface Member {
  id?: number;
  name: string;
  relation: string;
  dob: string;
  notes?: string;
  avatar_uri?: string;
}

export async function initMembersDB(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`CREATE TABLE IF NOT EXISTS members (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, relation TEXT, dob TEXT, notes TEXT, avatar_uri TEXT);`);
}

export async function addMember(member: Member): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync('INSERT INTO members (name, relation, dob, notes, avatar_uri) VALUES (?, ?, ?, ?, ?)', [member.name, member.relation, member.dob, member.notes || '', member.avatar_uri || '']);
  return result.insertId;
}

export async function getAllMembers(): Promise<Member[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync('SELECT * FROM members ORDER BY name');
  return result;
}

export async function getMemberById(id: number): Promise<Member | null> {
  const db = await getDatabase();
  const result = await db.getAllAsync('SELECT * FROM members WHERE id = ?', [id]);
  return result.length > 0 ? result[0] : null;
}

export async function updateMember(id: number, member: Member): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE members SET name = ?, relation = ?, dob = ?, notes = ?, avatar_uri = ? WHERE id = ?', [member.name, member.relation, member.dob, member.notes || '', member.avatar_uri || '', id]);
}

export async function deleteMember(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM members WHERE id = ?', [id]);
} 