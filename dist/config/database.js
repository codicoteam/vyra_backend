"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = exports.prisma = void 0;
var prisma_1 = require("./prisma");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return prisma_1.prisma; } });
Object.defineProperty(exports, "connectDatabase", { enumerable: true, get: function () { return prisma_1.connectDatabase; } });
