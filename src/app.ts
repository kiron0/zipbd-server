import cors from "cors";
import "dotenv/config";
import express, { Application, Request, Response } from "express";
import path from "path";
import postalRoutes from "./app/routes/postal.route";
import { errorHandler } from "./middleware/errorHandler";

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
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

app.use(errorHandler);

export { app };
