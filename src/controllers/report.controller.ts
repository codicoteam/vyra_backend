import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const createReport = async (req: AuthRequest, res: Response) => {
  const { targetType, targetId, reason, details } = req.body;
  const reporterId = req.user ? req.user.id : null;

  const report = await prisma.report.create({
    data: {
      reporterId,
      targetType,
      targetId,
      reason,
      details,
    }
  });

  res.status(201).json({ success: true, data: report, message: 'Report submitted' });
};

export const getReports = async (req: AuthRequest, res: Response) => {
  const reports = await prisma.report.findMany({
    include: {
      reporter: { select: { id: true, username: true, fullName: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ success: true, data: reports });
};

export const getReportById = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      reporter: { select: { id: true, username: true, fullName: true, email: true } }
    }
  });

  if (!report) return res.status(404).json({ success: false, error: { message: 'Report not found' } });
  res.status(200).json({ success: true, data: report });
};

export const updateReport = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { status, actionTaken } = req.body;
  const report = await prisma.report.update({
    where: { id },
    data: {
      status,
      actionTaken,
      reviewedBy: req.user?.id,
      reviewedAt: new Date()
    }
  });

  res.status(200).json({ success: true, data: report, message: 'Report updated' });
};

export const deleteReport = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  await prisma.report.delete({ where: { id } });
  res.status(200).json({ success: true, message: 'Report deleted' });
};
