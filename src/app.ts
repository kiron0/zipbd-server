import cors from "cors";
import "dotenv/config";
import express, { Application, Request, Response } from "express";
import httpStatus from "http-status";
import path from "path";
import { postalRoutes } from "./app/routes/postal.route";
import { errorHandler } from "./middleware/errorHandler";
import { sendResponse } from "./utils";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use("/api/v1", postalRoutes);

app.get("/", async (req: Request, res: Response) => {
  res.render("index");
});

app.use((req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: httpStatus.NOT_FOUND,
    success: false,
    message:
      "Not Found. The resource you are looking for does not exist on this server. Please check the URL or refer to the API documentation.",
  });
});

app.use(errorHandler);

export { app };
