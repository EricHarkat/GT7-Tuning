import { InstalledParts } from '../services/tuning-analysis.service';
import { Symptom } from './behavior-feedback';

export interface SavedSetup {
  id: string;
  carId: string;
  carName: string;
  name: string;
  savedAt: string;
  parts: InstalledParts;
  trackId?: string;
  trackName?: string;
  symptoms: Symptom[];
  notes?: string;
}
