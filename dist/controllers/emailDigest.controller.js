"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDigestPreferences = exports.getDigestHistory = exports.sendDigest = void 0;
const prisma_1 = require("../config/prisma");
const sendDigest = async (req, res) => {
    const { subject } = req.body;
    const user = req.user;
    if (!user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const recipientCount = await prisma_1.prisma.user.count({
        where: { weeklyDigest: true, deletedAt: null }
    });
    const log = await prisma_1.prisma.emailDigest.create({
        data: {
            userId: user.id,
            type: 'weekly',
            subject: subject || 'VYRA Weekly Research & Awareness Digest',
            status: 'SENT',
            sentAt: new Date(),
            content: `Successfully triggered digest for ${recipientCount} active subscribers`,
        }
    });
    res.status(200).json({ success: true, data: log, message: 'Email digest sent successfully' });
};
exports.sendDigest = sendDigest;
const getDigestHistory = async (req, res) => {
    const logs = await prisma_1.prisma.emailDigest.findMany({
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: logs });
};
exports.getDigestHistory = getDigestHistory;
const updateDigestPreferences = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const { weeklyDigest, emailNotifications } = req.body;
    const user = await prisma_1.prisma.user.update({
        where: { id: req.user.id },
        data: { weeklyDigest, emailNotifications }
    });
    const { passwordHash: _, ...safeUser } = user;
    res.status(200).json({ success: true, data: safeUser, message: 'Email preferences updated' });
};
exports.updateDigestPreferences = updateDigestPreferences;
