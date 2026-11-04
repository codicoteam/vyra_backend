"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featurePost = exports.duplicatePost = exports.archivePost = exports.publishPost = exports.deletePost = exports.updatePost = exports.getPostBySlug = exports.getPostById = exports.getPosts = exports.createPost = void 0;
const prisma_1 = require("../config/prisma");
const createPost = async (req, res) => {
    const { title, excerpt, content, coverImage, category, isAnonymous, isResearch, isCampaign, status } = req.body;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    try {
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
        const postStatus = status === 'published' || status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
        const post = await prisma_1.prisma.post.create({
            data: {
                userId: user.id,
                title,
                slug,
                excerpt,
                content,
                coverImageUrl: coverImage,
                categoryId: category || null,
                isAnonymous: !!isAnonymous,
                isResearch: !!isResearch,
                isCampaign: !!isCampaign,
                status: postStatus,
                publishedAt: postStatus === 'DRAFT' ? null : new Date(),
            }
        });
        res.status(201).json({ success: true, data: post, message: 'Post created successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.createPost = createPost;
const getPosts = async (req, res) => {
    const { category, search, status, page, limit } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;
    const whereClause = { deletedAt: null };
    if (status) {
        whereClause.status = status.toUpperCase();
    }
    else {
        whereClause.status = 'PUBLISHED';
    }
    if (category) {
        whereClause.categoryId = category;
    }
    if (search) {
        whereClause.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { excerpt: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
        ];
    }
    try {
        const posts = await prisma_1.prisma.post.findMany({
            where: whereClause,
            include: {
                author: {
                    select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true, followersCount: true, followingCount: true, storiesCount: true }
                },
                category: {
                    select: { id: true, name: true, slug: true, color: true, icon: true }
                }
            },
            orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
            skip,
            take: limitNum
        });
        const total = await prisma_1.prisma.post.count({ where: whereClause });
        const formattedPosts = posts.map((post) => {
            const author = post.author;
            const cat = post.category;
            return {
                id: post.id,
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt || '',
                content: post.content,
                coverImage: post.coverImageUrl || '',
                category: cat ? cat.name : 'Uncategorized',
                categoryId: cat ? cat.id : null,
                tags: [],
                author: {
                    id: author ? author.id : '',
                    name: post.isAnonymous ? 'Anonymous Author' : (author ? author.fullName : 'Anonymous Author'),
                    avatar: post.isAnonymous ? '' : (author ? author.avatarUrl : ''),
                    bio: author ? author.bio || '' : '',
                    username: post.isAnonymous ? 'anonymous' : (author ? author.username : 'anonymous'),
                },
                isAnonymous: post.isAnonymous,
                readingTime: post.readingTime || 1,
                publishedDate: post.publishedAt ? post.publishedAt.toISOString() : post.createdAt.toISOString(),
                likes: post.likeCount || 0,
                bookmarks: post.bookmarkCount || 0,
                isResearch: post.isResearch,
                isCampaign: post.isCampaign,
                goalProgress: post.campaignProgress || 0,
                status: post.status,
                isFeatured: post.isFeatured,
            };
        });
        res.status(200).json({
            success: true,
            data: formattedPosts,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.getPosts = getPosts;
const getPostById = async (req, res) => {
    const id = req.params.id;
    try {
        const post = await prisma_1.prisma.post.findFirst({
            where: { id, deletedAt: null },
            include: {
                author: { select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true } },
                category: { select: { id: true, name: true, slug: true, color: true, icon: true } }
            }
        });
        if (!post) {
            return res.status(404).json({ success: false, error: { message: 'Post not found' } });
        }
        res.status(200).json({ success: true, data: post });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.getPostById = getPostById;
const getPostBySlug = async (req, res) => {
    const slug = req.params.slug;
    try {
        const post = await prisma_1.prisma.post.findFirst({
            where: { slug, deletedAt: null },
            include: {
                author: { select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true } },
                category: { select: { id: true, name: true, slug: true, color: true, icon: true } }
            }
        });
        if (!post) {
            return res.status(404).json({ success: false, error: { message: 'Post not found' } });
        }
        await prisma_1.prisma.post.update({
            where: { id: post.id },
            data: { viewCount: { increment: 1 } }
        });
        res.status(200).json({ success: true, data: post });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.getPostBySlug = getPostBySlug;
const updatePost = async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    try {
        const post = await prisma_1.prisma.post.findFirst({ where: { id, deletedAt: null } });
        if (!post) {
            return res.status(404).json({ success: false, error: { message: 'Post not found' } });
        }
        if (post.userId !== user.id && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'EDITOR') {
            return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
        }
        const updated = await prisma_1.prisma.post.update({
            where: { id },
            data: req.body
        });
        res.status(200).json({ success: true, data: updated, message: 'Post updated successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    try {
        const post = await prisma_1.prisma.post.findFirst({ where: { id, deletedAt: null } });
        if (!post) {
            return res.status(404).json({ success: false, error: { message: 'Post not found' } });
        }
        if (post.userId !== user.id && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
        }
        await prisma_1.prisma.post.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        res.status(200).json({ success: true, message: 'Post deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.deletePost = deletePost;
const publishPost = async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    if (!user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    try {
        const post = await prisma_1.prisma.post.update({
            where: { id },
            data: { status: 'PUBLISHED', publishedAt: new Date() }
        });
        res.status(200).json({ success: true, data: post, message: 'Post published successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.publishPost = publishPost;
const archivePost = async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    if (!user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    try {
        const post = await prisma_1.prisma.post.update({
            where: { id },
            data: { status: 'ARCHIVED' }
        });
        res.status(200).json({ success: true, data: post, message: 'Post archived successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.archivePost = archivePost;
const duplicatePost = async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    if (!user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    try {
        const post = await prisma_1.prisma.post.findUnique({ where: { id } });
        if (!post)
            return res.status(404).json({ success: false, error: { message: 'Post not found' } });
        const newSlug = post.slug + '-copy-' + Date.now().toString(36);
        const duplicated = await prisma_1.prisma.post.create({
            data: {
                userId: user.id,
                title: `${post.title} (Copy)`,
                slug: newSlug,
                excerpt: post.excerpt,
                content: post.content,
                contentFormat: post.contentFormat,
                plainTextContent: post.plainTextContent,
                coverImageUrl: post.coverImageUrl,
                coverImageAlt: post.coverImageAlt,
                categoryId: post.categoryId,
                status: 'DRAFT',
                publishedAt: null,
                isAnonymous: post.isAnonymous,
                isResearch: post.isResearch,
                isCampaign: post.isCampaign,
            }
        });
        res.status(201).json({ success: true, data: duplicated, message: 'Post duplicated successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.duplicatePost = duplicatePost;
const featurePost = async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    if (!user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    try {
        const post = await prisma_1.prisma.post.findUnique({ where: { id } });
        if (!post)
            return res.status(404).json({ success: false, error: { message: 'Post not found' } });
        const updated = await prisma_1.prisma.post.update({
            where: { id },
            data: { isFeatured: !post.isFeatured }
        });
        res.status(200).json({ success: true, data: updated, message: `Post featured status set to ${updated.isFeatured}` });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.featurePost = featurePost;
