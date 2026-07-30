import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getHealth = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'VYRA API is healthy (PostgreSQL + Prisma)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

export const getDatabaseHealth = async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      database: 'connected',
    });
  } catch (error) {
    res.status(500).json({
      database: 'disconnected',
      error: 'Unable to reach PostgreSQL database',
    });
  }
};

export const getVersion = (req: Request, res: Response) => {
  res.status(200).json({
    name: 'VYRA Digital Publishing Platform API',
    version: '1.0.0',
    database: 'PostgreSQL (Prisma ORM)',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
  });
};

export const getStatus = async (req: Request, res: Response) => {
  let dbStatus = 'operational';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    dbStatus = 'disconnected';
  }

  res.status(200).json({
    status: dbStatus === 'operational' ? 'operational' : 'degraded',
    database: dbStatus,
    orm: 'Prisma',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
};
