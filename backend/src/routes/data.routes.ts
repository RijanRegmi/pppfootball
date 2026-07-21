import { Router } from 'express';
import multer from 'multer';
import { DataController } from '../controllers/data.controller';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.get('/status', DataController.getStatus);
router.post('/upload', upload.fields([{ name: 'players' }, { name: 'supplementary' }]), DataController.uploadData);

export default router;
