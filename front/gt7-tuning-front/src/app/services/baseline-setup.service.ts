import { Injectable } from '@angular/core';
import { Car } from '../models/car';
import { Track } from '../models/track';
import { InstalledParts } from './tuning-analysis.service';

export interface BaselineRow {
  label: string;
  front?: string;
  rear?: string;
  single?: string;
  note?: string;
  menuPath: string;
}

export interface BaselineGroup {
  title: string;
  rows: BaselineRow[];
}

type TireCat  = 'comfort' | 'sports' | 'racing';
type WeightCat = 'light' | 'medium' | 'heavy';

function tireCat(tires: string): TireCat {
  if (tires.startsWith('comfort')) return 'comfort';
  if (tires.startsWith('racing') || tires === 'intermediate' || tires === 'racing_wet') return 'racing';
  return 'sports';
}

function weightCat(kg: number | null | undefined): WeightCat {
  if (!kg) return 'medium';
  if (kg < 1050) return 'light';
  if (kg < 1400) return 'medium';
  return 'heavy';
}

function fmt(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

@Injectable({ providedIn: 'root' })
export class BaselineSetupService {
  generate(car: Car, parts: InstalledParts, track: Track | null): BaselineGroup[] {
    const groups: BaselineGroup[] = [];

    const drivetrain    = (car.normalized?.drivetrain ?? '').toUpperCase();
    const weight        = car.normalized?.weightKg;
    const tires         = parts.tires ?? 'sports_soft';
    const tc            = tireCat(tires);
    const wc            = weightCat(weight);
    const trackCat      = track?.category ?? '';
    const isHighSpeed   = trackCat === 'high_speed';
    const isTechnical   = trackCat === 'technical' || trackCat === 'street';
    const isRally       = trackCat === 'rally';

    const hasSport  = parts.suspension === 'sport' || parts.suspension === 'fully_customizable';
    const hasFull   = parts.suspension === 'fully_customizable';
    const hasLSD    = parts.differential === 'lsd' || parts.differential === 'fully_customizable';
    const hasFullDiff = parts.differential === 'fully_customizable';
    const hasAero   = parts.aero === 'custom';

    // ── ARB ──────────────────────────────────────────────────────────────
    if (hasSport) {
      const arb = arbValues(drivetrain, isHighSpeed, isTechnical);
      groups.push({
        title: 'Barre anti-roulis (ARB)',
        rows: [{
          label: 'ARB',
          front: String(arb.front),
          rear:  String(arb.rear),
          note:  arb.note,
          menuPath: 'Suspension → Barre anti-roulis',
        }],
      });
    }

    // ── FRÉQUENCE NATURELLE ──────────────────────────────────────────────
    if (hasSport) {
      const freq = natFreqValues(tc, wc, isHighSpeed, isRally);
      groups.push({
        title: 'Fréquence naturelle',
        rows: [{
          label: 'Hz',
          front: fmt(freq.front),
          rear:  fmt(freq.rear),
          note:  freq.note,
          menuPath: 'Suspension → Fréquence naturelle',
        }],
      });
    }

    // ── AMORTISSEURS ─────────────────────────────────────────────────────
    if (hasFull) {
      const d = damperValues(tc, isHighSpeed, isRally);
      groups.push({
        title: 'Amortisseurs',
        rows: [
          { label: 'Compression', front: String(d.comp.front), rear: String(d.comp.rear), menuPath: 'Suspension → Amortisseurs compression' },
          { label: 'Détente',     front: String(d.ext.front),  rear: String(d.ext.rear),  menuPath: 'Suspension → Amortisseurs détente',
            note: 'Augmenter détente si la voiture rebondit après les bosses' },
        ],
      });
    }

    // ── CARROSSAGE ───────────────────────────────────────────────────────
    if (hasSport) {
      const c = camberValues(drivetrain);
      groups.push({
        title: 'Carrossage',
        rows: [{
          label: 'Degrés',
          front: fmt(c.front),
          rear:  fmt(c.rear),
          note:  'Valeurs négatives. Ajuste ±0.2° selon l\'usure des pneus',
          menuPath: 'Suspension → Angle de carrossage',
        }],
      });
    }

    // ── TOE ──────────────────────────────────────────────────────────────
    if (hasSport) {
      const t = toeValues(drivetrain);
      groups.push({
        title: 'Convergence (Toe)',
        rows: [{
          label: 'Degrés',
          front: fmt(t.front, 2),
          rear:  fmt(t.rear,  2),
          note:  t.note,
          menuPath: 'Suspension → Angle de convergence',
        }],
      });
    }

    // ── LSD ──────────────────────────────────────────────────────────────
    if (hasLSD) {
      if (drivetrain === 'AWD' && hasFullDiff) {
        groups.push({
          title: 'LSD (AWD)',
          rows: [
            { label: 'Avant — Initial',       single: '8',  menuPath: 'Drivetrain → LSD avant → Couple initial' },
            { label: 'Avant — Accélération',   single: '12', menuPath: 'Drivetrain → LSD avant → Sensibilité accélération' },
            { label: 'Avant — Freinage',       single: '8',  menuPath: 'Drivetrain → LSD avant → Sensibilité décélération' },
            { label: 'Arrière — Initial',      single: '15', menuPath: 'Drivetrain → LSD arrière → Couple initial' },
            { label: 'Arrière — Accélération', single: '25', menuPath: 'Drivetrain → LSD arrière → Sensibilité accélération' },
            { label: 'Arrière — Freinage',     single: '12', menuPath: 'Drivetrain → LSD arrière → Sensibilité décélération' },
            { label: 'Répartition centrale',   single: '50/50', note: 'Ajuste vers l\'arrière si wheelspin au départ', menuPath: 'Drivetrain → Répartition av/ar' },
          ],
        });
      } else {
        const lsd = lsdValues(drivetrain);
        groups.push({
          title: 'LSD',
          rows: [
            { label: 'Initial',       single: String(lsd.initial),       menuPath: 'Drivetrain → Couple initial' },
            { label: 'Accélération',  single: String(lsd.accel),  note: lsd.accelNote, menuPath: 'Drivetrain → Sensibilité accélération' },
            { label: 'Freinage',      single: String(lsd.braking), note: lsd.brakingNote, menuPath: 'Drivetrain → Sensibilité décélération' },
          ],
        });
      }
    }

    // ── BALANCE FREINAGE ─────────────────────────────────────────────────
    groups.push({
      title: 'Balance de freinage',
      rows: [{
        label: 'Biais',
        single: brakeBalanceLabel(drivetrain),
        note:   'Ajuste si la voiture tire d\'un côté ou décroche à l\'arrière au freinage',
        menuPath: 'Freins → Balance av/ar',
      }],
    });

    // ── AÉRO ─────────────────────────────────────────────────────────────
    if (hasAero) {
      const aero = aeroValues(drivetrain, tc, isHighSpeed, isTechnical);
      groups.push({
        title: 'Aérodynamique',
        rows: [
          { label: 'Appui avant', single: aero.front + '%', note: aero.noteF, menuPath: 'Aérodynamique → Appui avant' },
          { label: 'Appui arrière', single: aero.rear + '%', note: aero.noteR, menuPath: 'Aérodynamique → Appui arrière' },
        ],
      });
    }

    return groups;
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────

function arbValues(dt: string, fast: boolean, technical: boolean) {
  const base: Record<string, { front: number; rear: number; note: string }> = {
    'RWD': { front: 3, rear: 3, note: 'Équilibré — augmenter AV pour réduire sous-virage, AR pour réduire survirage' },
    'FWD': { front: 3, rear: 5, note: 'ARB AR plus élevé pour forcer la rotation — garder AV souple' },
    'AWD': { front: 3, rear: 4, note: 'Légèrement plus ferme à l\'arrière pour dégager le train avant' },
    'MR':  { front: 4, rear: 3, note: 'Moteur central : AV plus ferme pour stabiliser l\'entrée de virage' },
    'RR':  { front: 5, rear: 2, note: 'Moteur AR : ARB AV élevé indispensable pour contrer le pendule' },
  };
  const dr = Object.keys(base).find(k => dt.includes(k)) ?? 'RWD';
  const v = { ...base[dr] };
  if (fast)      { v.front = Math.min(7, v.front + 1); v.rear = Math.min(7, v.rear + 1); }
  if (technical) { v.front = Math.max(1, v.front - 1); v.rear = Math.max(1, v.rear - 1); }
  return v;
}

function natFreqValues(tc: TireCat, wc: WeightCat, fast: boolean, rally: boolean) {
  const table: Record<WeightCat, Record<TireCat, { front: number; rear: number }>> = {
    light:  { comfort: { front: 2.20, rear: 2.00 }, sports: { front: 2.70, rear: 2.50 }, racing: { front: 3.40, rear: 3.20 } },
    medium: { comfort: { front: 1.90, rear: 1.75 }, sports: { front: 2.40, rear: 2.20 }, racing: { front: 3.00, rear: 2.80 } },
    heavy:  { comfort: { front: 1.70, rear: 1.60 }, sports: { front: 2.10, rear: 1.95 }, racing: { front: 2.70, rear: 2.55 } },
  };
  const v = { ...table[wc][tc] };
  if (fast)  { v.front = +(v.front + 0.15).toFixed(2); v.rear = +(v.rear + 0.15).toFixed(2); }
  if (rally) { v.front = +(v.front - 0.25).toFixed(2); v.rear = +(v.rear - 0.25).toFixed(2); }
  return { ...v, note: 'Plus élevé = plus ferme. Augmenter si la voiture plonge trop en freinage' };
}

function damperValues(tc: TireCat, fast: boolean, rally: boolean) {
  const base: Record<TireCat, { comp: number; ext: number }> = {
    comfort: { comp: 3, ext: 4 },
    sports:  { comp: 4, ext: 5 },
    racing:  { comp: 5, ext: 6 },
  };
  let { comp, ext } = base[tc];
  if (fast)  comp = Math.min(10, comp + 1);
  if (rally) { comp = Math.max(1, comp - 1); ext = Math.max(1, ext - 1); }
  return {
    comp: { front: comp,     rear: comp },
    ext:  { front: ext,      rear: Math.max(1, ext - 1) },
  };
}

function camberValues(dt: string) {
  if (dt.includes('FWD')) return { front: -2.0, rear: -1.0 };
  if (dt.includes('RR'))  return { front: -2.0, rear: -1.0 };
  if (dt.includes('MR'))  return { front: -1.5, rear: -1.5 };
  return { front: -1.5, rear: -1.0 }; // FR / AWD
}

function toeValues(dt: string) {
  if (dt.includes('FWD')) return { front: -0.05, rear:  0.15, note: 'Toe-in AR prononcé pour compenser le sous-virage structurel du FWD' };
  if (dt.includes('RR'))  return { front:  0.05, rear:  0.05, note: 'Toe-in léger partout pour la stabilité — AR surtout critique' };
  if (dt.includes('MR'))  return { front:  0.00, rear:  0.08, note: 'Neutre AV, toe-in AR pour stabiliser l\'effet pendule' };
  if (dt.includes('AWD')) return { front: -0.03, rear:  0.12, note: 'Légère direction AV, stabilité AR' };
  return { front:  0.00, rear:  0.10, note: 'Neutre AV, toe-in AR (+0.10) pour la stabilité en ligne droite' }; // FR
}

function lsdValues(dt: string) {
  if (dt.includes('FWD')) return { initial: 15, accel: 15, braking: 10,
    accelNote: 'Valeur basse — un diff FWD trop serré pousse tout droit',
    brakingNote: 'Modéré — trop élevé = instabilité au freinage' };
  if (dt.includes('RR'))  return { initial: 12, accel: 20, braking: 18,
    accelNote: undefined,
    brakingNote: 'Critique sur moteur AR — éviter les valeurs trop élevées' };
  if (dt.includes('MR'))  return { initial: 10, accel: 22, braking: 10,
    accelNote: 'Corrections par pas de 3 max — très réactif sur MR',
    brakingNote: undefined };
  return { initial: 12, accel: 28, braking: 12, // FR
    accelNote: 'Augmenter si wheelspin en sortie, réduire si survirage',
    brakingNote: 'Réduire si l\'arrière décroche au freinage' };
}

function brakeBalanceLabel(dt: string): string {
  if (dt.includes('RR')) return 'Léger biais avant (↑1-2 crans)';
  if (dt.includes('FWD')) return 'Neutre ou léger biais arrière';
  return 'Neutre (point de départ)';
}

function aeroValues(dt: string, tc: TireCat, fast: boolean, technical: boolean) {
  const baseF = tc === 'racing' ? 40 : 30;
  const baseR = tc === 'racing' ? 50 : 40;
  let front = baseF, rear = baseR;
  if (fast)      { front += 10; rear += 10; }
  if (technical) { front -= 5;  rear -= 5; }
  const noteF = 'Monter si sous-virage à haute vitesse';
  const noteR = dt.includes('RR') ? 'Valeur haute recommandée — le poids AR rend l\'arrière instable sans appui' : 'Équilibrer avec l\'avant pour éviter le survirage';
  return { front, rear, noteF, noteR };
}
