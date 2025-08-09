import { inject } from "@vercel/analytics";
import { createServer } from "http";
import { app } from "./app";
import config from "./config";

const startServer = async () => {
  try {
    const server = createServer(app);
    if (config.env === "production") {
      inject();
    }
    server.listen(config.port, () => {
      console.log(`🌐 Server running on port ${config.port} 🔥`);
      console.log(
        `📖 API Documentation (Swagger UI): http://localhost:${config.port}/docs`,
      );
      console.log(`📄 OpenAPI JSON: http://localhost:${config.port}/docs.json`);
      console.log(`🌍 Environment: ${config.env}`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();
