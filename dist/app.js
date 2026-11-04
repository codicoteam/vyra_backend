"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// @ts-ignore
require("express-async-errors");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_1 = require("./swagger");
const errorHandler_1 = require("./middleware/errorHandler");
const routes_1 = __importDefault(require("./routes"));
const system_controller_1 = require("./controllers/system.controller");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Setup Swagger UI at /api-docs
(0, swagger_1.setupSwagger)(app);
// Top-level system & health endpoints
app.get('/health', system_controller_1.getHealth);
app.get('/health/database', system_controller_1.getDatabaseHealth);
app.get('/api/health/database', system_controller_1.getDatabaseHealth);
app.get('/version', system_controller_1.getVersion);
app.get('/status', system_controller_1.getStatus);
// API Routes (versioned)
app.use('/api/v1', routes_1.default);
app.use('/api', routes_1.default); // unversioned route mapping for convenience
app.use(errorHandler_1.errorHandler);
// ...
app.use('/uploads', (_req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
exports.default = app;
