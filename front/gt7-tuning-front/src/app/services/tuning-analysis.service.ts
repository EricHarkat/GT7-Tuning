import { Injectable } from '@angular/core';
import { Car } from '../models/car';
import { Track } from '../models/track';

export interface TuningAnalysis {
  behavior: string;
  risks: string[];
  priorities: string[];
  recommendations: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TuningAnalysisService {
  analyze(car: Car, track?: Track | null): TuningAnalysis {
    const drivetrain = car.normalized?.drivetrain;
    const category = track?.category;

    const risks: string[] = [];
    const priorities: string[] = [];
    const recommendations: string[] = [];

    let behavior = 'Comportement global équilibré';

    if (drivetrain === 'FWD') {
      behavior = 'Tendance probable au sous-virage';
      risks.push('Manque de rotation en entrée et milieu de virage');
      priorities.push('Améliorer la rotation');
      recommendations.push('Augmenter légèrement la rigidité arrière');
      recommendations.push('Ajuster le freinage vers l’arrière avec prudence');
    }

    if (drivetrain === 'RWD') {
      behavior = 'Tendance possible au survirage';
      risks.push('Perte de motricité en sortie de virage');
      priorities.push('Stabiliser le train arrière');
      recommendations.push('Réduire progressivement le LSD accélération si la voiture glisse en sortie');
      recommendations.push('Assouplir légèrement l’arrière si la voiture est trop nerveuse');
    }

    if (drivetrain === 'AWD') {
      behavior = 'Bonne motricité, risque de sous-virage';
      risks.push('Sous-virage à l’accélération');
      priorities.push('Aider la voiture à pivoter');
      recommendations.push('Réduire légèrement la rigidité avant ou augmenter la rotation arrière');
    }

    if (category === 'technical') {
      priorities.push('Rotation en virage lent');
      recommendations.push('Favoriser une boîte plus courte pour les relances');
      recommendations.push('Chercher de la stabilité au freinage');
    }

    if (category === 'high_speed') {
      priorities.push('Vitesse de pointe et stabilité haute vitesse');
      recommendations.push('Réduire l’appui si la voiture est stable');
      recommendations.push('Allonger la boîte pour exploiter les lignes droites');
    }

    if (category === 'rally') {
      priorities.push('Traction et absorption des bosses');
      recommendations.push('Assouplir la suspension');
      recommendations.push('Augmenter la garde au sol');
    }

    if (track?.rain) {
      risks.push('Perte d’adhérence sur piste humide');
      priorities.push('Motricité et progressivité');
      recommendations.push('Adoucir les réglages agressifs pour améliorer la stabilité');
    }

    return {
      behavior,
      risks: [...new Set(risks)],
      priorities: [...new Set(priorities)],
      recommendations: [...new Set(recommendations)]
    };
  }
}