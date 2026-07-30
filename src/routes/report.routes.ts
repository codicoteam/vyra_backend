import { Router } from 'express';
import {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport
} from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', createReport);
router.get('/', authenticate, getReports);
router.get('/:id', authenticate, getReportById);
router.put('/:id', authenticate, updateReport);
router.delete('/:id', authenticate, deleteReport);

export default router;
