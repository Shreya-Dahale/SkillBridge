import { pool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export interface ReportMetadata {
  id: string;
  candidate_id: string;
  report_type: string; // 'pdf' | 'csv' | 'xlsx'
  file_path: string;
  generated_at: string;
}

export async function initReportMetadataTable(): Promise<void> {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS report_metadata (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        report_type VARCHAR(10) NOT NULL,
        file_path TEXT NOT NULL,
        generated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_report_meta_candidate ON report_metadata(candidate_id);
    `);
    console.log('Report metadata table initialized.');
  } catch (err) {
    console.warn('Report metadata table init error:', err instanceof Error ? err.message : err);
  }
}

export async function saveReportMetadata(candidateId: string, reportType: string, filePath: string): Promise<ReportMetadata> {
  if (!pool) throw new Error('Database not connected');
  const id = uuidv4();
  const now = new Date().toISOString();
  const res = await pool.query(
    `INSERT INTO report_metadata (id, candidate_id, report_type, file_path, generated_at) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [id, candidateId, reportType, filePath, now]
  );
  const row = res.rows[0] as Record<string, unknown>;
  return {
    id: String(row.id),
    candidate_id: String(row.candidate_id),
    report_type: String(row.report_type),
    file_path: String(row.file_path),
    generated_at: row.generated_at ? new Date(row.generated_at as string).toISOString() : new Date().toISOString(),
  };
}

export async function getCandidateReports(candidateId: string): Promise<ReportMetadata[]> {
  if (!pool) return [];
  const res = await pool.query(
    'SELECT * FROM report_metadata WHERE candidate_id=$1 ORDER BY generated_at DESC',
    [candidateId]
  );
  return res.rows.map((row: Record<string, unknown>) => ({
    id: String(row.id),
    candidate_id: String(row.candidate_id),
    report_type: String(row.report_type),
    file_path: String(row.file_path),
    generated_at: row.generated_at ? new Date(row.generated_at as string).toISOString() : new Date().toISOString(),
  }));
}
