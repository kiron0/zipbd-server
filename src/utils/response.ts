import type { Response } from "express";

interface IApiResponse<T> {
  statusCode: number;
  success: boolean;
  message?: string | null;
  data?: T | null;
  error?: string | null;
}

export const sendResponse = <T>(res: Response, data: IApiResponse<T>): void => {
  const responseData: IApiResponse<T> = {
    statusCode: data.statusCode,
    success: data.success,
    message: data.message || null,
    data: data.data || null || undefined,
    error: data.error || null || undefined,
  };

  res.status(data.statusCode).json(responseData);
};
