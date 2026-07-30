"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Story = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const storySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    excerpt: {
        type: String,
        maxlength: 500,
    },
    content: {
        type: String,
        required: true,
    },
    contentFormat: {
        type: String,
        enum: ['rich-text', 'markdown'],
        default: 'rich-text',
    },
    plainTextContent: String,
    coverImageUrl: String,
    coverImageAlt: String,
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        index: true,
    },
    tags: [{ type: String, trim: true }],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived', 'under_review', 'scheduled'],
        default: 'draft',
        index: true,
    },
    visibility: {
        type: String,
        enum: ['public', 'unlisted'],
        default: 'public',
    },
    isAnonymous: { type: Boolean, default: false, index: true },
    anonymousId: { type: String, unique: true, sparse: true },
    scheduledAt: Date,
    // Research Fields
    isResearch: { type: Boolean, default: false },
    doi: String,
    abstract: String,
    institution: String,
    coAuthors: [{
            name: String,
            email: String,
            institution: String,
        }],
    citationFormat: String,
    license: String,
    peerReviewed: Boolean,
    fundingSource: String,
    // Campaign Fields
    isCampaign: { type: Boolean, default: false },
    campaignGoal: String,
    campaignTarget: Number,
    campaignProgress: { type: Number, default: 0 },
    // Series
    isSeries: { type: Boolean, default: false },
    seriesId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Series',
    },
    seriesOrder: Number,
    // Stats
    viewCount: { type: Number, default: 0 },
    uniqueViewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    bookmarkCount: { type: Number, default: 0 },
    readCount: { type: Number, default: 0 },
    averageReadTime: Number,
    engagementScore: { type: Number, default: 0, index: -1 },
    // Metadata
    readingTime: { type: Number, default: 1 },
    wordCount: { type: Number, default: 0 },
    characterCount: { type: Number, default: 0 },
    // SEO
    metaTitle: String,
    metaDescription: String,
    // Moderation
    isFeatured: { type: Boolean, default: false, index: true },
    isEditorPick: { type: Boolean, default: false },
    moderationStatus: {
        type: String,
        enum: ['pending', 'approved', 'flagged', 'rejected'],
        default: 'approved',
        index: true,
    },
    moderationNotes: String,
    moderatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: Date,
    publishedAt: { type: Date, index: -1 },
    deletedAt: { type: Date, default: null, index: true },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
});
// Compound Indexes
storySchema.index({ status: 1, publishedAt: -1 });
storySchema.index({ categoryId: 1, status: 1 });
storySchema.index({ userId: 1, status: 1 });
storySchema.index({ tags: 1 });
storySchema.index({ engagementScore: -1 });
storySchema.index({ isFeatured: 1, publishedAt: -1 });
// Text Index for Search
storySchema.index({
    title: 'text',
    excerpt: 'text',
    plainTextContent: 'text',
    tags: 'text',
});
// Pre-save hook for slug generation
storySchema.pre('save', async function () {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    }
});
exports.Story = mongoose_1.default.model('Story', storySchema);
