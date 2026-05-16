export interface GlossaryTerm {
  key: string;
  label: string;
  definition: string;
  menuPath?: string;
}

export const GT7_GLOSSARY: GlossaryTerm[] = [
  {
    key: 'arb',
    label: 'ARB (Barre anti-roulis)',
    definition: 'Barre rigide qui relie les deux roues d\'un essieu. Plus elle est rigide, moins la caisse penche en virage — mais moins le grip individuel des roues. Augmenter l\'ARB avant stabilise l\'entree de virage mais peut provoquer du sous-virage.',
    menuPath: 'Suspension → Barre anti-roulis'
  },
  {
    key: 'frequence_naturelle',
    label: 'Frequence naturelle (ressorts)',
    definition: 'Rigidite des ressorts exprimee en Hz. Une valeur haute = suspension rigide (reagit vite, transferts de charge limites). Une valeur basse = suspension souple (absorbe mieux les irregularites, mais plus de roulis). Toujours regler avant et arriere au meme pourcentage de leur plage respective.',
    menuPath: 'Suspension → Frequence naturelle'
  },
  {
    key: 'compression',
    label: 'Amortisseur — Compression',
    definition: 'Resistance de l\'amortisseur quand la suspension se comprime (bosses, freinages, virage). Une valeur haute = moins de mouvement de caisse, mais chocs transmis directement. A augmenter pour stabiliser les freinages et les changements de direction.',
    menuPath: 'Suspension → Amortisseurs compression'
  },
  {
    key: 'expansion',
    label: 'Amortisseur — Detente (Expansion)',
    definition: 'Resistance de l\'amortisseur quand la suspension se detend apres un choc. Trop haute = suspension qui ne revient pas assez vite (rebonds amortis lentement). Trop basse = rebonds. C\'est le reglage cle pour les rebonds.',
    menuPath: 'Suspension → Amortisseurs detente'
  },
  {
    key: 'rake',
    label: 'Rake (assiette)',
    definition: 'Difference de hauteur entre l\'avant et l\'arriere de la voiture. Un rake positif (arriere plus haut) aide la voiture a "pivoter" en entree de virage. C\'est un des premiers reglages a travailler pour corriger le sous-virage en entree.',
    menuPath: 'Suspension → Hauteur de caisse'
  },
  {
    key: 'carrossage',
    label: 'Carrossage (Camber)',
    definition: 'Inclinaison de la roue par rapport a la verticale. Un carrossage negatif (haut de la roue incline vers l\'interieur) ameliore le grip lateral en virage car il compense l\'inclinaison de la caisse. Trop negatif = mauvais grip en ligne droite.',
    menuPath: 'Suspension → Angle de carrossage'
  },
  {
    key: 'toe',
    label: 'Convergence (Toe)',
    definition: 'Orientation des roues vue de dessus. Toe-in (pointes vers l\'interieur) = stabilite en ligne droite. Toe-out (pointes vers l\'exterieur) = meilleure reactivite en virage mais moins stable. Le toe arriere est souvent en toe-in leger pour stabiliser la voiture.',
    menuPath: 'Suspension → Angle de convergence'
  },
  {
    key: 'lsd_initial',
    label: 'LSD — Couple initial',
    definition: 'Force de blocage du differentiel quand les deux roues tournent a la meme vitesse. Une valeur haute = plus de traction mais moins de rotation naturelle. A augmenter sur FWD pour eviter qu\'une roue ne patine seule.',
    menuPath: 'Drivetrain → Couple initial'
  },
  {
    key: 'lsd_acceleration',
    label: 'LSD — Sensibilite acceleration',
    definition: 'Force de blocage du differentiel quand on accelere (difference de vitesse entre roues). Haut = plus de traction mais risque de survirage (RWD) ou sous-virage (FWD/AWD). Bas = plus de souplesse mais roue interieure qui patine.',
    menuPath: 'Drivetrain → Sensibilite acceleration'
  },
  {
    key: 'lsd_freinage',
    label: 'LSD — Sensibilite deceleration',
    definition: 'Force de blocage du differentiel en deceleration / freinage. Haut = arriere plus stable au freinage mais peut empecher la rotation. Bas = plus de rotation naturelle mais risque de decrochage de l\'arriere au freinage.',
    menuPath: 'Drivetrain → Sensibilite deceleration'
  },
  {
    key: 'repartition_centrale',
    label: 'Repartition centrale (AWD)',
    definition: 'Pourcentage de couple envoye vers l\'avant et l\'arriere sur une voiture AWD. Ex. 30/70 = 30% avant, 70% arriere. Plus vers l\'arriere = comportement plus proche d\'un RWD, meilleure traction. Plus vers l\'avant = moins de survirage.',
    menuPath: 'Drivetrain → Repartition av/ar'
  },
  {
    key: 'balance_freinage',
    label: 'Balance de freinage',
    definition: 'Repartition de la force de freinage entre avant et arriere. Vers l\'avant = freinage plus stable (moins de survirage). Vers l\'arriere = plus de rotation mais risque de blocage arriere. Point de depart recommande : centre ou 1 cran vers l\'avant.',
    menuPath: 'Freins → Balance av/ar'
  },
  {
    key: 'aerodynamique',
    label: 'Appui aerodynamique',
    definition: 'Force exercee vers le bas par les ailerons. Plus d\'appui = plus de grip en courbe mais plus de trainee (moins de vitesse de pointe). L\'appui arriere stabilise a haute vitesse. L\'appui avant aide la mise en virage. Toujours equilibrer les deux.',
    menuPath: 'Aerodynamique → Appui avant / Appui arriere'
  },
  {
    key: 'pp',
    label: 'PP (Performance Points)',
    definition: 'Indice de performance d\'une voiture dans GT7. Chaque amelioration augmente les PP. Les courses online ont souvent une limite PP — depasser cette limite interdit la participation. C\'est la reference pour comparer les voitures entre elles.',
    menuPath: undefined
  },
];
