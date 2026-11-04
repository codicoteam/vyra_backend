"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSavedSearch = exports.createSavedSearch = exports.getSavedSearches = void 0;
const prisma_1 = require("../config/prisma");
const getSavedSearches = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const searches = await prisma_1.prisma.savedSearch.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: searches });
};
exports.getSavedSearches = getSavedSearches;
const createSavedSearch = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const { query, filters } = req.body;
    const savedSearch = await prisma_1.prisma.savedSearch.create({
        data: {
            userId: req.user.id,
            query,
            filters,
        }
    });
    res.status(201).json({ success: true, data: savedSearch, message: 'Search query saved' });
};
exports.createSavedSearch = createSavedSearch;
const deleteSavedSearch = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const id = req.params.id;
    const result = await prisma_1.prisma.savedSearch.deleteMany({
        where: { id, userId: req.user.id }
    });
    if (result.count === 0)
        return res.status(404).json({ success: false, error: { message: 'Saved search not found' } });
    res.status(200).json({ success: true, message: 'Saved search deleted' });
};
exports.deleteSavedSearch = deleteSavedSearch;
