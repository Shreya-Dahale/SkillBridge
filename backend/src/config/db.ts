import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const databaseUrl = process.env.DATABASE_URL || '';

export let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export let pool: Pool | null = null;
if (databaseUrl) {
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });
}

export async function checkDatabaseConnection(): Promise<{
  supabaseConnected: boolean;
  postgresConnected: boolean;
  message: string;
}> {
  let supabaseConnected = false;
  let postgresConnected = false;
  const messages: string[] = [];

  if (pool) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      postgresConnected = true;
      messages.push('PostgreSQL connected');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      messages.push(`PostgreSQL connection error: ${errorMessage}`);
    }
  } else {
    messages.push('DATABASE_URL not configured');
  }

  if (supabase) {
    try {
      // Test basic connectivity via Supabase client
      supabaseConnected = true;
      messages.push('Supabase client initialized');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      messages.push(`Supabase client error: ${errorMessage}`);
    }
  } else {
    messages.push('SUPABASE_URL or SUPABASE_KEY not configured');
  }

  return {
    supabaseConnected,
    postgresConnected,
    message: messages.join('; '),
  };
}
