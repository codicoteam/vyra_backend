"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = void 0;
const prisma_1 = require("../config/prisma");
exports.AuditLog = prisma_1.prisma.auditLog;
