export interface Car {
  _id: string;
  pageUrl?: string;
  game?: string;
  group?: string | null;
  imageAlt?: string;
  imageUrl?: string;
  manufacturer?: string;
  name?: string;
  pageTitle?: string;
  source?: string;
  category?: 'road' | 'race' | 'concept' | string;
  engineType?: 'NA' | 'Turbo' | 'Supercharged' | 'Electric' | 'Hybrid' | string | null;

  specs?: Record<string, unknown>;
  rawSpecs?: Record<string, unknown>;

  normalized?: {
    powerHp?: number | null;
    weightKg?: number | null;
    torque?: number | null;
    pp?: number | null;
    year?: number | null;
    drivetrain?: string | null;
    metrics?: {
      powerToWeight?: number | null;
      weightToPower?: number | null;
    };
    raw?: {
      power?: string | null;
      weight?: string | null;
      torque?: string | null;
      drivetrain?: string | null;
      pp?: string | null;
      year?: string | null;
    };
  };
}