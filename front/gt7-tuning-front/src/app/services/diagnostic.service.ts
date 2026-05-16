import { Injectable } from '@angular/core';
import { Car } from '../models/car';
import { DiagnosticResult, Symptom } from '../models/behavior-feedback';
import { InstalledParts } from './tuning-analysis.service';

@Injectable({ providedIn: 'root' })
export class DiagnosticService {
  diagnose(
    symptoms: Symptom[],
    car: Car,
    parts: InstalledParts
  ): DiagnosticResult[] {
    if (!symptoms.length) return [];

    const drivetrain = car.normalized?.drivetrain;
    const hasFullSuspension = parts.suspension === 'fully_customizable';
    const hasFullDiff = parts.differential === 'fully_customizable';
    const hasAero = parts.aero === 'custom';

    return symptoms.map((symptom) =>
      this.diagnoseSymptom(symptom, drivetrain, parts, hasFullSuspension, hasFullDiff, hasAero)
    );
  }

  private diagnoseSymptom(
    symptom: Symptom,
    drivetrain: string | null | undefined,
    parts: InstalledParts,
    hasFullSuspension: boolean,
    hasFullDiff: boolean,
    hasAero: boolean
  ): DiagnosticResult {
    const recs: string[] = [];

    switch (symptom) {
      case 'understeer_entry': {
        recs.push('Reduire la rigidite de la suspension avant (frequence naturelle plus basse)');
        recs.push('Augmenter le rake : abaisser l\'avant ou relever l\'arriere pour aider la rotation');
        recs.push('Reduire l\'ARB avant de 1-2 crans');
        if (hasFullDiff && drivetrain === 'FWD') {
          recs.push('Reduire le LSD initial : un differentiel trop ferme bloque la rotation du train avant');
        }
        if (hasAero) {
          recs.push('Augmenter legerement l\'appui avant pour ameliorer la mise en virage');
        }
        break;
      }

      case 'understeer_mid': {
        recs.push('Reduire l\'ARB avant de 1-2 crans');
        recs.push('Augmenter le carrossage avant (plus negatif) pour maximiser le contact en virage');
        recs.push('Verifier la hauteur de caisse : un avant trop haut reduit le grip lateral');
        if (hasFullSuspension) {
          recs.push('Reduire la compression avant pour permettre plus de transfert de charge lateral');
        }
        break;
      }

      case 'understeer_exit': {
        if (hasFullDiff) {
          if (drivetrain === 'FWD' || drivetrain === 'AWD') {
            recs.push('Reduire le LSD acceleration avant : un diff trop ferme pousse la voiture tout droit');
          }
          if (drivetrain === 'AWD') {
            recs.push('Deplacer la repartition centrale vers l\'arriere (ex. 40/60 -> 30/70)');
          }
        }
        recs.push('Reduire la puissance progressivement en sortie de virage avant d\'accelerer pleinement');
        recs.push('Augmenter l\'ARB arriere de 1 cran pour rigidifier l\'arriere et liberer l\'avant');
        break;
      }

      case 'oversteer_entry': {
        recs.push('Augmenter la rigidite de la suspension arriere (frequence naturelle plus haute a l\'arriere)');
        recs.push('Reduire le rake : rapprocher avant et arriere pour stabiliser l\'entree');
        recs.push('Augmenter l\'ARB arriere de 1-2 crans');
        if (hasFullDiff && (drivetrain === 'RWD' || drivetrain === 'AWD')) {
          recs.push('Augmenter le LSD freinage pour stabiliser l\'arriere au lever de pied');
        }
        if (hasAero) {
          recs.push('Augmenter l\'appui arriere');
        }
        break;
      }

      case 'oversteer_exit': {
        if (hasFullDiff && drivetrain === 'RWD') {
          recs.push('Reduire le LSD acceleration : descendre de 5 crans et re-evaluer');
          recs.push('Si le probleme persiste, reduire encore jusqu\'a trouver l\'equilibre');
        }
        if (hasFullDiff && drivetrain === 'AWD') {
          recs.push('Reduire le LSD acceleration arriere');
          recs.push('Augmenter legerement la repartition vers l\'avant pour lisser la motricite');
        }
        recs.push('Augmenter l\'ARB avant de 1 cran pour stabiliser l\'arriere a l\'acceleration');
        if (hasFullSuspension) {
          recs.push('Augmenter la compression arriere pour freiner le transfert de masse vers l\'arriere');
        }
        break;
      }

      case 'oversteer_braking': {
        recs.push('Deplacer la balance de freinage vers l\'avant (1-2 crans)');
        if (hasFullDiff) {
          recs.push('Augmenter le LSD freinage pour bloquer moins le differentiel au freinage');
        }
        if (hasFullSuspension) {
          recs.push('Augmenter la compression arriere pour mieux absorber le transfert de masse au freinage');
        }
        recs.push('Verifier le carrossage arriere : trop negatif peut reduire le grip au freinage droit');
        break;
      }

      case 'bouncing': {
        if (hasFullSuspension) {
          recs.push('Reduire l\'expansion des amortisseurs (avant et arriere) : le rebond est trop rapide');
          recs.push('Si ca rebondit sur les bosses : reduire aussi la compression');
          recs.push('Augmenter legerement la frequence naturelle pour rigidifier sans destabiliser');
        } else {
          recs.push('Installer une suspension entierement personnalisable pour controler les amortisseurs');
        }
        recs.push('Verifier la hauteur de caisse : trop basse sur circuit bossu = risque de toucher le sol');
        break;
      }

      case 'high_speed_instability': {
        if (hasAero) {
          recs.push('Augmenter l\'appui arriere en priorite');
          recs.push('Augmenter aussi legerement l\'appui avant pour garder l\'equilibre');
        } else {
          recs.push('Installer des pieces aerodynamiques reglables — critique pour la stabilite a haute vitesse');
        }
        recs.push('Augmenter l\'ARB avant et arriere de 1-2 crans');
        if (hasFullSuspension) {
          recs.push('Rigidifier la suspension (frequence naturelle plus haute) pour reduire les mouvements de caisse');
        }
        recs.push('Verifier le toe arriere : un leger toe-in (+0.05 a +0.10) ameliore la stabilite en ligne droite');
        break;
      }

      case 'wheelspin_launch': {
        if (hasFullDiff) {
          if (drivetrain === 'RWD') {
            recs.push('Reduire le LSD acceleration : un diff trop ferme provoque un patinage des deux roues');
          }
          if (drivetrain === 'AWD') {
            recs.push('Reduire le LSD acceleration arriere');
            recs.push('Deplacer la repartition centrale vers l\'avant (ex. 30/70 -> 40/60) pour le depart');
          }
        }
        recs.push('Monter en categorie de pneus si le reglement le permet');
        if (!parts.powerRestrictor) {
          recs.push('Envisager un limiteur de puissance si la voiture est hors-categorie');
        }
        if (hasFullSuspension) {
          recs.push('Assouplir legerement la compression arriere pour coller l\'arriere au sol au depart');
        }
        break;
      }

      case 'unstable_braking': {
        recs.push('Ajuster la balance de freinage : commencer au centre puis deplacer par cran');
        if (hasFullSuspension) {
          recs.push('Augmenter la compression avant pour stabiliser le pique-nez au freinage');
          recs.push('Verifier que la compression arriere n\'est pas trop faible (reduit le grip arriere au freinage)');
        }
        if (hasFullDiff) {
          recs.push('Reduire le LSD freinage si l\'arriere se decroche brusquement');
        }
        recs.push('Verifier le carrossage : trop asymetrique peut tirer la voiture d\'un cote au freinage');
        break;
      }
    }

    return {
      symptom,
      label: this.getLabel(symptom),
      recommendations: recs
    };
  }

  private getLabel(symptom: Symptom): string {
    const labels: Record<Symptom, string> = {
      understeer_entry:       'Sous-virage en entree de virage',
      understeer_mid:         'Sous-virage en milieu de virage',
      understeer_exit:        'Sous-virage en sortie de virage',
      oversteer_entry:        'Survirage en entree de virage',
      oversteer_exit:         'Survirage a l\'acceleration',
      oversteer_braking:      'Survirage au freinage',
      bouncing:               'Rebonds / suspension trop souple',
      high_speed_instability: 'Instabilite a haute vitesse',
      wheelspin_launch:       'Perte de traction au depart',
      unstable_braking:       'Freinage instable',
    };
    return labels[symptom];
  }
}
