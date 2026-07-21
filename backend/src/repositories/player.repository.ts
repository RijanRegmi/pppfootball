import { PlayerRecordModel, SupplementaryDataModel } from '../models/player.schema';
import { PlayerRow } from '../types/scout.types';

export class PlayerRepository {
  public async getCounts(): Promise<{ player_rows: number; supplementary_rows: number }> {
    try {
      const p = await PlayerRecordModel.countDocuments();
      const s = await SupplementaryDataModel.countDocuments();
      return { player_rows: p, supplementary_rows: s };
    } catch {
      return { player_rows: 0, supplementary_rows: 0 };
    }
  }

  public async getLeagues(): Promise<{ season: string; leagues: string[] }[]> {
    try {
      const agg = await PlayerRecordModel.aggregate([
        { $match: { season: { $ne: null }, league: { $ne: null } } },
        { $group: { _id: { season: '$season', league: '$league' } } },
        { $sort: { '_id.season': -1, '_id.league': 1 } },
      ]);

      const map = new Map<string, Set<string>>();
      for (const item of agg) {
        const season = item._id.season;
        const league = item._id.league;
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
      console.error('[Repository Error] getLeagues:', err);
      return [];
    }
  }

  public async getTeams(season: string, league: string): Promise<string[]> {
    try {
      const teams = await PlayerRecordModel.distinct('team', { season, league, team: { $ne: null } });
      return (teams as string[]).sort();
    } catch (err) {
      console.error('[Repository Error] getTeams:', err);
      return [];
    }
  }

  public async getPlayers(season: string, league: string, team: string): Promise<string[]> {
    try {
      const players = await PlayerRecordModel.distinct('player', { season, league, team, player: { $ne: null } });
      return (players as string[]).sort();
    } catch (err) {
      console.error('[Repository Error] getPlayers:', err);
      return [];
    }
  }

  public async getPlayerRow(season: string, league: string, team: string, player: string): Promise<PlayerRow | null> {
    try {
      const row = await PlayerRecordModel.findOne({ season, league, team, player }).lean();
      return (row as PlayerRow) || null;
    } catch (err) {
      console.error('[Repository Error] getPlayerRow:', err);
      return null;
    }
  }

  public async getPlayersBySeason(season: string, minMinutes: number = 450): Promise<PlayerRow[]> {
    try {
      const rows = await PlayerRecordModel.find({ season }).lean();
      return (rows as PlayerRow[]).filter((r) => {
        const mins = typeof r.minutes === 'number' ? r.minutes : parseFloat(String(r.minutes || '0').replace(/,/g, ''));
        return !isNaN(mins) && mins >= minMinutes;
      });
    } catch (err) {
      console.error('[Repository Error] getPlayersBySeason:', err);
      return [];
    }
  }

  public async getPlayerCareerHistory(player: string): Promise<PlayerRow[]> {
    try {
      const rows = await PlayerRecordModel.find({ player }).sort({ season: -1 }).lean();
      return (rows as PlayerRow[]) || [];
    } catch (err) {
      console.error('[Repository Error] getPlayerCareerHistory:', err);
      return [];
    }
  }

  public async getSupplementaryData(player: string): Promise<any | null> {
    try {
      const row = await SupplementaryDataModel.findOne({ player }).lean();
      return row || null;
    } catch (err) {
      return null;
    }
  }
}
