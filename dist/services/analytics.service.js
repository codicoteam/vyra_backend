"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDashboardStats = getUserDashboardStats;
exports.getStoryGrowthOverTime = getStoryGrowthOverTime;
exports.getCategoryDistribution = getCategoryDistribution;
const mongoose_1 = __importDefault(require("mongoose"));
const story_model_1 = require("../models/story.model");
async function getUserDashboardStats(userId) {
    return story_model_1.Story.aggregate([
        {
            $match: {
                userId: new mongoose_1.default.Types.ObjectId(userId),
                deletedAt: null,
            },
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalViews: { $sum: '$viewCount' },
                totalLikes: { $sum: '$likeCount' },
                totalBookmarks: { $sum: '$bookmarkCount' },
                totalReads: { $sum: '$readCount' },
            },
        },
    ]);
}
async function getStoryGrowthOverTime(userId, months = 12) {
    const sinceDate = new Date();
    sinceDate.setMonth(sinceDate.getMonth() - months);
    return story_model_1.Story.aggregate([
        {
            $match: {
                userId: new mongoose_1.default.Types.ObjectId(userId),
                publishedAt: { $gte: sinceDate },
                status: 'published',
                deletedAt: null,
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$publishedAt' },
                    month: { $month: '$publishedAt' },
                },
                count: { $sum: 1 },
                totalViews: { $sum: '$viewCount' },
                totalLikes: { $sum: '$likeCount' },
            },
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1 },
        },
    ]);
}
async function getCategoryDistribution() {
    return story_model_1.Story.aggregate([
        {
            $match: {
                status: 'published',
                deletedAt: null,
            },
        },
        {
            $group: {
                _id: '$categoryId',
                count: { $sum: 1 },
            },
        },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'category',
            },
        },
        { $unwind: '$category' },
        {
            $project: {
                _id: 0,
                category: '$category.name',
                slug: '$category.slug',
                color: '$category.color',
                count: 1,
            },
        },
        { $sort: { count: -1 } },
    ]);
}
