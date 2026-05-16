import { Injectable } from '@angular/core';
import { Car } from '../models/car';
import { Track } from '../models/track';
import {
  DiagnosticOutput,
  DiagnosticResult,
  Symptom,
  SymptomSeverity,
  CONFLICT_PAIRS
} from '../models/behavior-feedback';
import { InstalledParts } from './tuning-analysis.service';

@Injectable({ providedIn: 'root' })
export class DiagnosticService {
  diagnose(
    symptoms: Symptom[],
    severities: Record<string, SymptomSeverity>,
    car: Car,
    parts: InstalledParts,
    track?: Track | null
  ): DiagnosticOutput {
    if (!symptoms.length) return { results: [], conflicts: [] };

    const drivetrain = car.normalized?.drivetrain;
    const enginePosition = car.normalized?.enginePosition;
    const balance = car.normalized?.balance;
    const hasFullSuspension = parts.suspension === 'fully_customizable';
    const hasFullDiff = parts.differential === 'fully_customizable';
    const hasAero = parts.aero === 'custom';
    const tires = parts.tires ?? '';
    const trackCategory = track?.category;
    const isRacingTire = tires.startsWith('racing');
    const isComfortTire = tires.startsWith('comfort');
    const isWetTire = tires === 'intermediate' || tires === 'racing_wet';
    const isRearHeavy = (balance?.rearPct ?? 50) > 54;
    const isFrontHeavy = (balance?.frontPct ?? 50) > 54;

    const results = symptoms.map(symptom => {
      const severity: SymptomSeverity = (severities[symptom] ?? 2) as SymptomSeverity;
      return this.diagnoseSymptom(
        symptom, severity, drivetrain, enginePosition, balance,
        parts, hasFullSuspension, hasFullDiff, hasAero,
        tires, trackCategory, isRacingTire, isComfortTire, isWetTire,
        isRearHeavy, isFrontHeavy
      );
    });

    return { results, conflicts: this.detectConflicts(symptoms) };
  }

  private step(severity: SymptomSeverity): string {
    if (severity === 1) return '1 cran';
    if (severity === 3) return '2-3 crans';
    return '1-2 crans';
  }

  private freqStep(severity: SymptomSeverity): string {
    if (severity === 1) return '1-2%';
    if (severity === 3) return '4-6%';
    return '2-3%';
  }

