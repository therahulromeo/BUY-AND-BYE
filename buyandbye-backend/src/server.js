import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import { initMongoDB } from './config/db.js';
import { initStore } from './data/dataStore.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 8080;
const server = http.createServer(app);

async function startServer() {
  console.log('='.repeat(55));
  console.log('  BuyAndBye Node.js, Express & MongoDB REST Backend');
  console.log('='.repeat(55));

  // Initialize data store
  initStore();

  // Connect to MongoDB
  await initMongoDB();

  // Start HTTP server
  server.listen(PORT, () => {
    console.log(`[Server] Server listening on http://localhost:${PORT}`);
    console.log(`[API Base] http://localhost:${PORT}/api`);
    console.log(`[Health]   http://localhost:${PORT}/api/health`);
    console.log('='.repeat(55));
  });

  // Handle errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`[Server Error] Port ${PORT} is already in use. Please free port ${PORT} or configure PORT in .env.`);
    } else {
      console.error('[Server Error]', error.message);
    }
    process.exit(1);
  });
}

// Graceful shutdown handlers
function handleShutdown(signal) {
  console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

startServer();
