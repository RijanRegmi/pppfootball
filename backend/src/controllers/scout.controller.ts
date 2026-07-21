import { Request, Response, NextFunction } from 'express';
import { ScoutService } from '../services/scout.service';
import { ScoutQueryDto } from '../dtos/scout.dto';

const scoutService = new ScoutService();

export class ScoutController {
  public static async handleCommand(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = new ScoutQueryDto(req.body);
      const { command, season = '2024-2025', league = '', team = '', player = '' } = req.body;

      switch (command) {
        case 'get_leagues':
          return res.json(await scoutService.getLeagues());

        case 'get_teams':
          return res.json(await scoutService.getTeams(season, league));

        case 'get_players':
          return res.json(await scoutService.getPlayers(season, league, team));

        case 'get_player_profile':
          return res.json(await scoutService.getPlayerProfile(season, league, team, player));

        case 'get_similar_players':
          return res.json(await scoutService.getSimilarPlayers(season, league, team, player));

        case 'get_hidden_gems':
          return res.json(await scoutService.getHiddenGems(season));

        case 'compare_players':
          return res.json(await scoutService.comparePlayers(req.body.players || []));

        case 'predict_future':
          return res.json(await scoutService.predictFuturePerformance(season, league, team, player));

        case 'health':
          return res.json({ status: 'ok' });

        default:
          return res.json({ error: `Unknown command: ${command}` });
      }
    } catch (error) {
      next(error);
    }
  }

  public static getShortlist(req: Request, res: Response) {
    return res.json({ ok: true, shortlist: [] });
  }

  public static updateShortlist(req: Request, res: Response) {
    return res.json({ ok: true });
  }
}
