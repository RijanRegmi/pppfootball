import { Pool } from 'pg';
import { PlayerRow } from '../types/scout.types';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:pppfootball%4018910114@db.setqngddutxeruwvejfa.supabase.co:5432/postgres';

export class SupabasePlayerRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }

  public async getCounts(): Promise<{ player_rows: number; supplementary_rows: number }> {
    try {
      const pRes = await this.pool.query('SELECT COUNT(*) FROM player_records');
      const sRes = await this.pool.query('SELECT COUNT(*) FROM supplementary_data');
      return {
        player_rows: parseInt(pRes.rows[0].count, 10),
        supplementary_rows: parseInt(sRes.rows[0].count, 10),
      };
    } catch (err) {
      console.error('[Supabase Repo Error] getCounts:', err);
      return { player_rows: 0, supplementary_rows: 0 };
    }
  }

  public async getLeagues(): Promise<{ season: string; leagues: string[] }[]> {
    try {
      const query = `
        SELECT season, ARRAY_AGG(DISTINCT league ORDER BY league) as leagues
        FROM player_records
        WHERE season IS NOT NULL AND league IS NOT NULL
        GROUP BY season
        ORDER BY season DESC;
      `;
      const res = await this.pool.query(query);
      return res.rows.map((row) => ({ season: row.season, leagues: row.leagues }));
    } catch (err) {
      console.error('[Supabase Repo Error] getLeagues:', err);
      return [];
    }
  }

  public async getTeams(season: string, league: string): Promise<string[]> {
    try {
      const query = `
        SELECT DISTINCT team
        FROM player_records
        WHERE season = $1 AND league = $2 AND team IS NOT NULL
        ORDER BY team ASC;
      `;
      const res = await this.pool.query(query, [season, league]);
      return res.rows.map((r) => r.team);
    } catch (err) {
      console.error('[Supabase Repo Error] getTeams:', err);
      return [];
    }
  }

  public async getPlayers(season: string, league: string, team: string): Promise<string[]> {
    try {
      const query = `
        SELECT DISTINCT player
        FROM player_records
        WHERE season = $1 AND league = $2 AND team = $3 AND player IS NOT NULL
        ORDER BY player ASC;
      `;
      const res = await this.pool.query(query, [season, league, team]);
      return res.rows.map((r) => r.player);
    } catch (err) {
      console.error('[Supabase Repo Error] getPlayers:', err);
      return [];
    }
  }

  public async getPlayerRow(season: string, league: string, team: string, player: string): Promise<PlayerRow | null> {
    try {
      const query = `
        SELECT raw_data
        FROM player_records
        WHERE season = $1 AND league = $2 AND team = $3 AND player = $4
        LIMIT 1;
      `;
      const res = await this.pool.query(query, [season, league, team, player]);
      if (res.rows.length === 0) return null;
      return res.rows[0].raw_data as PlayerRow;
    } catch (err) {
      console.error('[Supabase Repo Error] getPlayerRow:', err);
      return null;
    }
  }

  public async getPlayersBySeason(season: string, minMinutes: number = 450): Promise<PlayerRow[]> {
    try {
      const query = `
        SELECT raw_data
        FROM player_records
        WHERE season = $1 AND minutes >= $2;
      `;
      const res = await this.pool.query(query, [season, minMinutes]);
      return res.rows.map((r) => r.raw_data as PlayerRow);
    } catch (err) {
      console.error('[Supabase Repo Error] getPlayersBySeason:', err);
      return [];
    }
  }

  public async getPlayerCareerHistory(player: string): Promise<PlayerRow[]> {
    try {
      const query = `
        SELECT raw_data
        FROM player_records
        WHERE player = $1
        ORDER BY season DESC;
      `;
      const res = await this.pool.query(query, [player]);
      return res.rows.map((r) => r.raw_data as PlayerRow);
    } catch (err) {
      console.error('[Supabase Repo Error] getPlayerCareerHistory:', err);
      return [];
    }
  }

  public async getSupplementaryData(player: string): Promise<any | null> {
    try {
      const query = `
        SELECT raw_data
        FROM supplementary_data
        WHERE player = $1
        LIMIT 1;
      `;
      const res = await this.pool.query(query, [player]);
      if (res.rows.length === 0) return null;
      return res.rows[0].raw_data;
    } catch (err) {
      console.error('[Supabase Repo Error] getSupplementaryData:', err);
      return null;
    }
  }
}
