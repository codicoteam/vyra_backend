"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookmarks = exports.removeBookmark = exports.addBookmark = void 0;
const prisma_1 = require("../config/prisma");
const addBookmark = async (req, res) => {
    const postId = req.params.postId;
    const user = req.user;
    if (!user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const existing = await prisma_1.prisma.bookmark.findUnique({
        where: { userId_postId: { userId: user.id, postId } }
    });
    if (!existing) {
        await prisma_1.prisma.bookmark.create({
            data: { userId: user.id, postId }
        });
        await prisma_1.prisma.post.update({
            where: { id: postId },
            data: { bookmarkCount: { increment: 1 } }
        });
    }
    res.status(200).json({ success: true, message: 'Bookmarked post' });
};
exports.addBookmark = addBookmark;
const removeBookmark = async (req, res) => {
    const postId = req.params.postId;
    const user = req.user;
    if (!user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const existing = await prisma_1.prisma.bookmark.findUnique({
        where: { userId_postId: { userId: user.id, postId } }
    });
    if (existing) {
        await prisma_1.prisma.bookmark.delete({
            where: { id: existing.id }
        });
        await prisma_1.prisma.post.update({
            where: { id: postId },
            data: { bookmarkCount: { decrement: -1 } }
        });
    }
    res.status(200).json({ success: true, message: 'Removed bookmark' });
};
exports.removeBookmark = removeBookmark;
const getBookmarks = async (req, res) => {
    const user = req.user;
    if (!user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const bookmarks = await prisma_1.prisma.bookmark.findMany({
        where: { userId: user.id },
        include: {
            post: {
                include: {
                    author: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
                    category: { select: { id: true, name: true, color: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    const posts = bookmarks.map((b) => b.post).filter(Boolean);
    res.status(200).json({ success: true, data: posts });
};
exports.getBookmarks = getBookmarks;
