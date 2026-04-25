import { Request, Response, NextFunction } from "express";
import { CarService } from "../services/car.service";

export class CarController {
  static async getCars(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await CarService.getCars(page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
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