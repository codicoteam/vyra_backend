import { prisma } from '../config/prisma';
import { UserRole } from '../constants/roles';

export { UserRole };
export const User = prisma.user;
export type IUser = any;
