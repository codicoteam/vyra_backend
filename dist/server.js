"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const startServer = async () => {
    await (0, database_1.connectDatabase)();
    app_1.default.listen(env_1.config.port, () => {
        console.log(`Server is running in ${env_1.config.nodeEnv} mode on port ${env_1.config.port}`);
    });
};
startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
