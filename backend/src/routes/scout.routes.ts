import { Router } from 'express';
import { ScoutController } from '../controllers/scout.controller';

const router = Router();

router.post('/data-scout', ScoutController.handleCommand);
router.get('/data-scout/shortlist', ScoutController.getShortlist);
router.post('/data-scout/shortlist', ScoutController.updateShortlist);

export default router;
