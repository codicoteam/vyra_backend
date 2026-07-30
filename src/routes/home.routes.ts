import { Router } from 'express';
import { getHomepageData } from '../controllers/home.controller';
import { AuthRequest } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../config/prisma';

const optionalAuth = async (req: AuthRequest, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, config.jwtSecret);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (user && !user.isBanned) {
        req.user = user;
      }
    } catch (e) {
      // Continue unauthenticated
    }
  }
  next();
};

const router = Router();

router.get('/', optionalAuth, getHomepageData);

export default router;
