import { Router } from "express";
import { rateLimiter } from "../../utils/rate-limiter";
import {
  downloadData,
  getAllData,
  getAllDistricts,
  getCitiesByDistrict,
  getSubCitiesByDistrict,
} from "../modules/controllers/postal.controller";

const router = Router();

router.use(rateLimiter());

router.use((req, res, next) => {
  res.setHeader("X-API-Version", "1.0");
  res.setHeader("X-Response-Time", Date.now());
  next();
});

router.get("/districts", getAllDistricts);
router.get("/districts/:district/cities", getCitiesByDistrict);
router.get(
  "/districts/:district/cities/:city/sub-cities",
  getSubCitiesByDistrict,
);

router.get("/download", downloadData);

router.get("/all", getAllData);

export { router as postalRoutes };
