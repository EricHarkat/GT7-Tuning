import { Injectable } from '@angular/core';
import { Car } from '../models/car';
import { Track } from '../models/track';

export interface InstalledParts {
  suspension?: 'stock' | 'sport' | 'fully_customizable';
  differential?: 'stock' | 'lsd' | 'fully_customizable';
  transmission?: 'stock' | 'manual' | 'fully_customizable';
  aero?: 'stock' | 'custom';
  brakes?: 'stock' | 'sport' | 'racing';
  tires?: string;
  ballast?: boolean;
  ecu?: 'stock' | 'sports' | 'fully_customizable';
  powerRestrictor?: boolean;
}

export interface SetupValues {
  tires: string;
  aero?: {
    front: string;
    rear: string;
  };
  rideHeight?: {
    front: string;
    rear: string;
  };
  naturalFrequency?: {
    front: string;
    rear: string;
  };
  antiRollBars?: {
    front: number;
    rear: number;
  };
  dampers?: {
    frontCompression: number;
    rearCompression: number;
    frontExpansion: number;
    rearExpansion: number;
  };
  camber?: {
    front: string;
    rear: string;
  };
  toe?: {
    front: string;
    rear: string;
  };
  lsd?: {
    initial?: string;
    acceleration?: string;
    braking?: string;
    front?: {
      initial: string;
      acceleration: string;
      braking: string;
    };
    rear?: {
      initial: string;
      acceleration: string;
      braking: string;
    };
    centerSplit?: string;
  };
  transmission?: string;
  brakeBalance?: string;
}

export interface TuningAnalysis {
  behavior: string;
  risks: string[];
  priorities: string[];
  recommendations: string[];
  requiredParts: string[];
  setupValues: SetupValues;
}