  private diagnoseSymptom(
    symptom: Symptom,
    severity: SymptomSeverity,
    drivetrain: string | null | undefined,
    enginePosition: 'front' | 'mid' | 'rear' | null | undefined,
    balance: { frontPct: number; rearPct: number } | null | undefined,
    parts: InstalledParts,
    hasFullSuspension: boolean,
    hasFullDiff: boolean,
    hasAero: boolean,
    tires: string,
    trackCategory: string | undefined,
    isRacingTire: boolean,
    isComfortTire: boolean,
    isWetTire: boolean,
    isRearHeavy: boolean,
    isFrontHeavy: boolean
  ): DiagnosticResult {
    const recs: string[] = [];
    const s = severity;

    switch (symptom) {

      case 'understeer_entry': {
        recs.push(`Augmenter le rake de ${s === 1 ? 'quelques mm' : s === 3 ? '5-10 mm' : '2-5 mm'} pour forcer la rotation en entree`);
        recs.push(`Reduire l'ARB avant de ${this.step(s)}`);
        if (hasFullSuspension) {
          recs.push(`Reduire la frequence naturelle avant de ${this.freqStep(s)}`);
        }
        if (hasFullDiff && drivetrain === 'FWD') {
          recs.push('Reduire le LSD initial : un diff trop ferme bloque la rotation du train avant');
        }
        if (isFrontHeavy && balance) {
          recs.push(`Voiture a dominante avant (${balance.frontPct}/${balance.rearPct}) : le sous-virage est structurel — le rake et l'ARB sont les leviers principaux`);
        }
        if (hasAero) {
          recs.push('Augmenter legerement l\'appui avant pour ameliorer la mise en virage');
        }
        if (trackCategory === 'technical') {
          recs.push('Circuit technique : priorite au rake et a l\'ARB avant plutot qu\'a l\'aerodynamique');
        }
        break;
      }

      case 'understeer_mid': {
        recs.push(`Reduire l'ARB avant de ${this.step(s)}`);
        recs.push(`Augmenter le carrossage avant de ${s === 1 ? '0.1 degre' : s === 3 ? '0.3-0.5 degres' : '0.2 degres'} (plus negatif)`);
        if (hasFullSuspension) {
          recs.push(`Reduire la compression avant de ${this.step(s)} pour laisser plus de charge sur l'exterieur`);
        }
        if (isFrontHeavy && balance) {
          recs.push(`Repartition avant chargee (${balance.frontPct}/${balance.rearPct}) : le transfert lateral est eleve — l'ARB et le carrossage sont critiques`);
        }
        if (isComfortTire) {
          recs.push('Pneus confort : la limite de grip lateral est basse — monter en Sports si le reglement le permet');
        }
        break;
      }

      case 'understeer_exit': {
        if (hasFullDiff) {
          if (drivetrain === 'FWD' || drivetrain === 'AWD') {
            recs.push(`Reduire le LSD acceleration avant de ${this.step(s)} : un diff ferme pousse tout droit`);
          }
          if (drivetrain === 'AWD') {
            recs.push('Deplacer la repartition centrale vers l\'arriere (ex. 40/60 -> 30/70)');
          }
          if (drivetrain === 'RWD') {
            recs.push('Sur RWD : l\'arriere peut saturer et pousser l\'avant — reduire l\'ARB arriere d\'1 cran');
            recs.push('Verifier que le LSD acceleration n\'est pas trop faible (diff trop ouvert = desequilibre lateral)');
          }
        }
        recs.push(`Augmenter l'ARB arriere de ${this.step(s)} pour rigidifier l'arriere et liberer l'avant`);
        if (trackCategory === 'technical') {
          recs.push('Circuit technique : attendre plus longtemps avant d\'accelerer, laisser la voiture se redresser completement');
        }
        break;
      }

      case 'oversteer_entry': {
        recs.push(`Augmenter l'ARB arriere de ${this.step(s)}`);
        recs.push(`Reduire le rake de ${s === 1 ? '2-3 mm' : s === 3 ? '8-12 mm' : '4-6 mm'} pour stabiliser l'entree`);
        if (hasFullSuspension) {
          recs.push(`Augmenter la frequence naturelle arriere de ${this.freqStep(s)}`);
        }
        if (hasFullDiff && (drivetrain === 'RWD' || drivetrain === 'AWD')) {
          recs.push(`Reduire le LSD freinage de ${this.step(s)} : un diff ouvert en deceleration laisse l'arriere se derober`);
        }
        if (enginePosition === 'mid') {
          recs.push('Moteur central : l\'effet pendule amplifie le survirage en entree — corrections tres progressives, par pas de 1 cran');
        }
        if (enginePosition === 'rear') {
          recs.push('Moteur arriere (style 911) : le poids arriere rend le survirage en entree impredictible — l\'ARB et la compression arriere sont les leviers cles');
        }
        if (isRearHeavy && balance) {
          recs.push(`Repartition arriere chargee (${balance.frontPct}/${balance.rearPct}) : l'arriere est naturellement instable — eviter les corrections trop agressives`);
        }
        if (hasAero) {
          recs.push('Augmenter l\'appui arriere');
        }
        if (trackCategory === 'high_speed') {
          recs.push('A haute vitesse : l\'aerodynamique est le levier le plus efficace avant la suspension');
        }
        break;
      }

      case 'oversteer_exit': {
        if (hasFullDiff) {
          if (drivetrain === 'RWD') {
            recs.push(`Reduire le LSD acceleration de ${s === 1 ? '3 crans' : s === 3 ? '8-10 crans' : '5 crans'} et re-evaluer`);
          }
          if (drivetrain === 'AWD') {
            recs.push(`Reduire le LSD acceleration arriere de ${this.step(s)}`);
            recs.push('Augmenter legerement la repartition vers l\'avant pour lisser la motricite');
          }
          if (drivetrain === 'FWD') {
            recs.push('Survirage en sortie sur FWD : verifier si c\'est un rebond arriere ou une surface glissante');
          }
        }
        recs.push(`Augmenter l'ARB avant de ${this.step(s)} pour stabiliser la transition a l'acceleration`);
        if (hasFullSuspension) {
          recs.push(`Augmenter la compression arriere de ${this.step(s)} pour freiner le transfert de masse`);
        }
        if (enginePosition === 'mid' && drivetrain === 'RWD') {
          recs.push('Moteur central RWD : tres sensible au LSD — descendre par pas de 3 crans maximum a la fois');
        }
        if (isRearHeavy && balance) {
          recs.push(`Repartition arriere (${balance.frontPct}/${balance.rearPct}) : le poids arriere amplifie le survirage — corrections plus conservatrices`);
        }
        break;
      }

      case 'oversteer_braking': {
        recs.push(`Deplacer la balance de freinage vers l'avant de ${s === 1 ? '1 cran' : s === 3 ? '3-4 crans' : '2 crans'}`);
        if (hasFullDiff) {
          recs.push(`Reduire le LSD freinage de ${this.step(s)} : un diff bloque en deceleration cree un couple de lacet`);
        }
        if (hasFullSuspension) {
          recs.push(`Augmenter la compression arriere de ${this.step(s)}`);
          recs.push('Reduire l\'expansion arriere pour eviter un retour de suspension trop rapide apres le frein');
        } else {
          recs.push('Sans suspension reglable : agir sur la balance de freinage et le LSD uniquement');
        }
        recs.push('Verifier le toe arriere : un toe-in (+0.05 a +0.10) stabilise l\'arriere sous freinage');
        if (enginePosition === 'rear') {
          recs.push('Moteur arriere : le survirage au freinage est tres caracteristique — priorite absolue au LSD freinage et a la balance');
        }
        break;
      }

      case 'lift_off_oversteer': {
        recs.push(`Augmenter le LSD freinage de ${this.step(s)} pour maintenir la connexion arriere au lever de pied`);
        if (hasFullSuspension) {
          recs.push(`Reduire l'expansion arriere de ${this.step(s)} : empeche la suspension de se detendre trop vite`);
          recs.push(`Reduire l'ARB arriere de ${s === 1 ? '1 cran' : '1-2 crans'} pour laisser l'arriere absorber le changement de charge`);
        }
        recs.push('Reduire le rake de 2-3 mm : moins de rotation naturelle au lever de pied');
        recs.push('Augmenter le toe-in arriere (+0.05 a +0.10) pour stabiliser l\'arriere en deceleration');
        if (enginePosition === 'rear') {
          recs.push('Moteur arriere (style 911) : c\'est le comportement typique de ce type de voiture — l\'expansion arriere et le LSD freinage sont les deux leviers prioritaires');
        }
        if (enginePosition === 'mid') {
          recs.push('Moteur central : l\'effet pendule rend ce symptome difficile a corriger — travailler l\'expansion avant de toucher l\'ARB');
        }
        if (isRearHeavy && balance) {
          recs.push(`Repartition arriere (${balance.frontPct}/${balance.rearPct}) : aggrave naturellement ce symptome — corrections conservatrices`);
        }
        if (trackCategory === 'technical') {
          recs.push('Circuit technique : ce symptome est penalisant dans les chicanes — priorite a l\'expansion arriere');
        }
        break;
      }

      case 'bouncing': {
        if (hasFullSuspension) {
          recs.push(`Reduire l'expansion avant et arriere de ${this.step(s)}`);
          if (s >= 2) recs.push('Reduire aussi la compression si ca rebondit sur les bosses (choc initial trop brusque)');
          recs.push(`Reduire la frequence naturelle de ${this.freqStep(s)}`);
        } else {
          recs.push('Installer une suspension entierement personnalisable pour acceder aux amortisseurs');
        }
        recs.push('Verifier la hauteur de caisse : trop basse sur circuit bossu = risque de toucher le sol');
        if (trackCategory === 'rally') {
          recs.push('Surface rally : maximiser la garde au sol et assouplir au maximum — la suspension doit absorber avant tout');
        }
        if (isRacingTire && s >= 2) {
          recs.push('Pneus racing : paradoxalement, ils transmettent mieux les imperfections — ne pas surcompenser avec trop de souplesse');
        }
        break;
      }

      case 'high_speed_instability': {
        if (hasAero) {
          recs.push(`Augmenter l'appui arriere de ${s === 1 ? '5-10%' : s === 3 ? '20-30%' : '10-15%'} de la plage`);
          recs.push('Augmenter aussi l\'appui avant proportionnellement pour garder l\'equilibre');
        } else {
          recs.push('Installer des pieces aerodynamiques reglables — indispensable a haute vitesse');
        }
        recs.push(`Augmenter l'ARB avant et arriere de ${this.step(s)}`);
        if (hasFullSuspension) {
          recs.push(`Augmenter la frequence naturelle de ${this.freqStep(s)}`);
        }
        recs.push('Verifier le toe arriere : toe-in de +0.05 a +0.10 ameliore la stabilite en ligne droite');
        if (isRearHeavy && balance) {
          recs.push(`Repartition arriere (${balance.frontPct}/${balance.rearPct}) : aggrave l'instabilite — l'aero arriere est encore plus critique`);
        }
        break;
      }

      case 'wheelspin_launch': {
        if (hasFullDiff) {
          if (drivetrain === 'RWD') {
            recs.push(`Reduire le LSD acceleration de ${s === 1 ? '3-5 crans' : s === 3 ? '10-15 crans' : '5-8 crans'}`);
          }
          if (drivetrain === 'AWD') {
            recs.push(`Reduire le LSD acceleration arriere de ${this.step(s)}`);
            recs.push('Deplacer la repartition centrale vers l\'avant (ex. 30/70 -> 40/60) pour le depart');
          }
          if (drivetrain === 'FWD') {
            recs.push(`Augmenter le LSD initial de ${this.step(s)} pour mieux repartir la traction entre les deux roues avant`);
          }
        }
        if (s >= 2) recs.push('Monter en categorie de pneus si le reglement le permet');
        if (!parts.powerRestrictor && s === 3) {
          recs.push('Symptome severe : envisager un limiteur de puissance');
        }
        if (hasFullSuspension) {
          recs.push(`Assouplir la compression arriere de ${s === 1 ? '1 cran' : '1-2 crans'} pour plaquer l'arriere au sol`);
        }
        if (isRearHeavy && balance) {
          recs.push(`Repartition arriere (${balance.frontPct}/${balance.rearPct}) : le poids aide la traction — le LSD reste le levier principal`);
        }
        break;
      }

      case 'unstable_braking': {
        recs.push(`Ajuster la balance de freinage de ${s === 1 ? '1 cran' : s === 3 ? '3-4 crans' : '2 crans'} vers l'avant`);
        if (hasFullSuspension) {
          recs.push(`Augmenter la compression avant de ${this.step(s)}`);
          if (s >= 2) recs.push('Verifier que la compression arriere n\'est pas trop faible');
        }
        if (hasFullDiff) {
          recs.push(`Reduire le LSD freinage de ${this.step(s)} si l'arriere se decroche`);
        }
        recs.push('Verifier le carrossage et le toe : une asymetrie tire la voiture a la corde');
        if (drivetrain === 'RWD') {
          recs.push('RWD : commencer avec la balance 1-2 crans vers l\'avant comme base');
        }
        if (isFrontHeavy && balance) {
          recs.push(`Voiture a dominante avant (${balance.frontPct}/${balance.rearPct}) : le pique-nez est amplifie — compression avant plus importante`);
        }
        break;
      }
    }

    return { symptom, label: this.getLabel(symptom), recommendations: recs };
  }

  private detectConflicts(symptoms: Symptom[]): string[] {
    return CONFLICT_PAIRS
      .filter(p => symptoms.includes(p.symptoms[0]) && symptoms.includes(p.symptoms[1]))
      .map(p => p.message);
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
