"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageFile = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const media_controller_1 = require("../controllers/media.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const uploadDir = path_1.default.join(process.cwd(), 'uploads');
fs_1.default.mkdirSync(uploadDir, { recursive: true });
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: uploadDir,
        filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${path_1.default.extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});
const uploadImageFile = async (req, res) => {
    if (!req.user)
        return res
            .status(401)
            .json({ success: false, error: { message: 'Unauthorized' } });
    if (!req.file)
        return res
            .status(400)
            .json({ success: false, error: { message: 'No image uploaded' } });
    const form = new FormData();
    form.append('image', req.file.buffer.toString('base64'));
    const r = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
        method: 'POST',
        body: form,
    });
    const j = await r.json();
    if (!r.ok || !j.success) {
        return res.status(502).json({
            success: false,
            error: { message: j?.error?.message || 'Image host upload failed' },
        });
    }
    const media = await prisma.media.create({
        data: {
            uploadedBy: req.user.id,
            filename: j.data.id,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            mediaType: 'IMAGE',
            size: req.file.size,
            url: j.data.url,
        },
    });
    res.status(201).json({ success: true, data: media });
};
exports.uploadImageFile = uploadImageFile;
router.post('/upload/image-file', auth_1.authenticate, upload.single('file'), exports.uploadImageFile);
router.post('/upload/image', auth_1.authenticate, (0, media_controller_1.uploadMedia)('image'));
router.post('/upload/video', auth_1.authenticate, (0, media_controller_1.uploadMedia)('video'));
router.post('/upload/document', auth_1.authenticate, (0, media_controller_1.uploadMedia)('document'));
router.get('/:id', media_controller_1.getMediaById);
router.delete('/:id', auth_1.authenticate, media_controller_1.deleteMedia);
exports.default = router;
