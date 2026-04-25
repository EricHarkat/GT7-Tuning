import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gt7_tuning";

export async function connectDatabase() {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: "gt7_tuning",
      autoIndex: true
    });
    console.log("Connecté à MongoDB");
  } catch (error) {
    console.error("Erreur de connexion à MongoDB:", error);
    throw error;
  }
}
