import { Router } from 'express';
import { downloadFile } from '../controllers/downloads.controller';

const router = Router();

router.get('/:id', downloadFile);

export default router;
