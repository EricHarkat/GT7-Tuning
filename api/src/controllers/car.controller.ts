import { Request, Response, NextFunction } from "express";
import { CarService } from "../services/car.service";

export class CarController {
  static async getCars(req: Request, res: Response) {
  const limit = Number(req.query.limit) || 25;
  const page = Number(req.query.page) || 1;

  const result = await CarService.getCars(page, limit, {
    search: String(req.query.search || ""),
    category: String(req.query.category || ""),
    drivetrain: String(req.query.drivetrain || ""),
    engineType: String(req.query.engineType || "")
  });

    res.json(result);
  }

  static async searchCars(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      const cars = await CarService.searchCars(query);
      res.json(cars);
    } catch (error) {
      next(error);
    }
  }

  static async getCarsByManufacturer(req: Request, res: Response, next: NextFunction) {
    try {
      const manufacturer = req.params.manufacturer as string;
      const cars = await CarService.getCarsByManufacturer(manufacturer);
      res.json(cars);
    } catch (error) {
      next(error);
    }
  }

  static async getCarById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const car = await CarService.getCarById(id);

      if (!car) {
        return res.status(404).json({ error: "Car not found" });
      }

      res.json(car);
    } catch (error) {
      next(error);
    }
  }
}