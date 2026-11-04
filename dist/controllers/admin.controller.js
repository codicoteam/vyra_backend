"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.getAdminStatistics = exports.getAdminReports = exports.deletePostByAdmin = exports.getAdminPosts = exports.deleteUserByAdmin = exports.activateUser = exports.suspendUser = exports.updateUserRole = exports.getAdminUsers = exports.getAdminDashboard = void 0;
const prisma_1 = require("../config/prisma");
const getAdminDashboard = async (req, res) => {
    const [totalUsers, totalPosts, totalReports, pendingReports, totalViews] = await Promise.all([
        prisma_1.prisma.user.count({ where: { deletedAt: null } }),
        prisma_1.prisma.post.count({ where: { deletedAt: null } }),
        prisma_1.prisma.report.count(),
        prisma_1.prisma.report.count({ where: { status: 'PENDING' } }),
        prisma_1.prisma.post.aggregate({ _sum: { viewCount: true } })
    ]);
    res.status(200).json({
        success: true,
        data: {
            totalUsers,
            totalPosts,
            totalReports,
            pendingReports,
            totalViews: totalViews._sum.viewCount || 0,
            systemHealth: 'Optimal',
        }
    });
};
exports.getAdminDashboard = getAdminDashboard;
const getAdminUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const users = await prisma_1.prisma.user.findMany({
        select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            role: true,
            isVerified: true,
            isBanned: true,
            banReason: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
    });
    const total = await prisma_1.prisma.user.count();
    res.status(200).json({
        success: true,
        data: users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
};
exports.getAdminUsers = getAdminUsers;
const updateUserRole = async (req, res) => {
    const id = req.params.id;
    const { role } = req.body;
    if (role === 'ADMIN') {
        return res.status(403).json({
            success: false,
            error: { code: 'CANNOT_CREATE_ADMIN', message: 'Creating additional Admin accounts is disabled. Only initial setup creates the Admin.' }
        });
    }
    if (!['USER', 'AUTHOR', 'EDITOR'].includes(role)) {
        return res.status(400).json({ success: false, error: { message: 'Invalid role specified' } });
    }
    const user = await prisma_1.prisma.user.update({
        where: { id },
        data: { role: role }
    });
    const { passwordHash: _, ...safeUser } = user;
    res.status(200).json({ success: true, data: safeUser, message: `User role updated to ${role}` });
};
exports.updateUserRole = updateUserRole;
const suspendUser = async (req, res) => {
    const id = req.params.id;
    const { reason } = req.body;
    const user = await prisma_1.prisma.user.update({
        where: { id },
        data: { isBanned: true, banReason: reason || 'Suspended by Administrator', bannedAt: new Date() }
    });
    const { passwordHash: _, ...safeUser } = user;
    res.status(200).json({ success: true, data: safeUser, message: 'User suspended successfully' });
};
exports.suspendUser = suspendUser;
const activateUser = async (req, res) => {
    const id = req.params.id;
    const user = await prisma_1.prisma.user.update({
        where: { id },
        data: { isBanned: false, banReason: null, bannedAt: null }
    });
    const { passwordHash: _, ...safeUser } = user;
    res.status(200).json({ success: true, data: safeUser, message: 'User activated successfully' });
};
exports.activateUser = activateUser;
const deleteUserByAdmin = async (req, res) => {
    const id = req.params.id;
    await prisma_1.prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() }
    });
    res.status(200).json({ success: true, message: 'User account deleted by Admin' });
};
exports.deleteUserByAdmin = deleteUserByAdmin;
const getAdminPosts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const posts = await prisma_1.prisma.post.findMany({
        include: {
            author: { select: { id: true, username: true, fullName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
    });
    const total = await prisma_1.prisma.post.count();
    res.status(200).json({
        success: true,
        data: posts,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
};
exports.getAdminPosts = getAdminPosts;
const deletePostByAdmin = async (req, res) => {
    const id = req.params.id;
    await prisma_1.prisma.post.update({
        where: { id },
        data: { deletedAt: new Date() }
    });
    res.status(200).json({ success: true, message: 'Post deleted by Admin' });
};
exports.deletePostByAdmin = deletePostByAdmin;
const getAdminReports = async (req, res) => {
    const reports = await prisma_1.prisma.report.findMany({
        include: {
            reporter: { select: { id: true, username: true, fullName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: reports });
};
exports.getAdminReports = getAdminReports;
const getAdminStatistics = async (req, res) => {
    const [usersCount, postsCount, reportsCount, publishedPostsCount] = await Promise.all([
        prisma_1.prisma.user.count(),
        prisma_1.prisma.post.count(),
        prisma_1.prisma.report.count(),
        prisma_1.prisma.post.count({ where: { status: 'PUBLISHED' } }),
    ]);
    res.status(200).json({
        success: true,
        data: {
            usersCount,
            postsCount,
            reportsCount,
            publishedPostsCount,
            serverUptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
        }
    });
};
exports.getAdminStatistics = getAdminStatistics;
exports.getStats = exports.getAdminStatistics;
