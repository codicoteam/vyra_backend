import { Router } from 'express';
import { getHealth, getDatabaseHealth, getVersion, getStatus } from '../controllers/system.controller';

const router = Router();

router.get('/health', getHealth);
router.get('/health/database', getDatabaseHealth);
router.get('/version', getVersion);
router.get('/status', getStatus);

export default router;
