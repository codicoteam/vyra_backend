import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config/env';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';
import { sendVerificationCode } from '../utils/mailer';
import { OAuth2Client } from 'google-auth-library';
import { sendResetCode } from '../utils/mailer';

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    config.jwtSecret as jwt.Secret,
    { expiresIn: config.jwtExpiresIn as any } as jwt.SignOptions,
  );
  const refreshToken = jwt.sign(
    { userId },
    config.jwtRefreshSecret as jwt.Secret,
    { expiresIn: config.jwtRefreshExpiresIn as any } as jwt.SignOptions,
  );
  return { accessToken, refreshToken };
};

export const getAdminStatus = async (req: Request, res: Response) => {
  const adminCount = await prisma.user.count({
    where: { role: 'ADMIN', deletedAt: null },
  });
  res.status(200).json({
    success: true,
    adminExists: adminCount > 0,
  });
};

export const setupFirstAdmin = async (req: Request, res: Response) => {
  const adminCount = await prisma.user.count({
    where: { role: 'ADMIN', deletedAt: null },
  });

  if (adminCount > 0) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ADMIN_EXISTS',
        message: 'Administrator account already exists. Setup is disabled.',
      },
    });
  }

  const { email, username, password, fullName } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: email.toLowerCase() }, { username }],
    },
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Email or username already exists',
      },
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
      isVerified: true,
    },
  });

  const { accessToken, refreshToken } = generateTokens(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const { passwordHash: _, ...safeUser } = user;

  res.status(201).json({
    success: true,
    data: { user: safeUser, accessToken, refreshToken },
    message: 'First Administrator account created successfully',
  });
};
const hashCode = (code: string) =>
  crypto.createHash('sha256').update(code).digest('hex');

export const register = async (req: Request, res: Response) => {
  const { email, username, password, fullName } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: email.toLowerCase() }, { username }],
    },
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Email or username already exists',
      },
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      username,
      passwordHash,
      fullName,
      role: 'USER',
    },
  });

  const { accessToken, refreshToken } = generateTokens(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const { passwordHash: _, ...safeUser } = user;

  res.status(201).json({
    success: true,
    data: { user: safeUser, accessToken, refreshToken },
    message: 'Registration successful',
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
  });

  if (
    !user ||
    !user.passwordHash ||
    !(await bcrypt.compare(password, user.passwordHash))
  ) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    });
  }

  const { accessToken, refreshToken } = generateTokens(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const { passwordHash: _, ...safeUser } = user;

  res.status(200).json({
    success: true,
    data: { user: safeUser, accessToken, refreshToken },
    message: 'Login successful',
  });
};

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const p = ticket.getPayload();
    if (!p?.email) throw new Error('No email');

    const email = p.email.toLowerCase();
    let user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          fullName: p.name ?? 'User',
          username: email.split('@')[0] + Math.floor(Math.random() * 10000),
          // copy any other required fields from your register function
        },
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      success: true,
      data: { user: safeUser, accessToken, refreshToken },
      message: 'Login successful',
    });
  } catch {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_GOOGLE_TOKEN', message: 'Google sign-in failed' },
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: { message: 'Refresh token is required' },
    });
  }

  const tokenRecord = await prisma.refreshToken.findFirst({
    where: { token: refreshToken, revokedAt: null },
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired refresh token' },
    });
  }

  try {
    const decoded: any = jwt.verify(refreshToken, config.jwtRefreshSecret);
    const tokens = generateTokens(decoded.userId);

    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: decoded.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, error: { message: 'Invalid refresh token' } });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });
  }
  res.status(200).json({ success: true, message: 'Logout successful' });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findFirst({
    where: { email: String(email).toLowerCase() },
  });

  if (user) {
    const code = crypto.randomInt(100000, 1000000).toString();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashCode(code),
        resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    try {
      await sendResetCode(user.email, code);
    } catch (e) {
      console.error('Failed to send reset email', e);
    }
  }

  res.status(200).json({
    success: true,
    message: 'If the email exists, a reset code has been sent.',
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword || String(newPassword).length < 8) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Email, code and a password of 8+ characters are required',
      },
    });
  }

  const user = await prisma.user.findFirst({
    where: {
      email: String(email).toLowerCase(),
      resetPasswordToken: hashCode(String(code)),
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid or expired reset code' },
    });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });
  await prisma.refreshToken.updateMany({
    where: { userId: user.id },
    data: { revokedAt: new Date() },
  });

  res
    .status(200)
    .json({ success: true, message: 'Password reset successfully' });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      email: String(email).toLowerCase(),
      emailVerificationToken: hashCode(String(code)),
      emailVerificationExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid or expired verification code' },
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });

  res
    .status(200)
    .json({ success: true, message: 'Email verified successfully' });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, error: { message: 'Unauthorized' } });
  }
  const { passwordHash: _, ...safeUser } = req.user;
  res.status(200).json({ success: true, data: safeUser });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    return res
      .status(401)
      .json({ success: false, error: { message: 'Unauthorized' } });
  }

  const { currentPassword, newPassword } = req.body;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (
    !dbUser ||
    !dbUser.passwordHash ||
    !(await bcrypt.compare(currentPassword, dbUser.passwordHash))
  ) {
    return res.status(400).json({
      success: false,
      error: { message: 'Current password is incorrect' },
    });
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  res
    .status(200)
    .json({ success: true, message: 'Password updated successfully' });
};
