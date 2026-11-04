"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Series = void 0;
const prisma_1 = require("../config/prisma");
exports.Series = prisma_1.prisma.post; // mapped to Post or series relation
