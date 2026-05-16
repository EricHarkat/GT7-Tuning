export type Symptom =
  | 'understeer_entry'
  | 'understeer_mid'
  | 'understeer_exit'
  | 'oversteer_entry'
  | 'oversteer_exit'
  | 'oversteer_braking'
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

export const SYMPTOM_OPTIONS: SymptomOption[] = [
  { key: 'understeer_entry',        label: 'Sous-virage en entree de virage',   category: 'understeer' },
  { key: 'understeer_mid',          label: 'Sous-virage en milieu de virage',   category: 'understeer' },
  { key: 'understeer_exit',         label: 'Sous-virage en sortie de virage',   category: 'understeer' },
  { key: 'oversteer_entry',         label: 'Survirage en entree de virage',     category: 'oversteer'  },
  { key: 'oversteer_exit',          label: 'Survirage a l\'acceleration',       category: 'oversteer'  },
  { key: 'oversteer_braking',       label: 'Survirage au freinage',             category: 'oversteer'  },
  { key: 'bouncing',                label: 'Rebonds / suspension trop souple',  category: 'stability'  },
  { key: 'high_speed_instability',  label: 'Instabilite a haute vitesse',       category: 'stability'  },
  { key: 'wheelspin_launch',        label: 'Perte de traction au depart',       category: 'traction'   },
  { key: 'unstable_braking',        label: 'Freinage instable ou en crabe',     category: 'traction'   },
];
