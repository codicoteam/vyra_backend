import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config/env';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, config.jwtSecret as jwt.Secret, { expiresIn: config.jwtExpiresIn as any } as jwt.SignOptions);
  const refreshToken = jwt.sign({ userId }, config.jwtRefreshSecret as jwt.Secret, { expiresIn: config.jwtRefreshExpiresIn as any } as jwt.SignOptions);
  return { accessToken, refreshToken };
};

export const getAdminStatus = async (req: Request, res: Response) => {
  const adminCount = await prisma.user.count({
    where: { role: 'ADMIN', deletedAt: null }
  });
  res.status(200).json({
    success: true,
    adminExists: adminCount > 0
  });
};

export const setupFirstAdmin = async (req: Request, res: Response) => {
  const adminCount = await prisma.user.count({
    where: { role: 'ADMIN', deletedAt: null }
  });

  if (adminCount > 0) {
    return res.status(403).json({
      success: false,
      error: { code: 'ADMIN_EXISTS', message: 'Administrator account already exists. Setup is disabled.' }
    });
  }

  const { email, username, password, fullName } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: email.toLowerCase() }, { username }]
    }
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_ENTRY', message: 'Email or username already exists' }
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      username,
      passwordHash,
      fullName,
      role: 'ADMIN',
      isVerified: true
    }
  });

  const { accessToken, refreshToken } = generateTokens(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  const { passwordHash: _, ...safeUser } = user;

  res.status(201).json({
    success: true,
    data: { user: safeUser, accessToken, refreshToken },
    message: 'First Administrator account created successfully'
  });
};

export const register = async (req: Request, res: Response) => {
  const { email, username, password, fullName } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: email.toLowerCase() }, { username }]
    }
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_ENTRY', message: 'Email or username already exists' }
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      username,
      passwordHash,
      fullName,
      role: 'USER'
    }
  });

  const { accessToken, refreshToken } = generateTokens(user.id);
  
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  const { passwordHash: _, ...safeUser } = user;

  res.status(201).json({
    success: true,
    data: { user: safeUser, accessToken, refreshToken },
    message: 'Registration successful'
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase() }
  });

  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
    });
  }

  const { accessToken, refreshToken } = generateTokens(user.id);
  
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  const { passwordHash: _, ...safeUser } = user;

  res.status(200).json({
    success: true,
    data: { user: safeUser, accessToken, refreshToken },
    message: 'Login successful'
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, error: { message: 'Refresh token is required' }});
  }

  const tokenRecord = await prisma.refreshToken.findFirst({
    where: { token: refreshToken, revokedAt: null }
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    return res.status(401).json({ success: false, error: { message: 'Invalid or expired refresh token' }});
  }

  try {
    const decoded: any = jwt.verify(refreshToken, config.jwtRefreshSecret);
    const tokens = generateTokens(decoded.userId);
    
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() }
    });

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: decoded.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.status(200).json({
      success: true,
      data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
    });
  } catch (err) {
    return res.status(401).json({ success: false, error: { message: 'Invalid refresh token' }});
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() }
    });
  }
  res.status(200).json({ success: true, message: 'Logout successful' });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findFirst({ where: { email: email.toLowerCase() } });
  if (!user) {
    return res.status(200).json({ success: true, message: 'If email exists, password reset instructions have been sent.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(Date.now() + 3600000)
    }
  });

  res.status(200).json({
    success: true,
    message: 'Password reset token generated successfully',
    resetToken
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() }
    }
  });

  if (!user) {
    return res.status(400).json({ success: false, error: { message: 'Invalid or expired password reset token' } });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }
  });

  res.status(200).json({ success: true, message: 'Password reset successfully' });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: { gt: new Date() }
    }
  });

  if (!user) {
    return res.status(400).json({ success: false, error: { message: 'Invalid or expired email verification token' } });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationExpires: null
    }
  });

  res.status(200).json({ success: true, message: 'Email verified successfully' });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }
  const { passwordHash: _, ...safeUser } = req.user;
  res.status(200).json({ success: true, data: safeUser });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  const { currentPassword, newPassword } = req.body;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || !dbUser.passwordHash || !(await bcrypt.compare(currentPassword, dbUser.passwordHash))) {
    return res.status(400).json({ success: false, error: { message: 'Current password is incorrect' } });
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash }
  });

  res.status(200).json({ success: true, message: 'Password updated successfully' });
};
