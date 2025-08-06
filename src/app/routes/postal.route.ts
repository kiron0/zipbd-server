import { Router } from "express";
import { rateLimiter } from "../../utils/rate-limiter";
import {
  downloadData,
  getAllData,
  getAllDistricts,
  getCitiesByDistrict,
  getSubCitiesByDistrict,
  search,
  searchByCity,
  searchByCode,
  searchByDistrict,
  searchBySub,
} from "../modules/controllers/postal.controller";

const router = Router();

router.use(rateLimiter());

router.get("/districts", getAllDistricts);
router.get("/districts/:district/cities", getCitiesByDistrict);
router.get(
  "/districts/:district/cities/:city/sub-cities",
  getSubCitiesByDistrict,
);

router.get("/search", search);
router.get("/search/district/:district", searchByDistrict);
router.get("/search/city/:city", searchByCity);
router.get("/search/sub/:sub", searchBySub);
router.get("/search/code/:code", searchByCode);

router.get("/all", getAllData);

router.get("/download", downloadData);

export { router as postalRoutes };
