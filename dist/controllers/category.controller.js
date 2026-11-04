"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const prisma_1 = require("../config/prisma");
const mapColorToClass = (color) => {
    switch (color ? color.toLowerCase() : '') {
        case '#a855f7':
            return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
        case '#f43f5e':
            return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300';
        case '#10b981':
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
        case '#f59e0b':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
        case '#6366f1':
            return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300';
        default:
            return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    }
};
const getCategories = async (req, res) => {
    try {
        const categories = await prisma_1.prisma.category.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });
        const formatted = categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            count: c.storiesCount || 0,
            iconName: c.icon || 'Cpu',
            colorClass: mapColorToClass(c.color || '#a855f7')
        }));
        res.status(200).json({ success: true, data: formatted });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const { name, description, icon, color, sortOrder } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const category = await prisma_1.prisma.category.create({
            data: { name, slug, description, icon, color, sortOrder: sortOrder || 0 }
        });
        res.status(201).json({ success: true, data: category, message: 'Category created successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await prisma_1.prisma.category.update({
            where: { id },
            data: req.body
        });
        res.status(200).json({ success: true, data: category, message: 'Category updated successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.prisma.category.update({
            where: { id },
            data: { isActive: false }
        });
        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.deleteCategory = deleteCategory;
