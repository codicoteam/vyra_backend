"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleComments = exports.reportComment = exports.deleteComment = exports.getComments = exports.createComment = void 0;
const prisma_1 = require("../config/prisma");
const createComment = async (req, res) => {
    const postId = req.params.id;
    const { content, parentId } = req.body;
    const user = req.user;
    if (!user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    if (!content || !content.trim()) {
        return res.status(400).json({ success: false, error: { message: 'Comment content is required' } });
    }
    const post = await prisma_1.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        return res.status(404).json({ success: false, error: { message: 'Post not found' } });
    }
    if (post.allowComments === false) {
        return res.status(403).json({ success: false, error: { message: 'Comments are disabled for this post.' } });
    }
    const comment = await prisma_1.prisma.comment.create({
        data: {
            postId,
            userId: user.id,
            content: content.trim(),
            parentId: parentId || null
        },
        include: {
            user: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
        }
    });
    await prisma_1.prisma.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } }
    });
    res.status(201).json({ success: true, data: comment, message: 'Comment added successfully' });
};
exports.createComment = createComment;
const getComments = async (req, res) => {
    const postId = req.params.id;
    const comments = await prisma_1.prisma.comment.findMany({
        where: { postId, deletedAt: null },
        include: {
            user: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            replies: {
                where: { deletedAt: null },
                include: {
                    user: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
                },
                orderBy: { createdAt: 'asc' }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    const rootComments = comments.filter(c => !c.parentId);
    res.status(200).json({ success: true, data: rootComments });
};
exports.getComments = getComments;
const deleteComment = async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    if (!user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const comment = await prisma_1.prisma.comment.findUnique({ where: { id }, include: { post: true } });
    if (!comment)
        return res.status(404).json({ success: false, error: { message: 'Comment not found' } });
    const isOwner = comment.userId === user.id;
    const isPostOwner = comment.post.userId === user.id;
    const isStaff = user.role === 'ADMIN' || user.role === 'EDITOR';
    if (!isOwner && !isPostOwner && !isStaff) {
        return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }
    await prisma_1.prisma.comment.update({
        where: { id },
        data: { deletedAt: new Date() }
    });
    await prisma_1.prisma.post.update({
        where: { id: comment.postId },
        data: { commentCount: { decrement: 1 } }
    });
    res.status(200).json({ success: true, message: 'Comment deleted' });
};
exports.deleteComment = deleteComment;
const reportComment = async (req, res) => {
    const id = req.params.id;
    const { reason, details } = req.body;
    const user = req.user;
    const comment = await prisma_1.prisma.comment.findUnique({ where: { id } });
    if (!comment)
        return res.status(404).json({ success: false, error: { message: 'Comment not found' } });
    await prisma_1.prisma.comment.update({
        where: { id },
        data: { isReported: true }
    });
    const report = await prisma_1.prisma.report.create({
        data: {
            reporterId: user ? user.id : null,
            targetType: 'comment',
            targetId: id,
            reason: reason || 'Inappropriate content',
            details: details || `Comment content: ${comment.content}`
        }
    });
    res.status(201).json({ success: true, data: report, message: 'Comment reported successfully' });
};
exports.reportComment = reportComment;
const toggleComments = async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    if (!user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const post = await prisma_1.prisma.post.findUnique({ where: { id } });
    if (!post)
        return res.status(404).json({ success: false, error: { message: 'Post not found' } });
    if (post.userId !== user.id && user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }
    const updated = await prisma_1.prisma.post.update({
        where: { id },
        data: { allowComments: !post.allowComments }
    });
    res.status(200).json({
        success: true,
        data: updated,
        message: `Comments ${updated.allowComments ? 'enabled' : 'disabled'} for this post.`
    });
};
exports.toggleComments = toggleComments;
