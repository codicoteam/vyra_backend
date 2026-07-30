"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = void 0;
const category_model_1 = require("../models/category.model");
const mapColorToClass = (color) => {
    switch (color.toLowerCase()) {
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
        const categories = await category_model_1.Category.find({ isActive: true }).sort({ sortOrder: 1 });
        const formatted = categories.map(c => ({
            id: c._id.toString(),
            name: c.name,
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