@Injectable({
  providedIn: 'root'
})
export class TuningAnalysisService {
  analyze(
    car: Car,
    track?: Track | null,
    parts: InstalledParts = {}
  ): TuningAnalysis {
    const drivetrain = car.normalized?.drivetrain;
    const trackCategory = track?.category;
    const powerToWeight = car.normalized?.metrics?.powerToWeight || 0;

    const risks: string[] = [];
    const priorities: string[] = [];
    const recommendations: string[] = [];
    const requiredParts: string[] = [];

    let behavior = 'Comportement global équilibré';

    const hasFullSuspension = parts.suspension === 'fully_customizable';
    const hasFullDiff = parts.differential === 'fully_customizable';
    const hasFullTransmission = parts.transmission === 'fully_customizable';
    const hasAero = parts.aero === 'custom';
    const hasRacingBrakes = parts.brakes === 'racing';

    const setupValues: SetupValues = {
      tires: this.getTireLabel(parts.tires),
      naturalFrequency: this.getNaturalFrequencyBaseline(parts.tires),
      antiRollBars: this.getArbBaseline(drivetrain, parts.tires, car.normalized?.weightKg),
      dampers: {
        frontCompression: 30,
        rearCompression: 30,
        frontExpansion: 40,
        rearExpansion: 40
      },
      camber: this.getCamberBaseline(parts.tires),
      toe: {
        front: '0.00°',
        rear: '+0.05°'
      },
      brakeBalance: this.getBrakeBalanceBaseline(drivetrain)
    };

    if (hasAero) {
      setupValues.aero = this.getAeroBaseline(trackCategory);
    } else {
      requiredParts.push('Pièces aérodynamiques réglables');
    }

    if (hasFullSuspension) {
      setupValues.rideHeight = {
        front: '3–5 clicks au-dessus du minimum',
        rear: '5–8 clicks au-dessus du minimum'
      };
    } else {
      requiredParts.push('Suspension entièrement personnalisable');
    }

    if (hasFullDiff) {
      setupValues.lsd = this.getLsdBaseline(drivetrain);
    } else {
      requiredParts.push('Différentiel entièrement personnalisable');
    }

    if (hasFullTransmission) {
      setupValues.transmission =
        trackCategory === 'high_speed'
          ? 'Allonger la boîte pour atteindre le rupteur à la fin de la plus longue ligne droite'
          : 'Raccourcir la boîte pour améliorer les relances en sortie de virage';
    } else {
      requiredParts.push('Boîte entièrement personnalisable');
    }

    if (drivetrain === 'FWD') {
      behavior = 'Tendance probable au sous-virage';
      risks.push('Manque de rotation en entrée et milieu de virage');
      priorities.push('Améliorer la rotation du train arrière');
      priorities.push('Préserver le grip du train avant');

      recommendations.push('Base ARB recommandée : avant 4 / arrière 6');
      recommendations.push('Utiliser un léger rake pour aider la rotation');

      if (hasRacingBrakes) {
        recommendations.push('Déplacer légèrement la balance de freinage vers l’arrière');
      }
    }

    if (drivetrain === 'RWD') {
      behavior = 'Tendance possible au survirage';
      risks.push('Perte de motricité en sortie de virage');
      priorities.push('Stabiliser le train arrière');
      priorities.push('Améliorer la progressivité à l’accélération');

      recommendations.push('Base ARB recommandée : avant 6 / arrière 4');
      recommendations.push('Si l’arrière glisse en sortie, réduire progressivement le LSD accélération');
    }

    if (drivetrain === 'AWD') {
      behavior = 'Bonne motricité, risque de sous-virage';
      risks.push('Sous-virage à l’accélération');
      priorities.push('Aider la voiture à pivoter');
      priorities.push('Répartir la motricité sans saturer le train avant');

      recommendations.push('Base ARB recommandée : avant 5 / arrière 5');
      recommendations.push('Garder le LSD avant assez ouvert pour préserver le turn-in');
    }

    if (powerToWeight >= 0.35) {
      risks.push('Voiture très puissante par rapport à son poids');
      priorities.push('Contrôler la motricité et la stabilité');

      if (!parts.powerRestrictor) {
        requiredParts.push('Limiteur de puissance');
        recommendations.push('Ajouter un limiteur de puissance si la voiture est difficile à doser');
      }
    }

    if (trackCategory === 'technical') {
      risks.push('Perte de temps possible dans les virages lents');
      priorities.push('Rotation en virage lent');
      priorities.push('Relance propre en sortie');

      recommendations.push('Favoriser une boîte plus courte');
      recommendations.push('Privilégier la rotation plutôt que la vitesse de pointe');
    }

    if (trackCategory === 'high_speed') {
      risks.push('Instabilité possible à haute vitesse');
      priorities.push('Vitesse de pointe');
      priorities.push('Stabilité dans les grandes courbes');

      recommendations.push('Réduire l’appui seulement si la voiture reste stable');
      recommendations.push('Allonger la boîte pour exploiter les longues lignes droites');
    }

    if (trackCategory === 'rally') {
      behavior = 'Priorité à la traction et à l’absorption des bosses';
      risks.push('Perte d’adhérence sur surface irrégulière');
      priorities.push('Traction');
      priorities.push('Suspension permissive');

      recommendations.push('Assouplir la suspension');
      recommendations.push('Augmenter la garde au sol');
    }

    if (track?.rain) {
      risks.push('Perte d’adhérence sur piste humide');
      priorities.push('Motricité et progressivité');

      recommendations.push('Éviter les réglages trop agressifs sur différentiel et suspension');
      recommendations.push('Privilégier des pneus adaptés à la pluie');
    }

    return {
      behavior,
      risks: this.unique(risks),
      priorities: this.unique(priorities),
      recommendations: this.unique(recommendations),
      requiredParts: this.unique(requiredParts),
      setupValues
    };
  }

  private getAeroBaseline(trackCategory?: string) {
    if (trackCategory === 'high_speed') {
      return {
        front: '10–30% de la plage',
        rear: '20–40% de la plage'
      };
    }

    if (trackCategory === 'technical') {
      return {
        front: '70–80% de la plage',
        rear: '90–100% de la plage'
      };
    }

    return {
      front: '40–60% de la plage',
      rear: '55–75% de la plage'
    };
  }

