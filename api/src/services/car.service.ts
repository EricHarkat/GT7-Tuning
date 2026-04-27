import { Car } from "../models/car.model";

type CarFilters = {
  search?: string;
  category?: string;
  drivetrain?: string;
  engineType?: string;
};

export class CarService {
  static async getCars(page: number, limit: number, filters: CarFilters = {}) {
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { manufacturer: { $regex: filters.search, $options: "i" } }
      ];
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.engineType) {
      query.engineType = filters.engineType;
    }

    if (filters.drivetrain) {
      query["normalized.drivetrain"] = filters.drivetrain;
    }

    const [cars, total] = await Promise.all([
      Car.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ manufacturer: 1, name: 1 }),
      Car.countDocuments(query)
    ]);

    return {
      page,
      limit,
      total,
      cars
    };
  }

  static async getCarById(id: string) {
    return Car.findById(id);
  }
}