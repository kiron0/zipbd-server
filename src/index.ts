import { createServer } from "http";
import { app } from "./app";
import config from "./config";

const startServer = async () => {
  try {
    const server = createServer(app);
    server.listen(config.port, () => {
      console.log(`🌐 Server running on port ${config.port} 🔥`);
      console.log(`📖 API Documentation: http://localhost:${config.port}`);
      console.log(`🌍 Environment: ${config.env}`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();
