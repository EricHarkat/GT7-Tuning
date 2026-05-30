import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly workflow = [
    { icon: 'directions_car', label: 'Choisis ta voiture',        desc: 'Recherche par marque, PP ou catégorie' },
    { icon: 'build',          label: 'Configure les pièces',      desc: 'Suspension, diff, pneus, aéro installés' },
    { icon: 'map',            label: 'Sélectionne le circuit',    desc: 'Les recommandations s\'adaptent au tracé' },
    { icon: 'troubleshoot',   label: 'Déclare ce que tu observes', desc: 'Sous-virage, survirage… et leur sévérité' },
  ];

  readonly steps = [
    {
      num: 1, icon: 'tire_repair', title: 'Choix des pneus',
      body: 'La décision la plus impactante. Le compound fixe l\'adhérence maximale et le budget PP. Commence toujours par là avant de toucher à quoi que ce soit d\'autre.',
      tip: 'Confort → Sport → Racing : chaque palier gagne ~15–25 PP et change radicalement l\'approche du réglage.',
    },
    {
      num: 2, icon: 'height', title: 'Suspension de base',
      body: 'Règle le rake (hauteur AR > AV) et la fréquence naturelle. Un rake positif favorise la rotation en entrée. La fréquence doit correspondre au poids de la voiture et à la rugosité du circuit.',
      tip: 'Voiture lourde ou circuit bossu → fréquence basse. Légère ou circuit lisse → fréquence haute.',
    },
    {
      num: 3, icon: 'compare_arrows', title: 'Barres anti-roulis (ARB)',
      body: 'Le levier le plus direct sur l\'équilibre. ARB avant élevé = sous-virage, ARB arrière élevé = survirage. Commence équilibré et ajuste selon ce que tu observes en piste.',
      tip: 'Modifie un côté à la fois par pas de 1 cran. L\'effet se sent surtout en milieu de virage.',
    },
    {
      num: 4, icon: 'speed', title: 'Amortisseurs',
      body: 'La compression contrôle la vitesse d\'enfoncement, la détente contrôle le retour. Un mauvais réglage amplifie tous les autres problèmes. Règle toujours après l\'ARB.',
      tip: 'Rebonds après une bosse → détente trop haute. Voiture qui plonge au freinage → augmenter la compression avant.',
    },
    {
      num: 5, icon: 'settings', title: 'LSD (différentiel)',
      body: 'Trois valeurs indépendantes : Initial (départ), Accélération (sortie), Freinage (entrée). Chacune a un effet très ciblé — ne jamais tout modifier en même temps.',
      tip: 'Wheelspin en sortie → baisser l\'accélération. Arrière qui décroche au freinage → baisser le freinage LSD.',
    },
    {
      num: 6, icon: 'air', title: 'Aérodynamique',
      body: 'Utile à partir de ~150 km/h. Plus d\'appui = plus de grip en courbe mais plus de traînée. Équilibre avant/arrière avant d\'augmenter le niveau global.',
      tip: 'Sur circuit technique l\'aéro est secondaire. Sur circuit rapide c\'est l\'un des réglages les plus efficaces.',
    },
    {
      num: 7, icon: 'rotate_right', title: 'Carrossage & Convergence',
      body: 'L\'affinage final. Carrossage négatif améliore le grip en virage. Toe-in AR (+) stabilise en ligne droite et au freinage. Toe-out AV (-) améliore la réactivité de direction.',
      tip: 'Modifier par pas de 0.1° max. Ces réglages interagissent — changer l\'un peut nécessiter d\'ajuster l\'autre.',
    },
  ];
}
