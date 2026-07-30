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
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Setup Swagger (to be enabled when swagger setup is complete)
(0, swagger_1.setupSwagger)(app);
const routes_1 = __importDefault(require("./routes"));
// Routes
app.use('/api/v1', routes_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'VYRA API is running' });
});
app.use(errorHandler_1.errorHandler);
exports.default = app;
