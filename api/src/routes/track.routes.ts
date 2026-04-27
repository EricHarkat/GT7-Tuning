import { Router } from "express";
import { TrackController } from "../controllers/track.controller";

const router = Router();

router.get("/", TrackController.getTracks);
router.get("/search", TrackController.searchTracks);
router.get("/category/:category", TrackController.getTracksByCategory);
router.get("/:id", TrackController.getTrackById);

export default router;