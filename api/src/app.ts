import express from "express";
import cors from "cors";
import carRoutes from "./routes/car.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "GT7 Tuning API",
    endpoints: [
      "GET /cars",
      "GET /cars/:id",
      "GET /cars/search?q=supra",
      "GET /cars/manufacturer/:manufacturer"
    ]
  });
});

app.use("/cars", carRoutes);

export default app;