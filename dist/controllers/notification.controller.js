"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllRead = exports.markRead = exports.getUnreadNotifications = exports.getNotifications = void 0;
const prisma_1 = require("../config/prisma");
const getNotifications = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const notifications = await prisma_1.prisma.notification.findMany({
        where: { userId: req.user.id },
        include: {
            actor: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: notifications });
};
exports.getNotifications = getNotifications;
const getUnreadNotifications = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const unread = await prisma_1.prisma.notification.findMany({
        where: { userId: req.user.id, isRead: false },
        include: {
            actor: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, count: unread.length, data: unread });
};
exports.getUnreadNotifications = getUnreadNotifications;
const markRead = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const id = req.params.id;
    const notification = await prisma_1.prisma.notification.updateMany({
        where: { id, userId: req.user.id },
        data: { isRead: true, readAt: new Date() }
    });
    if (notification.count === 0)
        return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
    res.status(200).json({ success: true, message: 'Notification marked as read' });
};
exports.markRead = markRead;
const markAllRead = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    await prisma_1.prisma.notification.updateMany({
        where: { userId: req.user.id, isRead: false },
        data: { isRead: true, readAt: new Date() }
    });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
};
exports.markAllRead = markAllRead;
const deleteNotification = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const id = req.params.id;
    const result = await prisma_1.prisma.notification.deleteMany({
        where: { id, userId: req.user.id }
    });
    if (result.count === 0)
        return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
    res.status(200).json({ success: true, message: 'Notification deleted' });
};
exports.deleteNotification = deleteNotification;
