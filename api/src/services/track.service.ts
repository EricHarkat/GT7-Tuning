import { Track } from "../models/track.model";

export class TrackService {
  static async getTracks(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [tracks, total] = await Promise.all([
      Track.find({})
        .skip(skip)
        .limit(limit)
        .sort({ course: 1, layout: 1 }),
      Track.countDocuments()
    ]);

    return {
      page,
      limit,
      total,
      tracks
    };
  }

  static async getTrackById(id: string) {
    return Track.findById(id);
  }

  static async searchTracks(query: string) {
    return Track.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { course: { $regex: query, $options: "i" } },
        { layout: { $regex: query, $options: "i" } },
        { country: { $regex: query, $options: "i" } }
      ]
    }).limit(50);
  }

  static async getTracksByCategory(category: string) {
    return Track.find({
      category: { $regex: `^${category}$`, $options: "i" }
    }).sort({ course: 1, layout: 1 });
  }
}