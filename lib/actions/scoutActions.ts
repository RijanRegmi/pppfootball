import { postScoutCommand, fetchStatus } from '../api/apiClient';

export async function getLeaguesAction() {
  return await postScoutCommand({ command: 'get_leagues' });
}

export async function getTeamsAction(season: string, league: string) {
  return await postScoutCommand({ command: 'get_teams', season, league });
}

export async function getPlayersAction(season: string, league: string, team: string) {
  return await postScoutCommand({ command: 'get_players', season, league, team });
}

export async function getPlayerProfileAction(season: string, league: string, team: string, player: string) {
  return await postScoutCommand({ command: 'get_player_profile', season, league, team, player });
}

export async function getSimilarPlayersAction(season: string, league: string, team: string, player: string) {
  return await postScoutCommand({ command: 'get_similar_players', season, league, team, player });
}

export async function getHiddenGemsAction(season: string) {
  return await postScoutCommand({ command: 'get_hidden_gems', season });
}

export async function predictFutureAction(season: string, league: string, team: string, player: string) {
  return await postScoutCommand({ command: 'predict_future', season, league, team, player });
}

export async function getStatusAction() {
  return await fetchStatus();
}
