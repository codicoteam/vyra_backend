"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = void 0;
const admin_service_1 = require("../services/admin.service");
const getStats = async (req, res) => {
    try {
        const stats = await (0, admin_service_1.getAdminDashboardStats)();
        res.status(200).json({ success: true, data: stats });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.getStats = getStats;
