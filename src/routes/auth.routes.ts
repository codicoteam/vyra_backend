import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe,
  changePassword,
  getAdminStatus,
  setupFirstAdmin
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/admin-status', getAdminStatus);
router.post('/setup-admin', setupFirstAdmin);

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePassword);

export default router;
