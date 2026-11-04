"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReport = exports.updateReport = exports.getReportById = exports.getReports = exports.createReport = void 0;
const prisma_1 = require("../config/prisma");
const createReport = async (req, res) => {
    const { targetType, targetId, reason, details } = req.body;
    const reporterId = req.user ? req.user.id : null;
    const report = await prisma_1.prisma.report.create({
        data: {
            reporterId,
            targetType,
            targetId,
            reason,
            details,
        }
    });
    res.status(201).json({ success: true, data: report, message: 'Report submitted' });
};
exports.createReport = createReport;
const getReports = async (req, res) => {
    const reports = await prisma_1.prisma.report.findMany({
        include: {
            reporter: { select: { id: true, username: true, fullName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: reports });
};
exports.getReports = getReports;
const getReportById = async (req, res) => {
    const id = req.params.id;
    const report = await prisma_1.prisma.report.findUnique({
        where: { id },
        include: {
            reporter: { select: { id: true, username: true, fullName: true, email: true } }
        }
    });
    if (!report)
        return res.status(404).json({ success: false, error: { message: 'Report not found' } });
    res.status(200).json({ success: true, data: report });
};
exports.getReportById = getReportById;
const updateReport = async (req, res) => {
    const id = req.params.id;
    const { status, actionTaken } = req.body;
    const report = await prisma_1.prisma.report.update({
        where: { id },
        data: {
            status,
            actionTaken,
            reviewedBy: req.user?.id,
            reviewedAt: new Date()
        }
    });
    res.status(200).json({ success: true, data: report, message: 'Report updated' });
};
exports.updateReport = updateReport;
const deleteReport = async (req, res) => {
    const id = req.params.id;
    await prisma_1.prisma.report.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Report deleted' });
};
exports.deleteReport = deleteReport;
