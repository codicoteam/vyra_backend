import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/database';

const startServer = async () => {
  await connectDatabase();
  
  app.listen(config.port, () => {
    console.log(`Server is running in ${config.nodeEnv} mode on port ${config.port}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
