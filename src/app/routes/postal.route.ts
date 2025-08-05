import { Router } from "express";
import {
  getAllData,
  search,
  searchByCity,
  searchByCode,
  searchByDistrict,
  searchBySub,
} from "../modules/controllers/postal.controller";

const router = Router();

router.get("/district/:district", searchByDistrict);

router.get("/city/:city", searchByCity);

router.get("/sub/:sub", searchBySub);

router.get("/code/:code", searchByCode);

router.get("/search", search);

router.get("/all", getAllData);

export default router;
