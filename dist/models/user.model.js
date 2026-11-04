"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserRole = void 0;
const prisma_1 = require("../config/prisma");
const roles_1 = require("../constants/roles");
Object.defineProperty(exports, "UserRole", { enumerable: true, get: function () { return roles_1.UserRole; } });
exports.User = prisma_1.prisma.user;
