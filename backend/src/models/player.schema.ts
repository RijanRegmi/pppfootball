import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayerRecord extends Document {
  season: string;
  league: string;
  team: string;
  player: string;
  position?: string;
  age?: number | string;
  minutes?: number | string;
  goals?: number | string;
  assists?: number | string;
  xg?: number | string;
  npxg?: number | string;
  market_value?: string;
  avatar_url?: string;
  [key: string]: any;
}

export interface ISupplementaryData extends Document {
  player: string;
  image_url?: string;
  avatar_url?: string;
  [key: string]: any;
}

const PlayerRecordSchema = new Schema<IPlayerRecord>(
  {
    season: { type: String, index: true },
    league: { type: String, index: true },
    team: { type: String, index: true },
    player: { type: String, index: true },
    position: { type: String },
    age: { type: Schema.Types.Mixed },
    minutes: { type: Schema.Types.Mixed },
    goals: { type: Schema.Types.Mixed },
    assists: { type: Schema.Types.Mixed },
    xg: { type: Schema.Types.Mixed },
    npxg: { type: Schema.Types.Mixed },
    market_value: { type: String },
    avatar_url: { type: String },
  },
  { strict: false, timestamps: true }
);

PlayerRecordSchema.index({ season: 1, league: 1, team: 1, player: 1 });
PlayerRecordSchema.index({ season: 1, league: 1 });

const SupplementaryDataSchema = new Schema<ISupplementaryData>(
  {
    player: { type: String, index: true },
    image_url: { type: String },
    avatar_url: { type: String },
  },
  { strict: false, timestamps: true }
);

export const PlayerRecordModel = mongoose.model<IPlayerRecord>(
  'PlayerRecord',
  PlayerRecordSchema,
  'league_season_team_player_data'
);

export const SupplementaryDataModel = mongoose.model<ISupplementaryData>(
  'SupplementaryData',
  SupplementaryDataSchema,
  'player_supplementary_data'
);
