import { Client } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:pppfootball%4018910114@db.setqngddutxeruwvejfa.supabase.co:5432/postgres';

async function createRPC() {
  console.log('[RPC Setup] Connecting to Supabase PostgreSQL...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log('[RPC Setup] Creating get_seasons_and_leagues RPC function...');
  await client.query(`
    CREATE OR REPLACE FUNCTION get_seasons_and_leagues()
    RETURNS TABLE (season VARCHAR, league VARCHAR)
    LANGUAGE sql STABLE
    AS $$
      SELECT DISTINCT season, league 
      FROM player_records 
      WHERE season IS NOT NULL AND league IS NOT NULL 
      ORDER BY season DESC, league ASC;
    $$;
  `);

  console.log('[RPC Setup] RPC function created successfully!');
  await client.end();
}

createRPC().catch(err => {
  console.error('[RPC Setup Error]', err);
  process.exit(1);
});
