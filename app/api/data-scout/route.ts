import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ScoutService } from '@/backend/src/services/scout.service';

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

async function connectMongo() {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }
  if (!MONGODB_URI) {
    console.error('[Vercel Mongo Error] MONGODB_URI environment variable is missing.');
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
  } catch (err) {
    console.error('[Vercel Mongo Error]', err);
  }
}

const scoutService = new ScoutService();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { command, season = '2024-2025', league = '', team = '', player = '' } = body;

    switch (command) {
      case 'get_leagues':
        return NextResponse.json(await scoutService.getLeagues());

      case 'get_teams':
        return NextResponse.json(await scoutService.getTeams(season, league));

      case 'get_players':
        return NextResponse.json(await scoutService.getPlayers(season, league, team));

      case 'get_player_profile':
        return NextResponse.json(await scoutService.getPlayerProfile(season, league, team, player));

      case 'get_similar_players':
        return NextResponse.json(await scoutService.getSimilarPlayers(season, league, team, player));

      case 'get_hidden_gems':
        return NextResponse.json(await scoutService.getHiddenGems(season));

      case 'compare_players':
        return NextResponse.json(await scoutService.comparePlayers(body.players || []));

      case 'predict_future':
        return NextResponse.json(await scoutService.predictFuturePerformance(season, league, team, player));

      case 'health':
        return NextResponse.json({ status: 'ok', mongo: isConnected });

      default:
        return NextResponse.json({ error: `Unknown command: ${command}` });
    }
  } catch (err: any) {
    console.error('[API Route Error]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const status = await scoutService.getStatus();
    return NextResponse.json({ status: 'ok', counts: status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
