import { createApp } from './app';
import { config } from './config/env.config';
import { initDatabase } from './database/db';

async function startServer() {
  await initDatabase();

  const app = createApp();

  app.listen(config.port, () => {
    console.log(`\n==================================================`);
    console.log(`  Data Scout Node.js Backend is running!`);
    console.log(`  -> API Endpoint: http://localhost:${config.port}/api/data-scout`);
    console.log(`==================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
