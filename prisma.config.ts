// @ts-ignore
import dotenv from 'dotenv';
dotenv.config();

export default {
  earlyAccess: true,
  schema: {
    kind: 'single',
    filePath: './prisma/schema.prisma',
  },
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/vyra_db?schema=public',
  },
};
