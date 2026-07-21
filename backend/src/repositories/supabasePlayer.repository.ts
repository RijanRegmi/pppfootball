import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PlayerRow } from '../types/scout.types';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://setqngddutxeruwvejfa.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable__W62rsixUHk3y_4aPnDKtw_3eMzF9Bj';

export class SupabasePlayerRepository {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  public async getCounts(): Promise<{ player_rows: number; supplementary_rows: number }> {
    try {
      const { count: p } = await this.client.from('player_records').select('*', { count: 'exact', head: true });
      const { count: s } = await this.client.from('supplementary_data').select('*', { count: 'exact', head: true });
      return { player_rows: p || 0, supplementary_rows: s || 0 };
    } catch (err) {
      console.error('[Supabase Repo Error] getCounts:', err);
      return { player_rows: 0, supplementary_rows: 0 };
    }
  }

  public async getLeagues(): Promise<{ season: string; leagues: string[] }[]> {
    try {
      const { data, error } = await this.client.rpc('get_seasons_and_leagues');
      if (error || !data) {
        console.error('[Supabase Repo Error] rpc get_seasons_and_leagues:', error);
        return [];
      }

      const map = new Map<string, Set<string>>();
      for (const item of data) {
        const season = item.season;
        const league = item.league;
        if (season && league) {
          if (!map.has(season)) map.set(season, new Set());
          map.get(season)!.add(league);
        }
      }

      const result: { season: string; leagues: string[] }[] = [];
      map.forEach((leaguesSet, season) => {
        result.push({ season, leagues: Array.from(leaguesSet) });
      });

      return result;
    } catch (err) {
      console.error('[Supabase Repo Error] getLeagues:', err);
      return [];
    }
  }

  public async getTeams(season: string, league: string): Promise<string[]> {
    try {
      const { data, error } = await this.client
        .from('player_records')
        .select('team')
        .eq('season', season)
        .eq('league', league);

      if (error || !data) return [];

      const set = new Set<string>();
      for (const row of data) {
        if (row.team) set.add(row.team);
      }
      return Array.from(set).sort();
    } catch (err) {
      console.error('[Supabase Repo Error] getTeams:', err);
      return [];
    }
  }

  public async getPlayers(season: string, league: string, team: string): Promise<string[]> {
    try {
      const { data, error } = await this.client
        .from('player_records')
        .select('player')
        .eq('season', season)
        .eq('league', league)
        .eq('team', team);

      if (error || !data) return [];

      const set = new Set<string>();
      for (const row of data) {
        if (row.player) set.add(row.player);
      }
      return Array.from(set).sort();
    } catch (err) {
      console.error('[Supabase Repo Error] getPlayers:', err);
      return [];
    }
  }

  public async getPlayerRow(season: string, league: string, team: string, player: string): Promise<PlayerRow | null> {
    try {
      const { data, error } = await this.client
        .from('player_records')
        .select('raw_data')
        .eq('season', season)
        .eq('league', league)
        .eq('team', team)
        .eq('player', player)
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;
      return (data.raw_data as PlayerRow) || null;
    } catch (err) {
      console.error('[Supabase Repo Error] getPlayerRow:', err);
      return null;
    }
  }

  public async getPlayersBySeason(season: string, minMinutes: number = 450): Promise<PlayerRow[]> {
    try {
      const { data, error } = await this.client
        .from('player_records')
        .select('raw_data')
        .eq('season', season)
        .gte('minutes', minMinutes);

      if (error || !data) return [];
      return data.map((r) => r.raw_data as PlayerRow);
    } catch (err) {
      console.error('[Supabase Repo Error] getPlayersBySeason:', err);
      return [];
    }
  }

  public async getPlayerCareerHistory(player: string): Promise<PlayerRow[]> {
    try {
      const { data, error } = await this.client
        .from('player_records')
        .select('raw_data')
        .eq('player', player)
        .order('season', { ascending: false });

      if (error || !data) return [];
      return data.map((r) => r.raw_data as PlayerRow);
    } catch (err) {
      console.error('[Supabase Repo Error] getPlayerCareerHistory:', err);
      return [];
    }
  }

  public async getSupplementaryData(player: string): Promise<any | null> {
    try {
      const { data, error } = await this.client
        .from('supplementary_data')
        .select('raw_data')
        .eq('player', player)
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;
      return data.raw_data || null;
    } catch (err) {
      console.error('[Supabase Repo Error] getSupplementaryData:', err);
      return null;
    }
  }
}
