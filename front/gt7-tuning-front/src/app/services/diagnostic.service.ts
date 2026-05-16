import { Injectable } from '@angular/core';
import { Car } from '../models/car';
import { Track } from '../models/track';
import {
  DiagnosticOutput,
  DiagnosticResult,
  Symptom,
  CONFLICT_PAIRS
} from '../models/behavior-feedback';
import { InstalledParts } from './tuning-analysis.service';

@Injectable({ providedIn: 'root' })
export class DiagnosticService {
  diagnose(
    symptoms: Symptom[],
    car: Car,
    parts: InstalledParts,
    track?: Track | null
  ): DiagnosticOutput {
    if (!symptoms.length) return { results: [], conflicts: [] };

    const drivetrain = car.normalized?.drivetrain;
    const hasFullSuspension = parts.suspension === 'fully_customizable';
    const hasFullDiff = parts.differential === 'fully_customizable';
    const hasAero = parts.aero === 'custom';
    const tires = parts.tires ?? '';
    const trackCategory = track?.category;
    const isRacingTire = tires.startsWith('racing');
    const isComfortTire = tires.startsWith('comfort');
    const isWetTire = tires === 'intermediate' || tires === 'racing_wet';

    const results = symptoms.map(symptom =>
      this.diagnoseSymptom(
        symptom, drivetrain, parts, hasFullSuspension, hasFullDiff,
        hasAero, tires, trackCategory, isRacingTire, isComfortTire, isWetTire
      )
    );

    const conflicts = this.detectConflicts(symptoms);

    return { results, conflicts };
  }

