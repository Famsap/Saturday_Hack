const app = require('./app');
const config = require('./config');

const server = app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});
