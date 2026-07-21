import { Client } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:pppfootball%4018910114@db.setqngddutxeruwvejfa.supabase.co:5432/postgres';

async function fixRLS() {
  console.log('[RLS Fix] Connecting to Supabase PostgreSQL...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log('[RLS Fix] Enabling RLS and public SELECT policies...');
  await client.query(`
    ALTER TABLE public.player_records ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public read access on player_records" ON public.player_records;
    CREATE POLICY "Allow public read access on player_records" ON public.player_records FOR SELECT USING (true);

    ALTER TABLE public.supplementary_data ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public read access on supplementary_data" ON public.supplementary_data;
    CREATE POLICY "Allow public read access on supplementary_data" ON public.supplementary_data FOR SELECT USING (true);
  `);

  console.log('[RLS Fix] Row Level Security (RLS) policies successfully applied!');
  await client.end();
}

fixRLS().catch(err => {
  console.error('[RLS Fix Error]', err);
  process.exit(1);
});
