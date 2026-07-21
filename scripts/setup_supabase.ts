import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
// @ts-ignore
import csvParser from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:pppfootball%4018910114@db.setqngddutxeruwvejfa.supabase.co:5432/postgres';

async function main() {
  console.log('[Supabase Setup] Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('[Supabase Setup] Connected successfully to Supabase PostgreSQL!');

  // 1. Create tables and indexes
  console.log('[Supabase Setup] Creating tables and indexes...');
  await client.query(`
    DROP TABLE IF EXISTS player_records;
    DROP TABLE IF EXISTS supplementary_data;

    CREATE TABLE player_records (
      id BIGSERIAL PRIMARY KEY,
      season VARCHAR(50),
      league VARCHAR(100),
      team VARCHAR(100),
      player VARCHAR(150),
      position VARCHAR(50),
      age NUMERIC,
      minutes NUMERIC,
      goals NUMERIC,
      assists NUMERIC,
      xg NUMERIC,
      npxg NUMERIC,
      market_value VARCHAR(100),
      avatar_url TEXT,
      raw_data JSONB
    );

    CREATE TABLE supplementary_data (
      player VARCHAR(150) PRIMARY KEY,
      image_url TEXT,
      avatar_url TEXT,
      market_value_eur NUMERIC,
      raw_data JSONB
    );

    CREATE INDEX idx_pr_lookup ON player_records (season, league, team, player);
    CREATE INDEX idx_pr_season_league ON player_records (season, league);
    CREATE INDEX idx_pr_season_team ON player_records (season, team);
    CREATE INDEX idx_pr_player ON player_records (player);
    CREATE INDEX idx_supp_player ON supplementary_data (player);
  `);
  console.log('[Supabase Setup] Tables created successfully!');

  // 2. Import players.csv.gz
  const playersPath = path.join(process.cwd(), 'players.csv.gz');
  if (fs.existsSync(playersPath)) {
    console.log('[Supabase Setup] Seeding players.csv.gz into player_records...');
    await seedPlayers(client, playersPath);
  } else {
    console.error('[Supabase Setup] players.csv.gz not found at:', playersPath);
  }

  // 3. Import supplementary.csv.gz
  const suppPath = path.join(process.cwd(), 'supplementary.csv.gz');
  if (fs.existsSync(suppPath)) {
    console.log('[Supabase Setup] Seeding supplementary.csv.gz into supplementary_data...');
    await seedSupplementary(client, suppPath);
  } else {
    console.error('[Supabase Setup] supplementary.csv.gz not found at:', suppPath);
  }

  const pRes = await client.query('SELECT COUNT(*) FROM player_records');
  const sRes = await client.query('SELECT COUNT(*) FROM supplementary_data');

  console.log('==================================================');
  console.log(`  Supabase Database Seeding Complete!`);
  console.log(`  -> player_records: ${parseInt(pRes.rows[0].count, 10).toLocaleString()}`);
  console.log(`  -> supplementary_data: ${parseInt(sRes.rows[0].count, 10).toLocaleString()}`);
  console.log('==================================================');

  await client.end();
}

async function seedPlayers(client: Client, filePath: string) {
  let batch: any[] = [];
  const BATCH_SIZE = 1000;
  let totalInserted = 0;

  const readStream = fs.createReadStream(filePath).pipe(zlib.createGunzip()).pipe(csvParser());

  for await (const row of readStream) {
    batch.push(row);
    if (batch.length >= BATCH_SIZE) {
      await insertPlayerBatch(client, batch);
      totalInserted += batch.length;
      if (totalInserted % 10000 === 0 || totalInserted > 165000) {
        console.log(`[Supabase Seeder] Uploaded ${totalInserted.toLocaleString()} player records...`);
      }
      batch = [];
    }
  }

  if (batch.length > 0) {
    await insertPlayerBatch(client, batch);
    totalInserted += batch.length;
    batch = [];
  }

  console.log(`[Supabase Seeder] Finished uploading ${totalInserted.toLocaleString()} player records.`);
}

async function insertPlayerBatch(client: Client, rows: any[]) {
  const values: any[] = [];
  const valueTuples: string[] = [];

  let idx = 1;
  for (const r of rows) {
    const season = r.season || null;
    const league = r.league || null;
    const team = r.team || null;
    const player = r.player || null;
    const position = r.position || r.Pos || null;
    const age = parseFloat(r.age) || null;
    const minutes = parseFloat(r.minutes || r.Min) || null;
    const goals = parseFloat(r.goals || r.Gls) || null;
    const assists = parseFloat(r.assists || r.Ast) || null;
    const xg = parseFloat(r.xg || r.xG) || null;
    const npxg = parseFloat(r.npxg || r.npxG) || null;
    const marketVal = r.market_value || r.market_value_eur || null;
    const avatarUrl = r.avatar_url || r.image_url || null;

    valueTuples.push(`($${idx}, $${idx+1}, $${idx+2}, $${idx+3}, $${idx+4}, $${idx+5}, $${idx+6}, $${idx+7}, $${idx+8}, $${idx+9}, $${idx+10}, $${idx+11}, $${idx+12}, $${idx+13})`);
    values.push(season, league, team, player, position, age, minutes, goals, assists, xg, npxg, marketVal, avatarUrl, JSON.stringify(r));
    idx += 14;
  }

  const query = `
    INSERT INTO player_records (season, league, team, player, position, age, minutes, goals, assists, xg, npxg, market_value, avatar_url, raw_data)
    VALUES ${valueTuples.join(', ')}
  `;

  await client.query(query, values);
}

async function seedSupplementary(client: Client, filePath: string) {
  let batch: any[] = [];
  const BATCH_SIZE = 1000;
  let totalInserted = 0;

  const readStream = fs.createReadStream(filePath).pipe(zlib.createGunzip()).pipe(csvParser());

  for await (const row of readStream) {
    if (!row.player) continue;
    batch.push(row);
    if (batch.length >= BATCH_SIZE) {
      await insertSupplementaryBatch(client, batch);
      totalInserted += batch.length;
      batch = [];
    }
  }

  if (batch.length > 0) {
    await insertSupplementaryBatch(client, batch);
    totalInserted += batch.length;
    batch = [];
  }

  console.log(`[Supabase Seeder] Finished uploading ${totalInserted.toLocaleString()} supplementary records.`);
}

async function insertSupplementaryBatch(client: Client, rows: any[]) {
  const uniqueMap = new Map<string, any>();
  for (const r of rows) {
    if (r.player) uniqueMap.set(r.player, r);
  }
  const uniqueRows = Array.from(uniqueMap.values());
  if (uniqueRows.length === 0) return;

  const values: any[] = [];
  const valueTuples: string[] = [];

  let idx = 1;
  for (const r of uniqueRows) {
    const player = r.player;
    const imageUrl = r.image_url || r.avatar_url || null;
    const avatarUrl = r.avatar_url || r.image_url || null;
    const marketVal = parseFloat(r.market_value_eur) || null;

    valueTuples.push(`($${idx}, $${idx+1}, $${idx+2}, $${idx+3}, $${idx+4})`);
    values.push(player, imageUrl, avatarUrl, marketVal, JSON.stringify(r));
    idx += 5;
  }

  const query = `
    INSERT INTO supplementary_data (player, image_url, avatar_url, market_value_eur, raw_data)
    VALUES ${valueTuples.join(', ')}
    ON CONFLICT (player) DO UPDATE SET
      image_url = EXCLUDED.image_url,
      avatar_url = EXCLUDED.avatar_url,
      market_value_eur = EXCLUDED.market_value_eur,
      raw_data = EXCLUDED.raw_data
  `;

  await client.query(query, values);
}

main().catch((err) => {
  console.error('[Supabase Setup Error]', err);
  process.exit(1);
});
