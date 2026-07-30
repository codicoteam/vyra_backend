"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/profile/:username', user_controller_1.getUserProfile);
router.put('/profile/:username', auth_1.authenticate, user_controller_1.updateUserProfile);
exports.default = router;
