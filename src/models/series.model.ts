import { prisma } from '../config/prisma';
export const Series = prisma.post; // mapped to Post or series relation
export type ISeries = any;
