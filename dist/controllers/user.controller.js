"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = void 0;
const user_model_1 = require("../models/user.model");
const getUserProfile = async (req, res) => {
    const { username } = req.params;
    const user = await user_model_1.User.findOne({ username, deletedAt: null });
    if (!user) {
        return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    res.status(200).json({ success: true, data: user });
};
exports.getUserProfile = getUserProfile;
const updateUserProfile = async (req, res) => {
    const { username } = req.params;
    const updates = req.body;
    // For security, only allow the authenticated user themselves to update their profile
    const authUser = req.user;
    if (!authUser || authUser.username !== username) {
        return res.status(403).json({ success: false, error: { message: 'Unauthorized profile update' } });
    }
    const user = await user_model_1.User.findOneAndUpdate({ username, deletedAt: null }, { $set: updates }, { new: true });
    if (!user) {
        return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    res.status(200).json({ success: true, data: user, message: 'Profile updated successfully' });
};
exports.updateUserProfile = updateUserProfile;
