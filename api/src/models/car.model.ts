import mongoose, { Document } from "mongoose";

export interface CarDocument extends Document {
  name?: string;
  manufacturer?: string;
  group?: string;
  pageUrl?: string;
  imageUrl?: string;
  specs?: Record<string, unknown>;
  rawSpecs?: Record<string, unknown>;
}

const carSchema = new mongoose.Schema(
  {},
  {
    strict: false,
    collection: "cars"
  }
);

export const Car = mongoose.model<CarDocument>("Car", carSchema);