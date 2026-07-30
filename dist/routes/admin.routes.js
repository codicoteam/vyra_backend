"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
// Expose admin stats endpoint for Admin and Super Admin
router.get('/stats', auth_1.authenticate, (0, auth_1.authorize)([roles_1.UserRole.ADMIN, roles_1.UserRole.SUPER_ADMIN]), admin_controller_1.getStats);
exports.default = router;
