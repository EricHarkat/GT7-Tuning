import mongoose, { Document } from "mongoose";

export interface TrackDocument extends Document {
  course?: string;
  layout?: string;
  name?: string;
  country?: string;
  trackType?: string;
  category?: string;
  lengthMeters?: number;
  reversible?: boolean | null;
  rain?: boolean | null;
  gtSophy?: string;
  image?: string;
  sourceUrl?: string;
}

const trackSchema = new mongoose.Schema(
  {},
  {
    strict: false,
    collection: "tracks"
  }
);

export const Track = mongoose.model<TrackDocument>("Track", trackSchema);