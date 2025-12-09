import app from './config/app';
import config from './config/config';
import { connectDB, disconnectDB } from './config/db';

async function initializeServer() {
  try {
    await connectDB();

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error(`Failed to initialize server: ${error}`);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

initializeServer();
