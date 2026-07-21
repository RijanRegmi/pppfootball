import { Router } from 'express';
import scoutRoutes from './scout.routes';
import dataRoutes from './data.routes';

const router = Router();

router.use('/api', scoutRoutes);
router.use('/', dataRoutes);

export default router;
