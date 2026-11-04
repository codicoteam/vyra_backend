"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationCode = sendVerificationCode;
exports.sendResetCode = sendResetCode;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
async function sendVerificationCode(to, code) {
    await transporter.sendMail({
        from: `"VYRA" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your VYRA verification code',
        text: `Your verification code is ${code}. It expires in 10 minutes.`,
    });
}
async function sendResetCode(to, code) {
    await transporter.sendMail({
        from: `"VYRA" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your VYRA password reset code',
        text: `Your password reset code is ${code}. It expires in 15 minutes. If you didn't ask for this, ignore this email.`,
    });
}
