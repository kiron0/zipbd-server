import { rateLimit } from "express-rate-limit";
import httpStatus from "http-status";
import config from "../config";
import { sendResponse } from "./response";

const DEFAULT_TIME_LIMIT_IN_MINUTES =
  config.env === "production" ? 1 : Infinity;
const DEFAULT_MAX_REQUESTS = config.env === "production" ? 30 : Infinity;

export const rateLimiter = (
  timeLimitInMinutes = DEFAULT_TIME_LIMIT_IN_MINUTES,
  maxRequests = DEFAULT_MAX_REQUESTS,
) => {
  return rateLimit({
    windowMs: timeLimitInMinutes * 60 * 1000, // 1 minute
    max: maxRequests, // Limit each IP to 3 requests per windowMs
    handler: (req, res) => {
      sendResponse(res, {
        statusCode: httpStatus.TOO_MANY_REQUESTS,
        success: false,
        message: `Hi there! You have exceeded the request limit. Please try again in ${timeLimitInMinutes} minutes. Thank you for using our service!`,
      });
    },
    headers: true,
    legacyHeaders: false,
  });
};
