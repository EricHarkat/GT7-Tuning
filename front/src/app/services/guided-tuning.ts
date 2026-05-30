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
    const drivetrain = car.normalized?.drivetrain;
    const powerToWeight = car.normalized?.metrics?.powerToWeight ?? 0;
    const weightKg = car.normalized?.weightKg ?? 0;
    const isHighPower = powerToWeight >= 0.35;
    const isHeavy = weightKg > 1500;
    const isElectric = car.engineType === 'Electric' || car.engineType === 'Hybrid';

    // STEP 0 - TIRES
    const tireRecs = [
      `Pneus actuels : ${parts.tires}`,
      'Les pneus definissent toute la base du setup — changer les pneus impose de revoir tous les autres reglages',
      'Plus de grip = suspension plus rigide'
    ];
    if (isElectric) {
      tireRecs.push('Moteur electrique : couple instantane — preferer des pneus avec un bon grip lateral');
    }
    steps.push({ id: 0, title: 'Pneus', description: 'Tout depend du niveau de grip.', recommendations: tireRecs });

    // STEP 1 - AERO
    const aeroRecs: string[] = [];
    if (parts.aero !== 'custom') {
      aeroRecs.push('Installer des pieces aerodynamiques reglables pour acceder a ce parametre');
    } else if (track?.category === 'high_speed') {
      aeroRecs.push('Circuit rapide : reduire l\'appui pour maximiser la vitesse de pointe');
      aeroRecs.push('Verifier la stabilite a haute vitesse avant de reduire trop l\'appui arriere');
    } else {
      aeroRecs.push('Ajouter de l\'appui pour ameliorer le grip en virage');
      if (track?.category === 'technical') {
        aeroRecs.push('Circuit technique : monter l\'appui au maximum pour compenser les freinages tardifs');
      }
    }
    steps.push({ id: 1, title: 'Aerodynamique', description: 'Determine la charge aerodynamique sur la suspension.', recommendations: aeroRecs });

    // STEP 2 - RIDE HEIGHT
    const rideRecs = [
      'Commencer proche du minimum autorise',
      'Ajouter du rake (arriere legerement plus haut) pour ameliorer la rotation en entree de virage'
    ];
    if (isHeavy) {
      rideRecs.push(`Voiture lourde (${weightKg} kg) : eviter de descendre trop bas pour preserver la suspension`);
    }
    steps.push({ id: 2, title: 'Hauteur de caisse', description: 'Base du comportement de la voiture.', recommendations: rideRecs });

    // STEP 3 - SUSPENSION
    if (parts.suspension === 'fully_customizable') {
      const suspRecs: string[] = [];
      if (isHighPower) {
        suspRecs.push(`Rapport puissance/poids eleve (${powerToWeight.toFixed(2)} HP/kg) — rigidifier la suspension pour limiter les transferts de masse`);
      }
      suspRecs.push('Adapter la frequence naturelle selon les pneus : plus de grip = frequence plus haute');
      if (drivetrain === 'FWD') {
        suspRecs.push('Train avant sollicite en traction et en direction : ne pas trop rigidifier l\'avant');
      }
      if (drivetrain === 'RWD') {
        suspRecs.push('Arriere legerement plus souple que l\'avant pour aider la rotation');
      }
      steps.push({ id: 3, title: 'Suspension', description: 'Controle le grip et les transferts de masse.', recommendations: suspRecs });
    } else {
      steps.push({ id: 3, title: 'Suspension', description: 'Non disponible.', recommendations: ['Installer une suspension entierement personnalisable pour acceder a ces reglages'] });
    }

    // STEP 4 - LSD
    if (parts.differential === 'fully_customizable') {
      const lsdRecs: string[] = [];
      if (drivetrain === 'RWD') {
        lsdRecs.push('Reduire le LSD acceleration si la voiture survire en sortie de virage');
        lsdRecs.push('Augmenter le LSD acceleration si la roue interieure patine');
        if (isHighPower) lsdRecs.push('Puissance elevee : commencer avec un LSD acceleration modere (~25) pour eviter le survirage brutal');
      }
      if (drivetrain === 'FWD') {
        lsdRecs.push('LSD initial eleve (~10) pour ameliorer la rotation du train avant');
        lsdRecs.push('LSD freinage bas (~8) pour eviter l\'instabilite au freinage');
      }
      if (drivetrain === 'AWD') {
        lsdRecs.push('Garder le LSD avant ouvert (acceleration ~10) pour preserver le turn-in');
        lsdRecs.push('Repartition centrale : favoriser l\'arriere (ex. 30/70) pour plus de motricite');
        if (isElectric) lsdRecs.push('Moteur electrique : couple instantane — LSD arriere acceleration pas trop eleve (~20 max)');
      }
      steps.push({ id: 4, title: 'Differentiel (LSD)', description: 'Controle la motricite et la stabilite.', recommendations: lsdRecs });
    } else {
      steps.push({ id: 4, title: 'Differentiel', description: 'Non disponible.', recommendations: ['Installer un LSD entierement personnalisable pour acceder a ces reglages'] });
    }

    // STEP 5 - TRANSMISSION
    if (parts.transmission === 'fully_customizable') {
      const transRecs: string[] = [];
      if (track?.category === 'high_speed') {
        transRecs.push('Allonger la boite pour atteindre le rupteur en fin de ligne droite');
      } else if (track?.category === 'technical') {
        transRecs.push('Raccourcir la boite pour ameliorer les relances en sortie de virage lent');
      } else {
        transRecs.push('Adapter le rapport final selon le circuit : court pour les virages, long pour les lignes droites');
      }
      if (isElectric) {
        transRecs.push('Moteur electrique : boite moins critique — se concentrer sur le rapport final');
      }
      steps.push({ id: 5, title: 'Transmission', description: 'Adaptation du ratio au circuit.', recommendations: transRecs });
    }

    return steps;
  }
}
