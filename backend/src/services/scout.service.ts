import { SupabasePlayerRepository } from '../repositories/supabasePlayer.repository';
import { safeFloat, formatEur, round } from '../utils/math.utils';

export class ScoutService {
  private playerRepo = new SupabasePlayerRepository();

  public async getStatus() {
    return await this.playerRepo.getCounts();
  }

  public async getLeagues() {
    const all = await this.playerRepo.getLeagues();
    return all.map(seasonObj => ({
      season: seasonObj.season,
      leagues: seasonObj.leagues
    })).filter(seasonObj => seasonObj.leagues.length > 0);
  }

  public async getTeams(season: string, league: string) {
    return await this.playerRepo.getTeams(season, league);
  }

  public async getPlayers(season: string, league: string, team: string) {
    return await this.playerRepo.getPlayers(season, league, team);
  }

  public async getPlayerProfile(season: string, league: string, team: string, player: string) {
    const row = await this.playerRepo.getPlayerRow(season, league, team, player);
    if (!row) {
      return { error: `Player ${player} not found` };
    }

    const supp = await this.playerRepo.getSupplementaryData(player);
    const goals = safeFloat(row.goals);
    const assists = safeFloat(row.assists);
    const minutes = safeFloat(row.minutes);
    const matches = safeFloat(row.games || row.ptime_games || row.gk_games);
    const starts = safeFloat(row.games_starts || row.gk_games_starts);
    const xg = safeFloat(row.xg);
    const xgAssist = safeFloat(row.xg_assist || row.npxg_xg_assist);
    const marketVal = safeFloat(supp?.market_value_eur || row.market_value_eur || 5000000);

    const min = minutes > 0 ? minutes : 90;
    const goalsPer90 = (goals / min) * 90;
    const assistsPer90 = (assists / min) * 90;
    const xgPer90 = (xg / min) * 90;
    const xaPer90 = (xgAssist / min) * 90;
    const tacklesPer90 = (safeFloat(row.tackles) / min) * 90;
    const intPer90 = (safeFloat(row.interceptions) / min) * 90;
    const passPct = safeFloat(row.passes_pct) || 78;
    const aerialPct = safeFloat(row.aerials_won_pct) || 55;
    const pos = (row.position || 'MF').toUpperCase();

    // Percentile Calculations
    let shootingPct = Math.round(Math.min(99, Math.max(15, goalsPer90 * 110 + xgPer90 * 45)));
    let passingPct = Math.round(Math.min(99, Math.max(25, passPct * 0.95 + (safeFloat(row.passes_completed) / min) * 20)));
    let chancePct = Math.round(Math.min(99, Math.max(15, assistsPer90 * 140 + xaPer90 * 60 + (safeFloat(row.key_passes) / min) * 15)));
    let defendingPct = Math.round(Math.min(99, Math.max(15, (tacklesPer90 + intPer90) * 22 + (safeFloat(row.clearances) / min) * 8)));
    let physicalPct = Math.round(Math.min(99, Math.max(20, aerialPct * 0.9 + (min / 3420) * 20)));

    if (pos.includes('DF')) {
      defendingPct = Math.min(99, Math.max(65, defendingPct + 25));
      shootingPct = Math.min(65, shootingPct);
    } else if (pos.includes('FW')) {
      shootingPct = Math.min(99, Math.max(55, shootingPct + 15));
      chancePct = Math.min(99, Math.max(50, chancePct + 10));
    } else if (pos.includes('GK')) {
      defendingPct = 85;
      passingPct = Math.min(90, Math.max(60, passPct));
      shootingPct = 15;
      chancePct = 20;
    }

    const radarStats = {
      Shooting: shootingPct,
      Passing: passingPct,
      ChanceCreation: chancePct,
      Defending: defendingPct,
      Physicality: physicalPct,
    };

    const careerRows = await this.playerRepo.getPlayerCareerHistory(player);
    const careerHistory = careerRows.map((c) => ({
      season: c.season,
      team: c.team,
      league: c.league,
      matches: safeFloat(c.games || c.ptime_games || c.gk_games),
      starts: safeFloat(c.games_starts || c.gk_games_starts),
      minutes: safeFloat(c.minutes),
      goals: safeFloat(c.goals),
      assists: safeFloat(c.assists),
      xg: round(safeFloat(c.xg)),
    }));

    const careerTotals = {
      total_matches: careerHistory.reduce((sum, c) => sum + c.matches, 0),
      total_starts: careerHistory.reduce((sum, c) => sum + c.starts, 0),
      total_goals: careerHistory.reduce((sum, c) => sum + c.goals, 0),
      total_assists: careerHistory.reduce((sum, c) => sum + c.assists, 0),
      total_minutes: careerHistory.reduce((sum, c) => sum + c.minutes, 0),
      total_xg: round(careerHistory.reduce((sum, c) => sum + c.xg, 0)),
      total_seasons: careerHistory.length,
    };

    return {
      player_info: {
        player: row.player,
        season: row.season,
        league: row.league,
        team: row.team,
        position: row.position || 'MF',
        matches: matches,
        starts: starts,
        minutes: minutes,
        age: safeFloat(row.age) || 24,
        market_value: formatEur(marketVal),
        market_value_raw: marketVal,
        avatar_url: supp?.avatar_url || supp?.image_url || row.avatar_url || null,
      },
      radar_chart: radarStats,
      key_metrics: {
        matches: matches,
        starts: starts,
        goals: goals,
        assists: assists,
        xg: round(xg),
        xg_assist: round(xgAssist),
        minutes: minutes,
      },
      detailed_stats: {
        shooting: {
          shots: safeFloat(row.shots),
          sot: safeFloat(row.shots_on_target),
          sot_pct: round(safeFloat(row.shots_on_target_pct), 1),
          xg: round(xg),
          npxg: round(safeFloat(row.npxg)),
        },
        passing: {
          passes_completed: safeFloat(row.passes_completed || row.passes),
          pass_pct: round(safeFloat(row.passes_pct), 1),
          key_passes: safeFloat(row.key_passes || row.sca || row.pass_assists),
          progressive_passes: safeFloat(row.progressive_passes || row.pass_progressive_passes),
        },
        defending: {
          tackles: safeFloat(row.tackles),
          interceptions: safeFloat(row.interceptions),
          clearances: safeFloat(row.clearances),
          aerial_pct: round(safeFloat(row.aerials_won_pct), 1),
        },
      },
      career_totals: careerTotals,
      career_history: careerHistory,
      raw_stats: row,
    };
  }

