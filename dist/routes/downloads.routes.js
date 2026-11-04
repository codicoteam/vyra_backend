"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const downloads_controller_1 = require("../controllers/downloads.controller");
const router = (0, express_1.Router)();
router.get('/:id', downloads_controller_1.downloadFile);
exports.default = router;
