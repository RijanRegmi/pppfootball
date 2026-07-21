export interface PlayerRow {
  player: string;
  season: string;
  league: string;
  team: string;
  position?: string;
  minutes?: number;
  age?: number;
  goals?: number;
  assists?: number;
  shots?: number;
  shots_on_target?: number;
  xg?: number;
  xg_assist?: number;
  passes_completed?: number;
  passes_pct?: number;
  tackles?: number;
  interceptions?: number;
  clearances?: number;
  aerials_won_pct?: number;
  market_value_eur?: number;
  [key: string]: any;
}

export interface ScoutCommandRequest {
  command: string;
  season?: string;
  league?: string;
  team?: string;
  player?: string;
  min_minutes?: number;
  [key: string]: any;
}
