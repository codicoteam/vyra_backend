"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = exports.Story = void 0;
const prisma_1 = require("../config/prisma");
exports.Story = prisma_1.prisma.post;
exports.Post = prisma_1.prisma.post;
