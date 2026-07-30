"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleBookmark = exports.toggleLike = exports.createStory = exports.getStories = void 0;
const story_model_1 = require("../models/story.model");
const like_model_1 = require("../models/like.model");
const bookmark_model_1 = require("../models/bookmark.model");
const mongoose_1 = __importDefault(require("mongoose"));
const getStories = async (req, res) => {
    const { category, search } = req.query;
    const filter = { status: 'published', deletedAt: null };
    if (category) {
        // If category is a slug, we might need to find the category first, but we can also match directly if categoryId is queryable
        if (mongoose_1.default.Types.ObjectId.isValid(category)) {
            filter.categoryId = category;
        }
    }
    if (search) {
        filter.$text = { $search: search };
    }
    try {
        const stories = await story_model_1.Story.find(filter)
            .populate('userId', 'username fullName avatarUrl bio followersCount followingCount storiesCount')
            .populate('categoryId', 'name slug color icon')
            .sort({ publishedAt: -1 });
        // Format output to match Frontend expectation
        const formattedStories = stories.map(story => {
            const author = story.userId;
            const cat = story.categoryId;
            return {
                id: story._id.toString(),
                title: story.title,
                excerpt: story.excerpt || '',
                content: story.content,
                coverImage: story.coverImageUrl || '',
                category: cat ? cat.name : 'Uncategorized',
                tags: story.tags || [],
                author: {
                    id: author ? author._id.toString() : '',
                    name: author ? author.fullName : 'Anonymous Author',
                    avatar: author ? author.avatarUrl : '',
                    bio: author ? author.bio || '' : '',
                    username: author ? author.username : 'anonymous',
                    followersCount: author ? author.followersCount || 0 : 0,
                    followingCount: author ? author.followingCount || 0 : 0,
                    storiesCount: author ? author.storiesCount || 0 : 0
                },
                isAnonymous: story.isAnonymous,
                readingTime: story.readingTime || 1,
                publishedDate: story.publishedAt ? story.publishedAt.toISOString() : story.createdAt.toISOString(),
                likes: story.likeCount || 0,
                bookmarks: story.bookmarkCount || 0,
                isResearch: story.isResearch,
                isCampaign: story.isCampaign,
                goalProgress: story.campaignProgress || 0
            };
        });
        res.status(200).json({ success: true, data: formattedStories });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.getStories = getStories;
const createStory = async (req, res) => {
    const { title, excerpt, content, coverImage, category, tags, isAnonymous, isResearch, isCampaign } = req.body;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    try {
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
        const story = new story_model_1.Story({
            userId: user._id,
            title,
            slug,
            excerpt,
            content,
            coverImageUrl: coverImage,
            categoryId: mongoose_1.default.Types.ObjectId.isValid(category) ? category : undefined,
            tags,
            isAnonymous,
            isResearch,
            isCampaign,
            status: 'published', // Publish immediately for simple demo connection
            publishedAt: new Date(),
        });
        await story.save();
        res.status(201).json({ success: true, data: story, message: 'Story published successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.createStory = createStory;
const toggleLike = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    try {
        const existingLike = await like_model_1.Like.findOne({ userId: user._id, storyId: id });
        if (existingLike) {
            await like_model_1.Like.deleteOne({ _id: existingLike._id });
            await story_model_1.Story.findByIdAndUpdate(id, { $inc: { likeCount: -1 } });
            return res.status(200).json({ success: true, message: 'Unliked story' });
        }
        else {
            const like = new like_model_1.Like({ userId: user._id, storyId: id });
            await like.save();
            await story_model_1.Story.findByIdAndUpdate(id, { $inc: { likeCount: 1 } });
            return res.status(200).json({ success: true, message: 'Liked story' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.toggleLike = toggleLike;
const toggleBookmark = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    try {
        const existingBookmark = await bookmark_model_1.Bookmark.findOne({ userId: user._id, storyId: id });
        if (existingBookmark) {
            await bookmark_model_1.Bookmark.deleteOne({ _id: existingBookmark._id });
            await story_model_1.Story.findByIdAndUpdate(id, { $inc: { bookmarkCount: -1 } });
            return res.status(200).json({ success: true, message: 'Removed bookmark' });
        }
        else {
            const bookmark = new bookmark_model_1.Bookmark({ userId: user._id, storyId: id });
            await bookmark.save();
            await story_model_1.Story.findByIdAndUpdate(id, { $inc: { bookmarkCount: 1 } });
            return res.status(200).json({ success: true, message: 'Bookmarked story' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.toggleBookmark = toggleBookmark;
