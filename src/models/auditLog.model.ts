import { prisma } from '../config/prisma';
export const AuditLog = prisma.auditLog;
export type IAuditLog = any;
