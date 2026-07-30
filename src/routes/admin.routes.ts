import { Router } from 'express';
import {
  getAdminDashboard,
  getAdminUsers,
  updateUserRole,
  suspendUser,
  activateUser,
  deleteUserByAdmin,
  getAdminPosts,
  deletePostByAdmin,
  getAdminReports,
  getAdminStatistics,
  getStats
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../constants/roles';

const router = Router();

// Middleware: Authenticate & Authorize Admin
router.use(authenticate, authorize([UserRole.ADMIN]));

router.get('/dashboard', getAdminDashboard);
router.get('/stats', getStats);
router.get('/statistics', getAdminStatistics);

router.get('/users', getAdminUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/activate', activateUser);
router.delete('/users/:id', deleteUserByAdmin);

router.get('/posts', getAdminPosts);
router.delete('/posts/:id', deletePostByAdmin);

router.get('/reports', getAdminReports);

export default router;
