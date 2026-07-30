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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const roles_1 = require("../constants/roles");
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
        index: true,
    },
    passwordHash: {
        type: String,
        select: false,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
    },
    bio: {
        type: String,
        maxlength: 500,
    },
    avatarUrl: String,
    bannerUrl: String,
    website: String,
    location: String,
    twitterHandle: String,
    // Preferences
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: false },
    weeklyDigest: { type: Boolean, default: true },
    themePreference: { type: String, default: 'system', enum: ['light', 'dark', 'system'] },
    // Verification & Status
    isVerified: { type: Boolean, default: false },
    emailVerifiedAt: Date,
    isBanned: { type: Boolean, default: false },
    banReason: String,
    bannedAt: Date,
    bannedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    role: {
        type: String,
        enum: Object.values(roles_1.UserRole),
        default: roles_1.UserRole.USER,
        index: true,
    },
    // OAuth
    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
    twitterId: { type: String, unique: true, sparse: true },
    // Stats
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    storiesCount: { type: Number, default: 0 },
    totalReads: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    achievementPoints: { type: Number, default: 0 },
    lastLoginAt: Date,
    deletedAt: { type: Date, default: null },
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            delete ret.passwordHash;
            delete ret.__v;
            return ret;
        },
    },
});
// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ deletedAt: 1 });
userSchema.index({ 'email': 'text', 'username': 'text', 'fullName': 'text' });
// Pre-save hook for password hashing
userSchema.pre('save', async function () {
    if (!this.isModified('passwordHash') || !this.passwordHash)
        return;
    const salt = await bcrypt_1.default.genSalt(12);
    this.passwordHash = await bcrypt_1.default.hash(this.passwordHash, salt);
});
// Instance method for password comparison
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.passwordHash)
        return false;
    return bcrypt_1.default.compare(candidatePassword, this.passwordHash);
};
exports.User = mongoose_1.default.model('User', userSchema);
