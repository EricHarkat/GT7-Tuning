export interface Track {
  _id: string;
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
  lengthRaw?: string;
}