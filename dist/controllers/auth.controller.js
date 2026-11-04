"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.getMe = exports.verifyEmail = exports.resetPassword = exports.forgotPassword = exports.logout = exports.refreshToken = exports.googleLogin = exports.login = exports.register = exports.setupFirstAdmin = exports.getAdminStatus = void 0;
const prisma_1 = require("../config/prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = require("../config/env");
const crypto_1 = __importDefault(require("crypto"));
const google_auth_library_1 = require("google-auth-library");
const mailer_1 = require("../utils/mailer");
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, env_1.config.jwtSecret, { expiresIn: env_1.config.jwtExpiresIn });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, env_1.config.jwtRefreshSecret, { expiresIn: env_1.config.jwtRefreshExpiresIn });
    return { accessToken, refreshToken };
};
const getAdminStatus = async (req, res) => {
    const adminCount = await prisma_1.prisma.user.count({
        where: { role: 'ADMIN', deletedAt: null },
    });
    res.status(200).json({
        success: true,
        adminExists: adminCount > 0,
    });
};
exports.getAdminStatus = getAdminStatus;
const setupFirstAdmin = async (req, res) => {
    const adminCount = await prisma_1.prisma.user.count({
        where: { role: 'ADMIN', deletedAt: null },
    });
    if (adminCount > 0) {
        return res.status(403).json({
            success: false,
            error: {
                code: 'ADMIN_EXISTS',
                message: 'Administrator account already exists. Setup is disabled.',
            },
        });
    }
    const { email, username, password, fullName } = req.body;
    const existingUser = await prisma_1.prisma.user.findFirst({
        where: {
            OR: [{ email: email.toLowerCase() }, { username }],
        },
    });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            error: {
                code: 'DUPLICATE_ENTRY',
                message: 'Email or username already exists',
            },
        });
    }
    const passwordHash = await bcrypt_1.default.hash(password, 12);
    const user = await prisma_1.prisma.user.create({
        data: {
            email: email.toLowerCase(),
            username,
            passwordHash,
            fullName,
            role: 'ADMIN',
            isVerified: true,
        },
    });
    const { accessToken, refreshToken } = generateTokens(user.id);
    await prisma_1.prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({
        success: true,
        data: { user: safeUser, accessToken, refreshToken },
        message: 'First Administrator account created successfully',
    });
};
exports.setupFirstAdmin = setupFirstAdmin;
const hashCode = (code) => crypto_1.default.createHash('sha256').update(code).digest('hex');
const register = async (req, res) => {
    const { email, username, password, fullName } = req.body;
    const existingUser = await prisma_1.prisma.user.findFirst({
        where: {
            OR: [{ email: email.toLowerCase() }, { username }],
        },
    });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            error: {
                code: 'DUPLICATE_ENTRY',
                message: 'Email or username already exists',
            },
        });
    }
    const passwordHash = await bcrypt_1.default.hash(password, 12);
    const user = await prisma_1.prisma.user.create({
        data: {
            email: email.toLowerCase(),
            username,
            passwordHash,
            fullName,
            role: 'USER',
        },
    });
    const { accessToken, refreshToken } = generateTokens(user.id);
    await prisma_1.prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({
        success: true,
        data: { user: safeUser, accessToken, refreshToken },
        message: 'Registration successful',
    });
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma_1.prisma.user.findFirst({
        where: { email: email.toLowerCase() },
    });
    if (!user ||
        !user.passwordHash ||
        !(await bcrypt_1.default.compare(password, user.passwordHash))) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
            },
        });
    }
    const { accessToken, refreshToken } = generateTokens(user.id);
    await prisma_1.prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    const { passwordHash: _, ...safeUser } = user;
    res.status(200).json({
        success: true,
        data: { user: safeUser, accessToken, refreshToken },
        message: 'Login successful',
    });
};
exports.login = login;
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const p = ticket.getPayload();
        if (!p?.email)
            throw new Error('No email');
        const email = p.email.toLowerCase();
        let user = await prisma_1.prisma.user.findFirst({ where: { email } });
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: {
                    email,
                    fullName: p.name ?? 'User',
                    username: email.split('@')[0] + Math.floor(Math.random() * 10000),
                    // copy any other required fields from your register function
                },
            });
        }
        const { accessToken, refreshToken } = generateTokens(user.id);
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        const { passwordHash: _, ...safeUser } = user;
        return res.json({
            success: true,
            data: { user: safeUser, accessToken, refreshToken },
            message: 'Login successful',
        });
    }
    catch {
        return res.status(401).json({
            success: false,
            error: { code: 'INVALID_GOOGLE_TOKEN', message: 'Google sign-in failed' },
        });
    }
};
exports.googleLogin = googleLogin;
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({
            success: false,
            error: { message: 'Refresh token is required' },
        });
    }
    const tokenRecord = await prisma_1.prisma.refreshToken.findFirst({
        where: { token: refreshToken, revokedAt: null },
    });
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        return res.status(401).json({
            success: false,
            error: { message: 'Invalid or expired refresh token' },
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.config.jwtRefreshSecret);
        const tokens = generateTokens(decoded.userId);
        await prisma_1.prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { revokedAt: new Date() },
        });
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: tokens.refreshToken,
                userId: decoded.userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        res.status(200).json({
            success: true,
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
        });
    }
    catch (err) {
        return res
            .status(401)
            .json({ success: false, error: { message: 'Invalid refresh token' } });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
        await prisma_1.prisma.refreshToken.updateMany({
            where: { token: refreshToken },
            data: { revokedAt: new Date() },
        });
    }
    res.status(200).json({ success: true, message: 'Logout successful' });
};
exports.logout = logout;
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await prisma_1.prisma.user.findFirst({
        where: { email: String(email).toLowerCase() },
    });
    if (user) {
        const code = crypto_1.default.randomInt(100000, 1000000).toString();
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: hashCode(code),
                resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000),
            },
        });
        try {
            await (0, mailer_1.sendResetCode)(user.email, code);
        }
        catch (e) {
            console.error('Failed to send reset email', e);
        }
    }
    res.status(200).json({
        success: true,
        message: 'If the email exists, a reset code has been sent.',
    });
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword || String(newPassword).length < 8) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Email, code and a password of 8+ characters are required',
            },
        });
    }
    const user = await prisma_1.prisma.user.findFirst({
        where: {
            email: String(email).toLowerCase(),
            resetPasswordToken: hashCode(String(code)),
            resetPasswordExpires: { gt: new Date() },
        },
    });
    if (!user) {
        return res.status(400).json({
            success: false,
            error: { message: 'Invalid or expired reset code' },
        });
    }
    const passwordHash = await bcrypt_1.default.hash(newPassword, 12);
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: {
            passwordHash,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        },
    });
    await prisma_1.prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revokedAt: new Date() },
    });
    res
        .status(200)
        .json({ success: true, message: 'Password reset successfully' });
};
exports.resetPassword = resetPassword;
const verifyEmail = async (req, res) => {
    const { email, code } = req.body;
    const user = await prisma_1.prisma.user.findFirst({
        where: {
            email: String(email).toLowerCase(),
            emailVerificationToken: hashCode(String(code)),
            emailVerificationExpires: { gt: new Date() },
        },
    });
    if (!user) {
        return res.status(400).json({
            success: false,
            error: { message: 'Invalid or expired verification code' },
        });
    }
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: {
            isVerified: true,
            emailVerifiedAt: new Date(),
            emailVerificationToken: null,
            emailVerificationExpires: null,
        },
    });
    res
        .status(200)
        .json({ success: true, message: 'Email verified successfully' });
};
exports.verifyEmail = verifyEmail;
const getMe = async (req, res) => {
    if (!req.user) {
        return res
            .status(401)
            .json({ success: false, error: { message: 'Unauthorized' } });
    }
    const { passwordHash: _, ...safeUser } = req.user;
    res.status(200).json({ success: true, data: safeUser });
};
exports.getMe = getMe;
const changePassword = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res
            .status(401)
            .json({ success: false, error: { message: 'Unauthorized' } });
    }
    const { currentPassword, newPassword } = req.body;
    const dbUser = await prisma_1.prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser ||
        !dbUser.passwordHash ||
        !(await bcrypt_1.default.compare(currentPassword, dbUser.passwordHash))) {
        return res.status(400).json({
            success: false,
            error: { message: 'Current password is incorrect' },
        });
    }
    const newHash = await bcrypt_1.default.hash(newPassword, 12);
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
    });
    res
        .status(200)
        .json({ success: true, message: 'Password updated successfully' });
};
exports.changePassword = changePassword;
