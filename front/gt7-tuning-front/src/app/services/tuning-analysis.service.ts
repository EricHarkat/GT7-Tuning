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

export interface TuningAnalysis {
  behavior: string;
  risks: string[];
  priorities: string[];
  recommendations: string[];
  requiredParts: string[];
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

    if (drivetrain === 'FWD') {
      behavior = 'Tendance probable au sous-virage';
      risks.push('Manque de rotation en entrée et milieu de virage');
      priorities.push('Améliorer la rotation du train arrière');
      priorities.push('Préserver le grip du train avant');

      if (hasFullSuspension) {
        recommendations.push('Augmenter légèrement la rigidité arrière pour aider la voiture à pivoter');
        recommendations.push('Ajuster la barre anti-roulis arrière vers plus de rotation');
      } else {
        requiredParts.push('Suspension entièrement personnalisable');
        recommendations.push('Installer une suspension entièrement personnalisable pour agir sur la rotation');
      }

      if (hasRacingBrakes) {
        recommendations.push('Déplacer légèrement la balance de freinage vers l’arrière avec prudence');
      } else {
        recommendations.push('Si le sous-virage apparaît au freinage, envisager des freins plus réglables');
      }
    }

    if (drivetrain === 'RWD') {
      behavior = 'Tendance possible au survirage';
      risks.push('Perte de motricité en sortie de virage');
      priorities.push('Stabiliser le train arrière');
      priorities.push('Améliorer la progressivité à l’accélération');

      if (hasFullDiff) {
        recommendations.push('Réduire progressivement le LSD accélération si la voiture glisse en sortie');
        recommendations.push('Augmenter légèrement le LSD freinage si l’arrière devient instable à l’entrée');
      } else {
        requiredParts.push('Différentiel entièrement personnalisable');
        recommendations.push('Installer un différentiel entièrement personnalisable pour régler la motricité arrière');
      }

      if (hasFullSuspension) {
        recommendations.push('Assouplir légèrement l’arrière si la voiture est trop nerveuse');
      } else {
        requiredParts.push('Suspension entièrement personnalisable');
        recommendations.push('Installer une suspension entièrement personnalisable pour stabiliser le train arrière');
      }
    }

    if (drivetrain === 'AWD') {
      behavior = 'Bonne motricité, risque de sous-virage';
      risks.push('Sous-virage à l’accélération');
      priorities.push('Aider la voiture à pivoter');
      priorities.push('Répartir la motricité sans saturer le train avant');

      if (hasFullDiff) {
        recommendations.push('Adoucir le comportement du différentiel avant si la voiture tire tout droit en sortie');
      } else {
        requiredParts.push('Différentiel entièrement personnalisable');
        recommendations.push('Installer un différentiel réglable pour mieux gérer la motricité AWD');
      }

      if (hasFullSuspension) {
        recommendations.push('Réduire légèrement la rigidité avant ou augmenter la rotation arrière');
      } else {
        recommendations.push('Commencer par améliorer les pneus et la suspension avant de chercher plus de puissance');
      }
    }

    if (powerToWeight >= 0.35) {
      risks.push('Voiture très puissante par rapport à son poids');
      priorities.push('Contrôler la motricité et la stabilité');

      if (!hasFullDiff) {
        requiredParts.push('Différentiel entièrement personnalisable');
      }

      if (!parts.powerRestrictor) {
        requiredParts.push('Limiteur de puissance');
        recommendations.push('Ajouter un limiteur de puissance si la voiture est difficile à doser');
      }
    }

    if (trackCategory === 'technical') {
      risks.push('Perte de temps possible dans les virages lents');
      priorities.push('Rotation en virage lent');
      priorities.push('Relance propre en sortie');

      if (hasFullTransmission) {
        recommendations.push('Raccourcir légèrement la boîte pour améliorer les relances');
      } else {
        requiredParts.push('Boîte entièrement personnalisable');
        recommendations.push('Installer une boîte entièrement personnalisable pour adapter les rapports au circuit technique');
      }

      if (hasFullSuspension) {
        recommendations.push('Chercher une voiture plus vive en entrée sans rendre l’arrière instable');
      }
    }

    if (trackCategory === 'high_speed') {
      risks.push('Instabilité possible à haute vitesse');
      priorities.push('Vitesse de pointe');
      priorities.push('Stabilité dans les grandes courbes');

      if (hasFullTransmission) {
        recommendations.push('Allonger la boîte pour exploiter les longues lignes droites');
      } else {
        requiredParts.push('Boîte entièrement personnalisable');
        recommendations.push('Installer une boîte entièrement personnalisable pour ajuster la vitesse maximale');
      }

      if (hasAero) {
        recommendations.push('Réduire légèrement l’appui si la voiture reste stable à haute vitesse');
      } else {
        requiredParts.push('Pièces aérodynamiques réglables');
        recommendations.push('Ajouter des pièces aérodynamiques si la voiture devient instable dans les grandes courbes');
      }
    }

    if (trackCategory === 'rally') {
      behavior = 'Priorité à la traction et à l’absorption des bosses';
      risks.push('Perte d’adhérence sur surface irrégulière');
      priorities.push('Traction');
      priorities.push('Suspension permissive');

      if (hasFullSuspension) {
        recommendations.push('Assouplir la suspension pour mieux absorber les bosses');
        recommendations.push('Augmenter la garde au sol');
      } else {
        requiredParts.push('Suspension entièrement personnalisable');
        recommendations.push('Installer une suspension réglable pour adapter la voiture aux surfaces irrégulières');
      }
    }

    if (track?.rain) {
      risks.push('Perte d’adhérence sur piste humide');
      priorities.push('Motricité et progressivité');

      recommendations.push('Éviter les réglages trop agressifs sur différentiel et suspension');
      recommendations.push('Privilégier des pneus adaptés à la pluie si disponibles');

      if (hasFullDiff) {
        recommendations.push('Adoucir le LSD accélération pour limiter les pertes de traction sous la pluie');
      }
    }

    return {
      behavior,
      risks: this.unique(risks),
      priorities: this.unique(priorities),
      recommendations: this.unique(recommendations),
      requiredParts: this.unique(requiredParts)
    };
  }

  private unique(values: string[]): string[] {
    return [...new Set(values)];
  }
}