  public async getSimilarPlayers(season: string, league: string, team: string, player: string) {
    const targetProfile = await this.getPlayerProfile(season, league, team, player);
    if ('error' in targetProfile) return targetProfile;

    const pool = await this.playerRepo.getPlayersBySeason(season, 450);
    const targetRadar = targetProfile.radar_chart;

    const scored = pool
      .filter((p) => !(p.player === player && p.team === team))
      .map((p) => {
        const pGoals = safeFloat(p.goals);
        const pAssists = safeFloat(p.assists);
        const pMin = safeFloat(p.minutes) || 1;
        const pXg = safeFloat(p.xg);

        const pRadar = {
          Shooting: Math.min(100, Math.max(10, round((pGoals * 90) / pMin * 120 + pXg * 25) || 50)),
          Passing: Math.min(100, Math.max(10, round(safeFloat(p.passes_pct) || 75))),
          ChanceCreation: Math.min(100, Math.max(10, round((pAssists * 90) / pMin * 150) || 55)),
          Defending: Math.min(100, Math.max(10, round(safeFloat(p.tackles) * 10 + safeFloat(p.interceptions) * 8) || 45)),
          Physicality: Math.min(100, Math.max(10, round(safeFloat(p.aerials_won_pct) || 60))),
        };

        const keys = Object.keys(targetRadar) as (keyof typeof targetRadar)[];
        let dot = 0, normA = 0, normB = 0;
        for (const k of keys) {
          const a = targetRadar[k];
          const b = pRadar[k];
          dot += a * b;
          normA += a * a;
          normB += b * b;
        }
        const similarity = Math.min(99.9, Math.max(40.0, (dot / (Math.sqrt(normA) * Math.sqrt(normB))) * 100));

        return {
          player: p.player,
          team: p.team,
          league: p.league,
          similarity_score: round(similarity, 1),
          age: safeFloat(p.age) || 24,
          position: p.position || 'MF',
          market_value: formatEur(safeFloat(p.market_value_eur || 5000000)),
        };
      })
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, 15);

    return {
      target_player: player,
      similar_players: scored,
    };
  }

  public async getHiddenGems(season: string) {
    const pool = await this.playerRepo.getPlayersBySeason(season, 600);
    const gems = pool
      .filter((p) => {
        const age = safeFloat(p.age);
        const goals = safeFloat(p.goals);
        const assists = safeFloat(p.assists);
        return (age === 0 || age <= 23) && (goals + assists >= 3);
      })
      .map((p) => {
        const goals = safeFloat(p.goals);
        const assists = safeFloat(p.assists);
        const xg = safeFloat(p.xg);
        const marketVal = safeFloat(p.market_value_eur) || 3500000;
        const gemScore = round(Math.min(98, 65 + (goals + assists) * 3 + xg * 2), 1);

        return {
          player: p.player,
          team: p.team,
          league: p.league,
          age: safeFloat(p.age) || 21,
          position: p.position || 'FW',
          gem_score: gemScore,
          signals: ['High Efficiency', 'Under-Valued Talent', 'Emerging Prospect'],
          market_value: formatEur(marketVal),
        };
      })
      .sort((a, b) => b.gem_score - a.gem_score)
      .slice(0, 50);

    return gems;
  }

  public async comparePlayers(playerList: { season: string; league: string; team: string; player: string }[]) {
    const results = await Promise.all(playerList.map((p) => this.getPlayerProfile(p.season, p.league, p.team, p.player)));
    return { comparison: results };
  }

  public async predictFuturePerformance(season: string, league: string, team: string, player: string) {
    const profile = await this.getPlayerProfile(season, league, team, player);
    if ('error' in profile) return profile;

    const currentRadar = profile.radar_chart;
    const age = profile.player_info.age;

    let mult = 1.0;
    if (age < 24) mult = 1.08;
    else if (age >= 24 && age <= 28) mult = 1.02;
    else mult = 0.94;

    const predict = (val: number, multiplier: number) => Math.min(100, Math.max(10, Math.round(val * multiplier)));

    const predictedRadar = {
      Shooting: predict(currentRadar.Shooting, mult),
      Passing: predict(currentRadar.Passing, age > 28 ? 0.98 : mult),
      ChanceCreation: predict(currentRadar.ChanceCreation, age > 28 ? 0.97 : mult),
      Defending: predict(currentRadar.Defending, age > 28 ? 0.98 : mult),
      Physicality: predict(currentRadar.Physicality, age > 28 ? 0.88 : mult),
    };

    return {
      target_player: player,
      age: age,
      current_radar: currentRadar,
      predicted_radar: predictedRadar,
    };
  }
}
