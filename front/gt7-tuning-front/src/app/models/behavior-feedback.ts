export type Symptom =
  | 'understeer_entry'
  | 'understeer_mid'
  | 'understeer_exit'
  | 'oversteer_entry'
  | 'oversteer_exit'
  | 'oversteer_braking'
  | 'lift_off_oversteer'
  | 'bouncing'
  | 'high_speed_instability'
  | 'wheelspin_launch'
  | 'unstable_braking';

export interface SymptomOption {
  key: Symptom;
  label: string;
  category: 'understeer' | 'oversteer' | 'stability' | 'traction';
}

export interface DiagnosticResult {
  symptom: Symptom;
  label: string;
  recommendations: string[];
}

export type SymptomSeverity = 1 | 2 | 3;

export interface DiagnosticOutput {
  results: DiagnosticResult[];
  conflicts: string[];
}

export const SYMPTOM_OPTIONS: SymptomOption[] = [
  { key: 'understeer_entry',       label: 'Sous-virage en entree de virage',    category: 'understeer' },
  { key: 'understeer_mid',         label: 'Sous-virage en milieu de virage',    category: 'understeer' },
  { key: 'understeer_exit',        label: 'Sous-virage en sortie de virage',    category: 'understeer' },
  { key: 'oversteer_entry',        label: 'Survirage en entree de virage',      category: 'oversteer'  },
  { key: 'oversteer_exit',         label: 'Survirage a l\'acceleration',        category: 'oversteer'  },
  { key: 'oversteer_braking',      label: 'Survirage au freinage',              category: 'oversteer'  },
  { key: 'lift_off_oversteer',     label: 'Survirage au lever de pied',         category: 'oversteer'  },
  { key: 'bouncing',               label: 'Rebonds / suspension trop souple',   category: 'stability'  },
  { key: 'high_speed_instability', label: 'Instabilite a haute vitesse',        category: 'stability'  },
  { key: 'wheelspin_launch',       label: 'Perte de traction au depart',        category: 'traction'   },
  { key: 'unstable_braking',       label: 'Freinage instable ou en crabe',      category: 'traction'   },
];

export const CONFLICT_PAIRS: { symptoms: [Symptom, Symptom]; message: string }[] = [
  {
    symptoms: ['understeer_entry', 'high_speed_instability'],
    message: 'ARB contradictoire : reduire l\'ARB avant aide le sous-virage mais reduit la stabilite haute vitesse — trouver un compromis.'
  },
  {
    symptoms: ['understeer_mid', 'high_speed_instability'],
    message: 'ARB contradictoire : assouplir la suspension aide le sous-virage en milieu mais nuit a la stabilite — ajuster par petits pas.'
  },
  {
    symptoms: ['understeer_entry', 'oversteer_entry'],
    message: 'Comportements contradictoires en entree de virage — verifier les bases : hauteur de caisse, carrossage, repartition du poids.'
  },
  {
    symptoms: ['understeer_exit', 'oversteer_exit'],
    message: 'Sous-virage et survirage en sortie simultanement — souvent un probleme de balance globale avant/arriere ou de pneus inadequats.'
  },
  {
    symptoms: ['bouncing', 'high_speed_instability'],
    message: 'Rebonds et instabilite haute vitesse : rigidifier aide la stabilite mais aggrave les rebonds — retravailler les amortisseurs en priorite.'
  },
  {
    symptoms: ['oversteer_entry', 'lift_off_oversteer'],
    message: 'Deux formes de survirage : en entree et au lever de pied — l\'arriere est globalement trop leger, revoir la repartition du poids et le rake.'
  },
];
