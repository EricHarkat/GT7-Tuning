import { Injectable } from '@angular/core';
import { Car } from '../models/car';
import { Track } from '../models/track';
import { InstalledParts } from './tuning-analysis.service';

export interface TuningStep {
  id: number;
  title: string;
  description: string;
  recommendations: string[];
}

@Injectable({
  providedIn: 'root',
})
export class GuidedTuning {
  generateSteps(
    car: Car,
    track: Track | null,
    parts: InstalledParts
  ): TuningStep[] {
    const steps: TuningStep[] = [];

    // STEP 0 - TIRES
    steps.push({
      id: 0,
      title: 'Pneus',
      description: 'Tout dépend du niveau de grip.',
      recommendations: [
        `Pneus actuels : ${parts.tires}`,
        'Les pneus définissent toute la base du setup',
        'Plus de grip = suspension plus rigide'
      ]
    });

    // STEP 1 - AERO
    steps.push({
      id: 1,
      title: 'Aérodynamique',
      description: 'Détermine la charge sur la suspension',
      recommendations: track?.category === 'high_speed'
        ? ['Utiliser peu d’appui pour maximiser la vitesse de pointe']
        : ['Ajouter de l’appui pour améliorer le grip en virage']
    });

    // STEP 2 - RIDE HEIGHT
    steps.push({
      id: 2,
      title: 'Hauteur de caisse',
      description: 'Base du comportement de la voiture',
      recommendations: [
        'Commencer proche du minimum',
        'Ajouter du rake (arrière plus haut) pour améliorer la rotation'
      ]
    });

    // STEP 3 - SUSPENSION
    if (parts.suspension === 'fully_customizable') {
      steps.push({
        id: 3,
        title: 'Suspension',
        description: 'Contrôle le grip et les transferts de masse',
        recommendations: [
          'Adapter la rigidité selon les pneus',
          'Voiture puissante → suspension plus rigide'
        ]
      });
    } else {
      steps.push({
        id: 3,
        title: 'Suspension',
        description: 'Non disponible',
        recommendations: [
          'Installer une suspension entièrement personnalisable'
        ]
      });
    }

    // STEP 4 - LSD
    if (parts.differential === 'fully_customizable') {
      steps.push({
        id: 4,
        title: 'Différentiel (LSD)',
        description: 'Contrôle la motricité',
        recommendations: [
          'Réduire LSD accel si survirage',
          'Augmenter LSD accel si perte de traction'
        ]
      });
    } else {
      steps.push({
        id: 4,
        title: 'Différentiel',
        description: 'Non disponible',
        recommendations: [
          'Installer un LSD entièrement personnalisable'
        ]
      });
    }

    // STEP 5 - TRANSMISSION
    if (parts.transmission === 'fully_customizable') {
      steps.push({
        id: 5,
        title: 'Transmission',
        description: 'Adaptation au circuit',
        recommendations: track?.category === 'high_speed'
          ? ['Allonger la boîte']
          : ['Raccourcir la boîte']
      });
    }

    return steps;
  }
}
