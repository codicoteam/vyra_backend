import { Router } from 'express';
import {
  createDraft,
  getDrafts,
  getDraftById,
  updateDraft,
  deleteDraft
} from '../controllers/draft.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createDraft);
router.get('/', getDrafts);
router.get('/:id', getDraftById);
router.put('/:id', updateDraft);
router.delete('/:id', deleteDraft);

export default router;
