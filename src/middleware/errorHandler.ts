import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils";

export interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  _: NextFunction,
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  console.error("Error:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  sendResponse(res, {
    statusCode,
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
};
