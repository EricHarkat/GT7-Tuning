import { Router } from "express";
import { CarController } from "../controllers/car.controller";

const router = Router();

router.get("/", CarController.getCars);
router.get("/search", CarController.searchCars);
router.get("/manufacturer/:manufacturer", CarController.getCarsByManufacturer);
router.get("/:id", CarController.getCarById);

export default router;