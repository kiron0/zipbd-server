import httpStatus from "http-status";
import { catchAsync, sendResponse } from "../../../utils";
import {
  downloadDataService,
  getAllDataService,
  getAllDistrictsService,
  getCitiesByDistrictService,
  getSubCitiesByDistrictService,
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

export const getAllDistricts = catchAsync(async (req, res) => {
  const { data, message } = await getAllDistrictsService();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data,
    message,
  });
});

export const getCitiesByDistrict = catchAsync(async (req, res) => {
  const { district } = req.params;

  const { data, message } = await getCitiesByDistrictService(district);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data,
    message,
  });
});

export const getSubCitiesByDistrict = catchAsync(async (req, res) => {
  const { district, city } = req.params;

  const { data, message } = await getSubCitiesByDistrictService(district, city);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data,
    message,
  });
});

export const downloadData = catchAsync(async (req, res) => {
  const { format = "json", district, city } = req.query;

  const { data, contentType, filename } = await downloadDataService(
    format as string,
    district as string,
    city as string,
  );

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Cache-Control", "no-cache");

  res.status(httpStatus.OK).send(data);
});
