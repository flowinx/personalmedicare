import { getDatabase } from './index';

export interface Document {
  id?: number;
  member_id: number;
  file_name: string;
  file_uri: string;
  file_type: string;
  analysis_text?: string;
  created_at?: string;
}

interface SQLiteResult {
  insertId?: number;
  rows: any[];
}

export async function saveDocument(document: Document): Promise<number> {
  const result = await db.execAsync(
    `INSERT INTO documents (member_id, file_name, file_uri, file_type, analysis_text)
     VALUES (?, ?, ?, ?, ?)`,
    [document.member_id, document.file_name, document.file_uri, document.file_type, document.analysis_text]
  ) as SQLiteResult[];
  return result[0].insertId || 0;
}

export async function updateDocumentAnalysis(id: number, analysis_text: string): Promise<void> {
  await db.execAsync(
    `UPDATE documents SET analysis_text = ? WHERE id = ?`,
    [analysis_text, id]
  ) as SQLiteResult[];
}

export async function getDocumentsByMemberId(memberId: number): Promise<Document[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync('SELECT * FROM documents WHERE member_id = ? ORDER BY created_at DESC', [memberId]);
  return result;
}

export async function getAllDocuments(): Promise<(Document & { member_name: string })[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync(`SELECT d.*, m.name as member_name FROM documents d JOIN members m ON d.member_id = m.id ORDER BY d.created_at DESC`);
  return result;
}

export async function deleteDocument(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM documents WHERE id = ?', [id]);
} 