"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = global.prisma ||
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production') {
    global.prisma = exports.prisma;
}
const connectDatabase = async () => {
    try {
        await exports.prisma.$connect();
        console.log('Successfully connected to PostgreSQL via Prisma');
    }
    catch (error) {
        console.error('Error connecting to PostgreSQL database via Prisma:', error);
    }
};
exports.connectDatabase = connectDatabase;
exports.default = exports.prisma;
