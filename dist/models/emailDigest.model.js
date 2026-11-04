"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailDigest = exports.EmailDigestLog = void 0;
const prisma_1 = require("../config/prisma");
exports.EmailDigestLog = prisma_1.prisma.emailDigest;
exports.EmailDigest = prisma_1.prisma.emailDigest;
