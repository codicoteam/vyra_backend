"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchTags = exports.searchCategories = exports.searchUsers = exports.searchPosts = exports.unifiedSearch = void 0;
const prisma_1 = require("../config/prisma");
const unifiedSearch = async (req, res) => {
    const query = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    if (!query.trim()) {
        return res.status(200).json({
            success: true,
            data: { posts: [], users: [], categories: [], tags: [] }
        });
    }
    const [posts, users, categories, tags] = await Promise.all([
        prisma_1.prisma.post.findMany({
            where: {
                status: 'PUBLISHED',
                deletedAt: null,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { excerpt: { contains: query, mode: 'insensitive' } }
                ]
            },
            include: {
                author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
                category: { select: { id: true, name: true, slug: true, color: true } }
            },
            skip,
            take: limit
        }),
        prisma_1.prisma.user.findMany({
            where: {
                deletedAt: null,
                OR: [
                    { username: { contains: query, mode: 'insensitive' } },
                    { fullName: { contains: query, mode: 'insensitive' } },
                    { bio: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true },
            skip,
            take: limit
        }),
        prisma_1.prisma.category.findMany({
            where: {
                isActive: true,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: limit
        }),
        prisma_1.prisma.tag.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: limit
        })
    ]);
    res.status(200).json({
        success: true,
        data: { posts, users, categories, tags },
        query,
        pagination: { page, limit }
    });
};
exports.unifiedSearch = unifiedSearch;
const searchPosts = async (req, res) => {
    const query = req.query.q || '';
    const category = req.query.category;
    const sortBy = req.query.sortBy || 'latest';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const whereClause = { status: 'PUBLISHED', deletedAt: null };
    if (query.trim()) {
        whereClause.OR = [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } }
        ];
    }
    if (category) {
        whereClause.categoryId = category;
    }
    let orderBy = [{ publishedAt: 'desc' }];
    if (sortBy === 'popular' || sortBy === 'likes') {
        orderBy = [{ likeCount: 'desc' }, { publishedAt: 'desc' }];
    }
    else if (sortBy === 'views') {
        orderBy = [{ viewCount: 'desc' }, { publishedAt: 'desc' }];
    }
    const posts = await prisma_1.prisma.post.findMany({
        where: whereClause,
        include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            category: { select: { id: true, name: true, slug: true, color: true } }
        },
        orderBy,
        skip,
        take: limit
    });
    const total = await prisma_1.prisma.post.count({ where: whereClause });
    res.status(200).json({
        success: true,
        data: posts,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
};
exports.searchPosts = searchPosts;
const searchUsers = async (req, res) => {
    const query = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const whereClause = {
        deletedAt: null,
        OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { fullName: { contains: query, mode: 'insensitive' } },
            { bio: { contains: query, mode: 'insensitive' } }
        ]
    };
    const users = await prisma_1.prisma.user.findMany({
        where: whereClause,
        select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true },
        skip,
        take: limit
    });
    const total = await prisma_1.prisma.user.count({ where: whereClause });
    res.status(200).json({
        success: true,
        data: users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
};
exports.searchUsers = searchUsers;
const searchCategories = async (req, res) => {
    const query = req.query.q || '';
    const categories = await prisma_1.prisma.category.findMany({
        where: {
            isActive: true,
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ]
        }
    });
    res.status(200).json({ success: true, data: categories });
};
exports.searchCategories = searchCategories;
const searchTags = async (req, res) => {
    const query = req.query.q || '';
    const tags = await prisma_1.prisma.tag.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ]
        }
    });
    res.status(200).json({ success: true, data: tags });
};
exports.searchTags = searchTags;
