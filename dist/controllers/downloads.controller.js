"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = void 0;
const prisma_1 = require("../config/prisma");
const downloadFile = async (req, res) => {
    const id = req.params.id;
    const media = await prisma_1.prisma.media.findUnique({ where: { id } });
    if (!media) {
        return res.status(404).json({ success: false, error: { message: 'Document or file not found' } });
    }
    res.setHeader('Content-Type', media.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${media.originalName || media.filename}"`);
    if (media.path) {
        return res.sendFile(media.path);
    }
    res.status(200).json({
        success: true,
        data: {
            downloadUrl: media.url,
            filename: media.originalName,
            mimeType: media.mimeType,
            size: media.size,
        }
    });
};
exports.downloadFile = downloadFile;
