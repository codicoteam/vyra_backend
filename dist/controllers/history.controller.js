"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHistoryItem = exports.getHistory = exports.addHistory = void 0;
const prisma_1 = require("../config/prisma");
const addHistory = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const { postId } = req.body;
    const history = await prisma_1.prisma.readingHistory.upsert({
        where: { userId_postId: { userId: req.user.id, postId } },
        update: { readAt: new Date() },
        create: { userId: req.user.id, postId, readAt: new Date() }
    });
    res.status(200).json({ success: true, data: history, message: 'Reading history recorded' });
};
exports.addHistory = addHistory;
const getHistory = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const history = await prisma_1.prisma.readingHistory.findMany({
        where: { userId: req.user.id },
        include: {
            post: {
                include: {
                    author: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
                    category: { select: { id: true, name: true, color: true } }
                }
            }
        },
        orderBy: { readAt: 'desc' }
    });
    res.status(200).json({ success: true, data: history });
};
exports.getHistory = getHistory;
const deleteHistoryItem = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const id = req.params.id;
    const result = await prisma_1.prisma.readingHistory.deleteMany({
        where: { id, userId: req.user.id }
    });
    if (result.count === 0)
        return res.status(404).json({ success: false, error: { message: 'History item not found' } });
    res.status(200).json({ success: true, message: 'History item deleted' });
};
exports.deleteHistoryItem = deleteHistoryItem;
