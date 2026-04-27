import { Track } from "../models/track.model";

type TrackFilters = {
  search?: string;
  category?: string;
  trackType?: string;
  rain?: string;
  reversible?: string;
};

export class TrackService {
  static async getTracks(page: number, limit: number, filters: TrackFilters = {}) {
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { course: { $regex: filters.search, $options: "i" } },
        { layout: { $regex: filters.search, $options: "i" } }
      ];
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.trackType) {
      query.trackType = filters.trackType;
    }

    if (filters.rain === "true") {
      query.rain = true;
    }

    if (filters.reversible === "true") {
      query.reversible = true;
    }

    const [tracks, total] = await Promise.all([
      Track.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ course: 1, layout: 1 }),
      Track.countDocuments(query)
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