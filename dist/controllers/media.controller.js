"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMedia = exports.getMediaById = exports.uploadMedia = exports.uploadImageFile = void 0;
const prisma_1 = require("../config/prisma");
const uploadImageFile = async (req, res) => {
    if (!req.user)
        return res
            .status(401)
            .json({ success: false, error: { message: 'Unauthorized' } });
    if (!req.file)
        return res
            .status(400)
            .json({ success: false, error: { message: 'No image uploaded' } });
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const media = await prisma_1.prisma.media.create({
        data: {
            uploadedBy: req.user.id,
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            mediaType: 'IMAGE',
            size: req.file.size,
            url,
        },
    });
    res.status(201).json({ success: true, data: media });
};
exports.uploadImageFile = uploadImageFile;
const uploadMedia = (type) => {
    return async (req, res) => {
        if (!req.user)
            return res
                .status(401)
                .json({ success: false, error: { message: 'Unauthorized' } });
        const { url, filename, originalName, size, mimeType } = req.body;
        const mediaTypeEnum = type === 'image' ? 'IMAGE' : type === 'video' ? 'VIDEO' : 'DOCUMENT';
        const media = await prisma_1.prisma.media.create({
            data: {
                uploadedBy: req.user.id,
                filename: filename || `file-${Date.now()}`,
                originalName: originalName || filename || `upload-${type}`,
                mimeType: mimeType ||
                    (type === 'image'
                        ? 'image/png'
                        : type === 'video'
                            ? 'video/mp4'
                            : 'application/pdf'),
                mediaType: mediaTypeEnum,
                size: size || 1024,
                url: url || `https://picsum.photos/seed/${Date.now()}/800/600`,
            },
        });
        res
            .status(201)
            .json({
            success: true,
            data: media,
            message: `${type} uploaded successfully`,
        });
    };
};
exports.uploadMedia = uploadMedia;
const getMediaById = async (req, res) => {
    const id = req.params.id;
    const media = await prisma_1.prisma.media.findUnique({ where: { id } });
    if (!media)
        return res
            .status(404)
            .json({ success: false, error: { message: 'Media not found' } });
    res.status(200).json({ success: true, data: media });
};
exports.getMediaById = getMediaById;
const deleteMedia = async (req, res) => {
    if (!req.user)
        return res
            .status(401)
            .json({ success: false, error: { message: 'Unauthorized' } });
    const id = req.params.id;
    const result = await prisma_1.prisma.media.deleteMany({
        where: { id, uploadedBy: req.user.id },
    });
    if (result.count === 0)
        return res
            .status(404)
            .json({
            success: false,
            error: { message: 'Media not found or unauthorized' },
        });
    res
        .status(200)
        .json({ success: true, message: 'Media deleted successfully' });
};
exports.deleteMedia = deleteMedia;
