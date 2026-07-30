import express from 'express';
// @ts-ignore
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { setupSwagger } from './swagger';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes';
import { getHealth, getDatabaseHealth, getVersion, getStatus } from './controllers/system.controller';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Setup Swagger UI at /api-docs
setupSwagger(app);

// Top-level system & health endpoints
app.get('/health', getHealth);
app.get('/health/database', getDatabaseHealth);
app.get('/api/health/database', getDatabaseHealth);
app.get('/version', getVersion);
app.get('/status', getStatus);

// API Routes (versioned)
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes); // unversioned route mapping for convenience

app.use(errorHandler);

export default app;
