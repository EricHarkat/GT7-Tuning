import { Injectable } from '@angular/core';
import { InstalledParts } from './tuning-analysis.service';

export interface PPSuggestion {
  partLabel: string;
  from: string;
  fromLabel: string;
  to: string;
  toLabel: string;
  saving: number;
}

export interface PPBudgetResult {
  gap: number;           // positive = over limit, negative = under
  suggestions: PPSuggestion[];
}

// PP gained going from one tier to the next (index i → i+1)
const TIRES: { value: string; label: string }[] = [
  { value: 'comfort_hard',   label: 'Confort Dur' },
  { value: 'comfort_medium', label: 'Confort Médium' },
  { value: 'comfort_soft',   label: 'Confort Tendre' },
  { value: 'sports_hard',    label: 'Sport Dur' },
  { value: 'sports_medium',  label: 'Sport Médium' },
  { value: 'sports_soft',    label: 'Sport Tendre' },
  { value: 'racing_hard',    label: 'Racing Dur' },
  { value: 'racing_medium',  label: 'Racing Médium' },
  { value: 'racing_soft',    label: 'Racing Tendre' },
];
// PP cost to step UP from index i to i+1
const TIRE_STEP_PP = [4, 4, 7, 5, 5, 9, 5, 5];

interface PartTier { value: string; label: string }
interface PartDef { label: string; tiers: PartTier[]; stepCosts: number[] }

const PART_DEFS: Record<string, PartDef> = {
  suspension: {
    label: 'Suspension',
    tiers: [
      { value: 'stock',              label: 'Stock' },
      { value: 'sport',              label: 'Sport' },
      { value: 'fully_customizable', label: 'Entiérement réglable' },
    ],
    stepCosts: [8, 10],
  },
  differential: {
    label: 'Différentiel',
    tiers: [
      { value: 'stock',              label: 'Stock' },
      { value: 'lsd',                label: 'LSD' },
      { value: 'fully_customizable', label: 'Entiérement réglable' },
    ],
    stepCosts: [6, 6],
  },
  transmission: {
    label: 'Transmission',
    tiers: [
      { value: 'stock',              label: 'Stock' },
      { value: 'manual',             label: 'Manuelle' },
      { value: 'fully_customizable', label: 'Entiérement réglable' },
    ],
    stepCosts: [2, 6],
  },
  brakes: {
    label: 'Freins',
    tiers: [
      { value: 'stock',   label: 'Stock' },
      { value: 'sport',   label: 'Sport' },
      { value: 'racing',  label: 'Racing' },
    ],
    stepCosts: [5, 8],
  },
  ecu: {
    label: 'ECU',
    tiers: [
      { value: 'stock',              label: 'Stock' },
      { value: 'sports',             label: 'Sports' },
      { value: 'fully_customizable', label: 'Entiérement réglable' },
    ],
    stepCosts: [8, 10],
  },
  aero: {
    label: 'Aérodynamique',
    tiers: [
      { value: 'stock',  label: 'Stock' },
      { value: 'custom', label: 'Aéro personnalisée' },
    ],
    stepCosts: [10],
  },
};

@Injectable({ providedIn: 'root' })
export class PPBudgetService {
  analyze(parts: InstalledParts, currentPP: number, targetPP: number): PPBudgetResult {
    const gap = currentPP - targetPP;

    if (gap <= 0) {
      return { gap, suggestions: [] };
    }

    const suggestions: PPSuggestion[] = [];

    // Tires
    const tireIdx = TIRES.findIndex(t => t.value === parts.tires);
    if (tireIdx > 0) {
      const saving = TIRE_STEP_PP[tireIdx - 1];
      suggestions.push({
        partLabel: 'Pneus',
        from: TIRES[tireIdx].value,
        fromLabel: TIRES[tireIdx].label,
        to: TIRES[tireIdx - 1].value,
        toLabel: TIRES[tireIdx - 1].label,
        saving,
      });
    }

    // Other parts
    for (const [key, def] of Object.entries(PART_DEFS)) {
      const currentVal = (parts as Record<string, unknown>)[key] as string;
      const tierIdx = def.tiers.findIndex(t => t.value === currentVal);
      if (tierIdx > 0) {
        const saving = def.stepCosts[tierIdx - 1];
        suggestions.push({
          partLabel: def.label,
          from: def.tiers[tierIdx].value,
          fromLabel: def.tiers[tierIdx].label,
          to: def.tiers[tierIdx - 1].value,
          toLabel: def.tiers[tierIdx - 1].label,
          saving,
        });
      }
    }

    // Sort by highest PP saving first
    suggestions.sort((a, b) => b.saving - a.saving);

    return { gap, suggestions };
  }
}
