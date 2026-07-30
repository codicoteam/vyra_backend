"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const user_model_1 = require("../models/user.model");
const refreshToken_model_1 = require("../models/refreshToken.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, env_1.config.jwtSecret, { expiresIn: env_1.config.jwtExpiresIn });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, env_1.config.jwtRefreshSecret, { expiresIn: env_1.config.jwtRefreshExpiresIn });
    return { accessToken, refreshToken };
};
const register = async (req, res) => {
    const { email, username, password, fullName } = req.body;
    const existingUser = await user_model_1.User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            error: { code: 'DUPLICATE_ENTRY', message: 'Email or username already exists' }
        });
    }
    const user = new user_model_1.User({ email, username, passwordHash: password, fullName });
    await user.save();
    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    const tokenRecord = new refreshToken_model_1.RefreshToken({
        token: refreshToken,
        userId: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await tokenRecord.save();
    res.status(201).json({
        success: true,
        data: { user, accessToken, refreshToken },
        message: 'Registration successful'
    });
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await user_model_1.User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
            success: false,
            error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
        });
    }
    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    const tokenRecord = new refreshToken_model_1.RefreshToken({
        token: refreshToken,
        userId: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await tokenRecord.save();
    res.status(200).json({
        success: true,
        data: { user, accessToken, refreshToken },
        message: 'Login successful'
    });
};
exports.login = login;
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ success: false, error: { message: 'Refresh token is required' } });
    }
    const tokenRecord = await refreshToken_model_1.RefreshToken.findOne({ token: refreshToken, revokedAt: null });
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        return res.status(401).json({ success: false, error: { message: 'Invalid or expired refresh token' } });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.config.jwtRefreshSecret);
        const tokens = generateTokens(decoded.userId);
        // Revoke old token
        tokenRecord.revokedAt = new Date();
        await tokenRecord.save();
        // Save new token
        const newTokenRecord = new refreshToken_model_1.RefreshToken({
            token: tokens.refreshToken,
            userId: decoded.userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        await newTokenRecord.save();
        res.status(200).json({
            success: true,
            data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
        });
    }
    catch (err) {
        return res.status(401).json({ success: false, error: { message: 'Invalid refresh token' } });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        // In a real app we might blacklist the access token here
    }
    res.status(200).json({ success: true, message: 'Logout successful' });
};
exports.logout = logout;
