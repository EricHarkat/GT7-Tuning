import { Request, Response } from "express";
import { TrackService } from "../services/track.service";

export class TrackController {
  static async getTracks(req: Request, res: Response) {
    const limit = Number(req.query.limit) || 25;
    const page = Number(req.query.page) || 1;

    const result = await TrackService.getTracks(page, limit);
    res.json(result);
  }

  static async getTrackById(req: Request, res: Response) {
    const track = await TrackService.getTrackById(req.params.id);

    if (!track) {
      return res.status(404).json({
        message: "Circuit introuvable"
      });
    }

    res.json(track);
  }

  static async searchTracks(req: Request, res: Response) {
    const q = String(req.query.q || "");

    const tracks = await TrackService.searchTracks(q);
    res.json(tracks);
  }

  static async getTracksByCategory(req: Request, res: Response) {
    const tracks = await TrackService.getTracksByCategory(req.params.category);
    res.json(tracks);
  }
}