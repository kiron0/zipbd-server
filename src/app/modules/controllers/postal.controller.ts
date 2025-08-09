import httpStatus from "http-status";
import { catchAsync, sendResponse } from "../../../utils";
import {
  downloadDataService,
  getAllDataService,
  getAllDistrictsService,
  getCitiesByDistrictService,
  getSubCitiesByDistrictService,
} from "../services/postal.service";

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

export const getAllData = catchAsync(async (req, res) => {
  const { data, metadata, message } = await getAllDataService();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: {
      postalData: data,
      metadata,
    },
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
