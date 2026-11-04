"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectAnonymous = exports.approveAnonymous = exports.getPendingAnonymous = exports.publishAnonymous = void 0;
const prisma_1 = require("../config/prisma");
const publishAnonymous = async (req, res) => {
    const { title, excerpt, content, coverImage, category } = req.body;
    const slug = (title || 'anonymous-post')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    let anonUser = await prisma_1.prisma.user.findFirst({ where: { username: 'anonymous' } });
    if (!anonUser) {
        anonUser = await prisma_1.prisma.user.create({
            data: {
                email: 'anonymous@vyra.com',
                username: 'anonymous',
                fullName: 'Anonymous Author',
                isVerified: true
            }
        });
    }
    const post = await prisma_1.prisma.post.create({
        data: {
            userId: anonUser.id,
            title: title || 'Anonymous Story',
            slug,
            excerpt,
            content,
            coverImageUrl: coverImage,
            categoryId: category || null,
            isAnonymous: true,
            status: 'DRAFT',
            moderationStatus: 'PENDING',
        }
    });
    res.status(201).json({ success: true, data: post, message: 'Anonymous post submitted for approval' });
};
exports.publishAnonymous = publishAnonymous;
const getPendingAnonymous = async (req, res) => {
    const posts = await prisma_1.prisma.post.findMany({
        where: { isAnonymous: true, moderationStatus: 'PENDING', deletedAt: null },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: posts });
};
exports.getPendingAnonymous = getPendingAnonymous;
const approveAnonymous = async (req, res) => {
    const id = req.params.id;
    const post = await prisma_1.prisma.post.findUnique({ where: { id } });
    if (!post)
        return res.status(404).json({ success: false, error: { message: 'Post not found' } });
    const updated = await prisma_1.prisma.post.update({
        where: { id },
        data: {
            moderationStatus: 'APPROVED',
            status: 'PUBLISHED',
            publishedAt: new Date()
        }
    });
    res.status(200).json({ success: true, data: updated, message: 'Anonymous post approved and published' });
};
exports.approveAnonymous = approveAnonymous;
const rejectAnonymous = async (req, res) => {
    const id = req.params.id;
    const post = await prisma_1.prisma.post.findUnique({ where: { id } });
    if (!post)
        return res.status(404).json({ success: false, error: { message: 'Post not found' } });
    const updated = await prisma_1.prisma.post.update({
        where: { id },
        data: {
            moderationStatus: 'REJECTED',
            status: 'ARCHIVED'
        }
    });
    res.status(200).json({ success: true, data: updated, message: 'Anonymous post rejected' });
};
exports.rejectAnonymous = rejectAnonymous;
