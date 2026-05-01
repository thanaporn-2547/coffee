require('dotenv').config();
const { createServer } = require('http');
const app = require('./app');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log('');
  console.log('  ☕  Brew & Chill Cafe — API Server');
  console.log(`  🚀  Running on port ${PORT}`);
  console.log(`  🌍  Environment: ${process.env.NODE_ENV}`);
  console.log(`  🔗  Health: http://localhost:${PORT}/api/health`);
  console.log('');
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});