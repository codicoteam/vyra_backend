import { Router } from 'express';
import {
  getUsers,
  getUserById,
  getUserByUsername,
  updateProfile,
  updateAvatar,
  deleteAccount
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getUsers);
router.put('/profile', authenticate, updateProfile);
router.put('/avatar', authenticate, updateAvatar);
router.delete('/account', authenticate, deleteAccount);
router.get('/username/:username', getUserByUsername);
router.get('/:id', getUserById);

export default router;
