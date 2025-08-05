import httpStatus from "http-status";
import catchAsync from "../../../utils/catch-async";
import { sendResponse } from "../../../utils/response";
import {
  getAllDataService,
  searchByCityService,
  searchByCodeService,
  searchByDistrictService,
  searchBySubService,
  searchService,
} from "../services/postal.service";

export const searchByDistrict = catchAsync(async (req, res) => {
  const { district } = req.params;

  const { data, message } = await searchByDistrictService(district);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data,
    message,
  });
});

export const searchByCity = catchAsync(async (req, res) => {
  const { city } = req.params;

  const { data, message } = await searchByCityService(city);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data,
    message,
  });
});

export const searchBySub = catchAsync(async (req, res) => {
  const { sub } = req.params;

  const { data, message } = await searchBySubService(sub);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data,
    message,
  });
});

export const searchByCode = catchAsync(async (req, res) => {
  const { code } = req.params;

  const { data, message } = await searchByCodeService(code);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data,
    message,
  });
});

export const search = catchAsync(async (req, res) => {
  const { district, city, sub, code } = req.query;

  const { data, message } = await searchService({
    district: district as string,
    city: city as string,
    sub: sub as string,
    code: code as string,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data,
    message,
  });
});

export const getAllData = catchAsync(async (req, res) => {
  const { data, message } = await getAllDataService();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data,
    message,
  });
});
