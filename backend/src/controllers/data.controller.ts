import { Request, Response, NextFunction } from 'express';
import { ScoutService } from '../services/scout.service';

const scoutService = new ScoutService();

export class DataController {
  public static getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const counts = scoutService.getStatus();
      return res.json(counts);
    } catch (error) {
      next(error);
    }
  }

  public static async uploadData(req: Request, res: Response, next: NextFunction) {
    try {
      return res.json({ ok: true, message: 'Upload endpoint ready' });
    } catch (error) {
      next(error);
    }
  }
}
