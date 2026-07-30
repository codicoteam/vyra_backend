import { Router } from 'express';
import { addHistory, getHistory, deleteHistoryItem } from '../controllers/history.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', addHistory);
router.get('/', getHistory);
router.delete('/:id', deleteHistoryItem);

export default router;