  private getNaturalFrequencyBaseline(tires?: string) {
    switch (tires) {
      case 'comfort_hard':
      case 'comfort_medium':
      case 'comfort_soft':
        return { front: '25–40% de la plage', rear: 'Même position relative' };

      case 'sports_hard':
        return { front: '40–45% de la plage', rear: 'Même position relative' };

      case 'sports_medium':
        return { front: '45–50% de la plage', rear: 'Même position relative' };

      case 'sports_soft':
        return { front: '55–60% de la plage', rear: 'Même position relative' };

      case 'racing_hard':
        return { front: '60–65% de la plage', rear: 'Même position relative' };

      case 'racing_medium':
        return { front: '65–75% de la plage', rear: 'Même position relative' };

      case 'racing_soft':
        return { front: '75–85% de la plage', rear: 'Même position relative' };

      case 'intermediate':
        return { front: '40–45% de la plage', rear: 'Même position relative' };

      case 'racing_wet':
        return { front: '30–35% de la plage', rear: 'Même position relative' };

      default:
        return { front: '45–50% de la plage', rear: 'Même position relative' };
    }
  }

  private getArbBaseline(
    drivetrain?: string | null,
    tires?: string,
    weightKg?: number | null
  ) {
    let front = 5;
    let rear = 5;

    if (drivetrain === 'FWD') {
      front = 4;
      rear = 6;
    }

    if (drivetrain === 'RWD') {
      front = 6;
      rear = 4;
    }

    if (drivetrain === 'AWD') {
      front = 5;
      rear = 5;
    }

    if (tires?.startsWith('racing')) {
      front += 2;
      rear += 2;
    }

    if ((weightKg || 0) > 1500) {
      front += 1;
      rear += 1;
    }

    return {
      front: Math.min(front, 10),
      rear: Math.min(rear, 10)
    };
  }

  private getCamberBaseline(tires?: string) {
    if (tires?.startsWith('comfort')) {
      return {
        front: '-0.8° à -1.5°',
        rear: '-0.5° à -1.0°'
      };
    }

    if (tires?.startsWith('racing')) {
      return {
        front: '-2.0° à -2.5°',
        rear: '-1.5° à -2.0°'
      };
    }

    if (tires === 'intermediate' || tires === 'racing_wet') {
      return {
        front: '-1.0° à -1.2°',
        rear: '-0.5° à -0.8°'
      };
    }

    return {
      front: '-1.5° à -2.0°',
      rear: '-1.0° à -1.5°'
    };
  }

  private getLsdBaseline(drivetrain?: string | null): SetupValues['lsd'] {
    if (drivetrain === 'FWD') {
      return {
        initial: '10',
        acceleration: '35',
        braking: '8'
      };
    }

    if (drivetrain === 'RWD') {
      return {
        initial: '5',
        acceleration: '25',
        braking: '10'
      };
    }

    if (drivetrain === 'AWD') {
      return {
        front: {
          initial: '5',
          acceleration: '10',
          braking: '5'
        },
        rear: {
          initial: '8',
          acceleration: '20',
          braking: '10'
        },
        centerSplit: '30/70'
      };
    }

    return {
      initial: '5–10',
      acceleration: '20–35',
      braking: '5–15'
    };
  }

  private getBrakeBalanceBaseline(drivetrain?: string | null): string {
    if (drivetrain === 'FWD') {
      return '1–2 clicks vers l’arrière';
    }

    if (drivetrain === 'RWD') {
      return 'Défaut ou 1 click vers l’arrière';
    }

    if (drivetrain === 'AWD') {
      return 'Défaut';
    }

    return 'Défaut';
  }

  private getTireLabel(tires?: string): string {
    const labels: Record<string, string> = {
      comfort_hard: 'Comfort Hard',
      comfort_medium: 'Comfort Medium',
      comfort_soft: 'Comfort Soft',
      sports_hard: 'Sports Hard',
      sports_medium: 'Sports Medium',
      sports_soft: 'Sports Soft',
      racing_hard: 'Racing Hard',
      racing_medium: 'Racing Medium',
      racing_soft: 'Racing Soft',
      intermediate: 'Intermediate',
      racing_wet: 'Racing Wet',
      dirt: 'Dirt'
    };

    return labels[tires || ''] || 'Non défini';
  }

  private unique(values: string[]): string[] {
    return [...new Set(values)];
  }
}