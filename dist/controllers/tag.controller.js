"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTag = exports.updateTag = exports.createTag = exports.getTags = void 0;
const prisma_1 = require("../config/prisma");
const getTags = async (req, res) => {
    const { search } = req.query;
    const whereClause = {};
    if (search) {
        whereClause.name = { contains: search, mode: 'insensitive' };
    }
    const tags = await prisma_1.prisma.tag.findMany({
        where: whereClause,
        orderBy: [{ postCount: 'desc' }, { name: 'asc' }]
    });
    res.status(200).json({ success: true, data: tags });
};
exports.getTags = getTags;
const createTag = async (req, res) => {
    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const tag = await prisma_1.prisma.tag.create({
        data: { name, slug, description }
    });
    res.status(201).json({ success: true, data: tag, message: 'Tag created' });
};
exports.createTag = createTag;
const updateTag = async (req, res) => {
    const id = req.params.id;
    const tag = await prisma_1.prisma.tag.update({
        where: { id },
        data: req.body
    });
    res.status(200).json({ success: true, data: tag, message: 'Tag updated' });
};
exports.updateTag = updateTag;
const deleteTag = async (req, res) => {
    const id = req.params.id;
    await prisma_1.prisma.tag.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Tag deleted' });
};
exports.deleteTag = deleteTag;
