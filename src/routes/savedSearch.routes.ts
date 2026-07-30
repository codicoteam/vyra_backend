import { Router } from 'express';
import {
  getSavedSearches,
  createSavedSearch,
  deleteSavedSearch
} from '../controllers/savedSearch.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getSavedSearches);
router.post('/', createSavedSearch);
router.delete('/:id', deleteSavedSearch);

export default router;