  private diagnoseSymptom(
    symptom: Symptom,
    drivetrain: string | null | undefined,
    parts: InstalledParts,
    hasFullSuspension: boolean,
    hasFullDiff: boolean,
    hasAero: boolean,
    tires: string,
    trackCategory: string | undefined,
    isRacingTire: boolean,
    isComfortTire: boolean,
    isWetTire: boolean
  ): DiagnosticResult {
    const recs: string[] = [];

    switch (symptom) {

      case 'understeer_entry': {
        recs.push('Augmenter le rake : abaisser l\'avant ou relever l\'arriere pour forcer la rotation');
        recs.push('Reduire l\'ARB avant de 1-2 crans');
        if (hasFullSuspension) {
          const step = isRacingTire ? '2-3%' : '1-2%';
          recs.push(`Reduire la frequence naturelle avant de ${step} pour assouplir la mise en virage`);
        }
        if (hasFullDiff && drivetrain === 'FWD') {
          recs.push('Reduire le LSD initial : un differentiel trop ferme bloque la rotation du train avant');
        }
        if (hasAero) {
          recs.push('Augmenter legerement l\'appui avant pour ameliorer la mise en virage');
        }
        if (trackCategory === 'technical') {
          recs.push('Circuit technique : le sous-virage en entree penalise surtout les virages lents — priorite au rake et a l\'ARB');
        }
        if (isWetTire) {
          recs.push('Piste humide : eviter les corrections trop agressives, privilegier la douceur d\'action');
        }
        break;
      }

      case 'understeer_mid': {
        recs.push('Reduire l\'ARB avant de 1-2 crans');
        recs.push('Augmenter le carrossage avant (plus negatif) pour maximiser le contact des pneus en virage');
        recs.push('Verifier la hauteur de caisse : un avant trop haut reduit le grip lateral');
        if (hasFullSuspension) {
          recs.push('Reduire la compression avant : permet plus de transfert de charge vers l\'exterieur en virage');
          if (isRacingTire) {
            recs.push('Avec des pneus racing : le gain de carrossage sera plus visible — ajuster par pas de 0.1 degre');
          }
        }
        if (isComfortTire) {
          recs.push('Pneus confort : la limite de grip est basse — envisager une montee en categorie si le reglement le permet');
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
          if (drivetrain === 'RWD') {
            recs.push('Verifier que le LSD acceleration n\'est pas trop faible : une RWD avec diff trop ouvert peut aussi sous-virer si la puissance desequilibre le train arriere');
            recs.push('Reduire l\'ARB arriere d\'1 cran pour liberer le train avant');
          }
        }
        recs.push('Attendre que la voiture soit completement redressee avant d\'accelerer');
        recs.push('Augmenter l\'ARB arriere de 1 cran pour rigidifier l\'arriere et liberer le train avant');
        if (trackCategory === 'technical') {
          recs.push('Circuit technique : le sous-virage en sortie est critique dans les virages lents — priorite au LSD et au timing d\'acceleration');
        }
        break;
      }

      case 'oversteer_entry': {
        recs.push('Augmenter l\'ARB arriere de 1-2 crans');
        recs.push('Reduire le rake : rapprocher avant et arriere pour stabiliser l\'entree');
        if (hasFullSuspension) {
          recs.push('Augmenter la frequence naturelle arriere pour rigidifier le train arriere en entree');
        }
        if (hasFullDiff && (drivetrain === 'RWD' || drivetrain === 'AWD')) {
          recs.push('Reduire le LSD freinage : un diff trop ouvert en deceleration laisse l\'arriere se derober');
        }
        if (hasAero) {
          recs.push('Augmenter l\'appui arriere pour charger le train arriere');
        }
        if (trackCategory === 'high_speed') {
          recs.push('A haute vitesse : l\'appui aerodynamique est le levier le plus efficace avant de toucher a la suspension');
        }
        break;
      }

      case 'oversteer_exit': {
        if (hasFullDiff) {
          if (drivetrain === 'RWD') {
            recs.push('Reduire le LSD acceleration de 5 crans et re-evaluer');
            recs.push('Si le probleme persiste, continuer a reduire — un diff trop ferme force les roues arriere a patiner ensemble');
          }
          if (drivetrain === 'AWD') {
            recs.push('Reduire le LSD acceleration arriere de 3-5 crans');
            recs.push('Augmenter legerement la repartition vers l\'avant pour lisser la motricite');
          }
          if (drivetrain === 'FWD') {
            recs.push('Le survirage en sortie sur FWD est rare — verifier si c\'est un probleme de rebond arriere ou de surface de piste');
          }
        }
        recs.push('Augmenter l\'ARB avant de 1 cran pour stabiliser la transition acceleration');
        if (hasFullSuspension) {
          recs.push('Augmenter la compression arriere pour freiner le transfert de masse vers l\'arriere');
        }
        if (isRacingTire) {
          recs.push('Pneus racing : le grip supplementaire peut rendre le comportement plus brutal — ajuster par petits pas');
        }
        break;
      }

      case 'oversteer_braking': {
        recs.push('Deplacer la balance de freinage vers l\'avant de 1-2 crans : moins de freinage arriere = moins de survirage');
        if (hasFullDiff) {
          recs.push('Reduire le LSD freinage : un diff trop bloque en deceleration cree un couple de lacet qui decroche l\'arriere');
        }
        if (hasFullSuspension) {
          recs.push('Augmenter la compression arriere pour mieux absorber le transfert de masse au freinage');
          recs.push('Reduire l\'expansion arriere pour eviter que la suspension se detende trop vite apres le frein');
        } else {
          recs.push('Sans suspension reglable : agir uniquement sur la balance de freinage et le LSD');
        }
        recs.push('Verifier le toe arriere : un toe-in (+0.05 a +0.10) stabilise l\'arriere sous freinage');
        break;
      }

      case 'lift_off_oversteer': {
        recs.push('Augmenter le LSD deceleration (freinage) : un diff plus ferme maintient la connexion arriere au lever de pied');
        if (hasFullSuspension) {
          recs.push('Reduire l\'expansion arriere : empeche la suspension de se detendre trop vite quand on leve le pied');
          recs.push('Reduire l\'ARB arriere d\'1 cran pour laisser le train arriere absorber le changement de charge');
        }
        recs.push('Reduire le rake legerement : moins de rake = moins de rotation naturelle au lever de pied');
        recs.push('Augmenter le toe-in arriere (+0.05 a +0.10) pour stabiliser l\'arriere en deceleration');
        if (trackCategory === 'technical') {
          recs.push('Circuit technique : le lift-off oversteer est particulierement penalisant dans les chicanes — travailler l\'expansion arriere en priorite');
        }
        break;
      }

      case 'bouncing': {
        if (hasFullSuspension) {
          recs.push('Reduire l\'expansion des amortisseurs (avant et arriere) : le rebond est trop rapide apres la compression');
          recs.push('Si ca rebondit sur les bosses : reduire aussi la compression pour mieux absorber le choc initial');
          const freqAdvice = isRacingTire
            ? 'Reduire la frequence naturelle de 3-5% — les pneus racing tolerent moins les mouvements de caisse rapides'
            : 'Reduire la frequence naturelle de 2-3% pour assouplir la base';
          recs.push(freqAdvice);
        } else {
          recs.push('Installer une suspension entierement personnalisable pour acceder aux amortisseurs');
        }
        recs.push('Verifier la hauteur de caisse : trop basse sur circuit bossu = risque de toucher le sol et de rebondir');
        if (trackCategory === 'rally') {
          recs.push('Surface rally : augmenter la garde au sol et assouplir au maximum — la suspension doit absorber, pas rebondir');
        }
        break;
      }

      case 'high_speed_instability': {
        if (hasAero) {
          recs.push('Augmenter l\'appui arriere en priorite — c\'est le levier le plus efficace a haute vitesse');
          recs.push('Augmenter aussi legerement l\'appui avant pour conserver l\'equilibre avant/arriere');
        } else {
          recs.push('Installer des pieces aerodynamiques reglables — indispensable pour la stabilite a haute vitesse');
        }
        recs.push('Augmenter l\'ARB avant et arriere de 1-2 crans pour reduire les mouvements de caisse');
        if (hasFullSuspension) {
          const step = isComfortTire ? '2-3%' : '3-5%';
          recs.push(`Augmenter la frequence naturelle de ${step} pour rigidifier le comportement a haute vitesse`);
        }
        recs.push('Verifier le toe arriere : un toe-in (+0.05 a +0.10) ameliore la stabilite en ligne droite');
        if (isWetTire) {
          recs.push('Piste humide : ne pas pousser les corrections trop loin — la stabilite est aussi liee au grip disponible');
        }
        break;
      }

      case 'wheelspin_launch': {
        if (hasFullDiff) {
          if (drivetrain === 'RWD') {
            recs.push('Reduire le LSD acceleration : un diff trop ferme force les deux roues a patiner ensemble');
            recs.push('Viser une valeur autour de 15-20 pour commencer et ajuster');
          }
          if (drivetrain === 'AWD') {
            recs.push('Reduire le LSD acceleration arriere');
            recs.push('Deplacer la repartition centrale vers l\'avant (ex. 30/70 -> 40/60) pour mieux repartir la puissance');
          }
          if (drivetrain === 'FWD') {
            recs.push('Sur FWD : augmenter le LSD initial pour aider les roues avant a transmettre la puissance plus egalement');
            recs.push('Un LSD initial trop faible sur FWD laisse une roue patiner seule');
          }
        }
        recs.push('Monter en categorie de pneus si le reglement le permet');
        if (!parts.powerRestrictor) {
          recs.push('Envisager un limiteur de puissance si la voiture est hors-categorie en puissance');
        }
        if (hasFullSuspension) {
          recs.push('Assouplir la compression arriere pour plaquer l\'arriere au sol au depart');
        }
        if (isComfortTire) {
          recs.push('Pneus confort : la limite de grip est atteinte rapidement — monter en Sports Medium minimum pour ce type de voiture');
        }
        break;
      }

      case 'unstable_braking': {
        recs.push('Ajuster la balance de freinage par crans : commencer au centre et deplacer selon le comportement');
        if (hasFullSuspension) {
          recs.push('Augmenter la compression avant pour stabiliser le pique-nez au freinage');
          recs.push('Verifier que la compression arriere n\'est pas trop faible (perte de grip arriere sous freinage)');
        }
        if (hasFullDiff) {
          recs.push('Reduire le LSD freinage si l\'arriere se decroche brusquement en ligne droite');
        }
        recs.push('Verifier le carrossage avant et arriere : une asymetrie peut tirer la voiture d\'un cote');
        recs.push('Verifier le toe avant : un toe-out excessif destabilise le freinage');
        if (drivetrain === 'RWD') {
          recs.push('RWD : le freinage arriere est plus sensible — commencer avec la balance 1-2 crans vers l\'avant');
        }
        break;
      }
    }

    return { symptom, label: this.getLabel(symptom), recommendations: recs };
  }

  private detectConflicts(symptoms: Symptom[]): string[] {
    const messages: string[] = [];

    for (const pair of CONFLICT_PAIRS) {
      if (symptoms.includes(pair.symptoms[0]) && symptoms.includes(pair.symptoms[1])) {
        messages.push(pair.message);
      }
    }

    return messages;
  }

  private getLabel(symptom: Symptom): string {
    const labels: Record<Symptom, string> = {
      understeer_entry:       'Sous-virage en entree de virage',
      understeer_mid:         'Sous-virage en milieu de virage',
      understeer_exit:        'Sous-virage en sortie de virage',
      oversteer_entry:        'Survirage en entree de virage',
      oversteer_exit:         'Survirage a l\'acceleration',
      oversteer_braking:      'Survirage au freinage',
      lift_off_oversteer:     'Survirage au lever de pied',
      bouncing:               'Rebonds / suspension trop souple',
      high_speed_instability: 'Instabilite a haute vitesse',
      wheelspin_launch:       'Perte de traction au depart',
      unstable_braking:       'Freinage instable',
    };
    return labels[symptom];
  }
}
