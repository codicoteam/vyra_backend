"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDashboardStats = getAdminDashboardStats;
const user_model_1 = require("../models/user.model");
const story_model_1 = require("../models/story.model");
const report_model_1 = require("../models/report.model");
async function getAdminDashboardStats() {
    const [totalUsers, newUsersToday, newUsersThisWeek, totalStories, publishedToday, pendingReview, totalAnonymous, unresolvedReports,] = await Promise.all([
        user_model_1.User.countDocuments({ deletedAt: null }),
        user_model_1.User.countDocuments({
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            deletedAt: null,
        }),
        user_model_1.User.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            deletedAt: null,
        }),
        story_model_1.Story.countDocuments({ deletedAt: null }),
        story_model_1.Story.countDocuments({
            publishedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            status: 'published',
            deletedAt: null,
        }),
        story_model_1.Story.countDocuments({
            moderationStatus: 'pending',
            deletedAt: null,
        }),
        story_model_1.Story.countDocuments({
            isAnonymous: true,
            status: 'published',
            deletedAt: null,
        }),
        report_model_1.Report.countDocuments({ status: 'pending' }),
    ]);
    return {
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        totalStories,
        publishedToday,
        pendingReview,
        totalAnonymousStories: totalAnonymous,
        unresolvedReports,
    };
}
