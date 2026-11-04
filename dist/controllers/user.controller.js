"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.updateAvatar = exports.updateProfile = exports.getUserByUsername = exports.getUserById = exports.getUsers = void 0;
const prisma_1 = require("../config/prisma");
const getUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const users = await prisma_1.prisma.user.findMany({
        where: { deletedAt: null },
        select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            bio: true,
            avatarUrl: true,
            bannerUrl: true,
            website: true,
            location: true,
            twitterHandle: true,
            role: true,
            isVerified: true,
            followersCount: true,
            followingCount: true,
            storiesCount: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
    });
    const total = await prisma_1.prisma.user.count({ where: { deletedAt: null } });
    res.status(200).json({
        success: true,
        data: users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
};
exports.getUsers = getUsers;
const getUserById = async (req, res) => {
    const id = req.params.id;
    const user = await prisma_1.prisma.user.findFirst({
        where: { id, deletedAt: null },
        select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            bio: true,
            avatarUrl: true,
            bannerUrl: true,
            website: true,
            location: true,
            twitterHandle: true,
            role: true,
            isVerified: true,
            followersCount: true,
            followingCount: true,
            storiesCount: true,
            createdAt: true
        }
    });
    if (!user) {
        return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    res.status(200).json({ success: true, data: user });
};
exports.getUserById = getUserById;
const getUserByUsername = async (req, res) => {
    const username = req.params.username;
    const user = await prisma_1.prisma.user.findFirst({
        where: { username, deletedAt: null },
        select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            bio: true,
            avatarUrl: true,
            bannerUrl: true,
            website: true,
            location: true,
            twitterHandle: true,
            role: true,
            isVerified: true,
            followersCount: true,
            followingCount: true,
            storiesCount: true,
            createdAt: true
        }
    });
    if (!user) {
        return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    res.status(200).json({ success: true, data: user });
};
exports.getUserByUsername = getUserByUsername;
const updateProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const { fullName, bio, website, location, twitterHandle } = req.body;
    const user = await prisma_1.prisma.user.update({
        where: { id: req.user.id },
        data: { fullName, bio, website, location, twitterHandle }
    });
    const { passwordHash: _, ...safeUser } = user;
    res.status(200).json({ success: true, data: safeUser, message: 'Profile updated successfully' });
};
exports.updateProfile = updateProfile;
const updateAvatar = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const { avatarUrl } = req.body;
    const user = await prisma_1.prisma.user.update({
        where: { id: req.user.id },
        data: { avatarUrl }
    });
    const { passwordHash: _, ...safeUser } = user;
    res.status(200).json({ success: true, data: safeUser, message: 'Avatar updated successfully' });
};
exports.updateAvatar = updateAvatar;
const deleteAccount = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    await prisma_1.prisma.user.update({
        where: { id: req.user.id },
        data: { deletedAt: new Date() }
    });
    res.status(200).json({ success: true, message: 'Account deleted successfully' });
};
exports.deleteAccount = deleteAccount;
