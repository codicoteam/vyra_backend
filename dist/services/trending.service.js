"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTrendingStories = calculateTrendingStories;
const story_model_1 = require("../models/story.model");
async function calculateTrendingStories(limit = 20) {
    const hoursAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    return story_model_1.Story.aggregate([
        {
            $match: {
                status: 'published',
                publishedAt: { $gte: hoursAgo },
                moderationStatus: 'approved',
                deletedAt: null,
            },
        },
        {
            $addFields: {
                hoursSincePublished: {
                    $divide: [
                        { $subtract: [new Date(), '$publishedAt'] },
                        1000 * 60 * 60, // Convert ms to hours
                    ],
                },
            },
        },
        {
            $addFields: {
                trendingScore: {
                    $divide: [
                        {
                            $add: [
                                { $multiply: ['$viewCount', 0.5] },
                                { $multiply: ['$likeCount', 2] },
                                { $multiply: ['$bookmarkCount', 3] },
                                { $multiply: ['$readCount', 1.5] },
                            ],
                        },
                        {
                            $pow: [{ $add: ['$hoursSincePublished', 2] }, 1.5],
                        },
                    ],
                },
            },
        },
        { $sort: { trendingScore: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                pipeline: [
                    { $project: { username: 1, fullName: 1, avatarUrl: 1 } },
                ],
                as: 'author',
            },
        },
        { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category',
            },
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    ]);
}
