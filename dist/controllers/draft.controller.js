"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDraft = exports.updateDraft = exports.getDraftById = exports.getDrafts = exports.createDraft = void 0;
const prisma_1 = require("../config/prisma");
const createDraft = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const draft = await prisma_1.prisma.draft.create({
        data: {
            ...req.body,
            userId: req.user.id,
        }
    });
    res.status(201).json({ success: true, data: draft, message: 'Draft created' });
};
exports.createDraft = createDraft;
const getDrafts = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const drafts = await prisma_1.prisma.draft.findMany({
        where: { userId: req.user.id },
        orderBy: { updatedAt: 'desc' }
    });
    res.status(200).json({ success: true, data: drafts });
};
exports.getDrafts = getDrafts;
const getDraftById = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const id = req.params.id;
    const draft = await prisma_1.prisma.draft.findFirst({
        where: { id, userId: req.user.id }
    });
    if (!draft)
        return res.status(404).json({ success: false, error: { message: 'Draft not found' } });
    res.status(200).json({ success: true, data: draft });
};
exports.getDraftById = getDraftById;
const updateDraft = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const id = req.params.id;
    const draft = await prisma_1.prisma.draft.updateMany({
        where: { id, userId: req.user.id },
        data: req.body
    });
    if (draft.count === 0)
        return res.status(404).json({ success: false, error: { message: 'Draft not found' } });
    res.status(200).json({ success: true, message: 'Draft updated' });
};
exports.updateDraft = updateDraft;
const deleteDraft = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const id = req.params.id;
    const result = await prisma_1.prisma.draft.deleteMany({
        where: { id, userId: req.user.id }
    });
    if (result.count === 0)
        return res.status(404).json({ success: false, error: { message: 'Draft not found' } });
    res.status(200).json({ success: true, message: 'Draft deleted' });
};
exports.deleteDraft = deleteDraft;
