"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatus = exports.getVersion = exports.getDatabaseHealth = exports.getHealth = void 0;
const prisma_1 = require("../config/prisma");
const getHealth = (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'VYRA API is healthy (PostgreSQL + Prisma)',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
};
exports.getHealth = getHealth;
const getDatabaseHealth = async (req, res) => {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        res.status(200).json({
            database: 'connected',
        });
    }
    catch (error) {
        res.status(500).json({
            database: 'disconnected',
            error: 'Unable to reach PostgreSQL database',
        });
    }
};
exports.getDatabaseHealth = getDatabaseHealth;
const getVersion = (req, res) => {
    res.status(200).json({
        name: 'VYRA Digital Publishing Platform API',
        version: '1.0.0',
        database: 'PostgreSQL (Prisma ORM)',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
    });
};
exports.getVersion = getVersion;
const getStatus = async (req, res) => {
    let dbStatus = 'operational';
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
    }
    catch (e) {
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
exports.getStatus = getStatus;
