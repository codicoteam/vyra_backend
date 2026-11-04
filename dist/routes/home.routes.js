"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const home_controller_1 = require("../controllers/home.controller");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const prisma_1 = require("../config/prisma");
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
            const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.userId } });
            if (user && !user.isBanned) {
                req.user = user;
            }
        }
        catch (e) {
            // Continue unauthenticated
        }
    }
    next();
};
const router = (0, express_1.Router)();
router.get('/', optionalAuth, home_controller_1.getHomepageData);
exports.default = router;
