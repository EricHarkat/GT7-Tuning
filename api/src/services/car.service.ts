import { Car } from "../models/car.model";

export class CarService {
  static async getCars(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [cars, total] = await Promise.all([
      Car.find({})
        .skip(skip)
        .limit(limit)
        .sort({ manufacturer: 1, name: 1 }),
      Car.countDocuments()
    ]);

    return {
      page,
      limit,
      total,
      cars
    };
  }

  static async searchCars(query: string) {
    return Car.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { manufacturer: { $regex: query, $options: "i" } }
      ]
    }).limit(50);
  }

  static async getCarsByManufacturer(manufacturer: string) {
    return Car.find({
      manufacturer: { $regex: `^${manufacturer}$`, $options: "i" }
    }).sort({ name: 1 });
  }

  static async getCarById(id: string) {
    return Car.findById(id);
  }
}