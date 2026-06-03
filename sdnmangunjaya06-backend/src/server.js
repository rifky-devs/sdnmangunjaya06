import app from './app.js';
import { env } from './config/env.js';
import { testConnection } from './config/database.js';

const startServer = async () => {
  try {
    await testConnection();

    app.listen(env.appPort, () => {
      console.log(`API berjalan di http://localhost:${env.appPort}/api`);
    });
  } catch (error) {
    console.error('Server gagal dijalankan:', error.message);
    process.exit(1);
  }
};

startServer();
