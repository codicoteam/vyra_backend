import { Router } from 'express';
import {
  sendDigest,
  getDigestHistory,
  updateDigestPreferences
} from '../controllers/emailDigest.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/send', sendDigest);
router.get('/history', getDigestHistory);
router.put('/preferences', updateDigestPreferences);

export default router;
