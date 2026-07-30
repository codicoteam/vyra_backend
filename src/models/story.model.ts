import { prisma } from '../config/prisma';

export const Story = prisma.post;
export const Post = prisma.post;
export type IStory = any;
export type IPost = any;
