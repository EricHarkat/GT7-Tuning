import { Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GT7_GLOSSARY } from '../../models/gt7-tuning-terms';

@Component({
  selector: 'app-glossary',
  templateUrl: './glossary.component.html',
  styleUrl: './glossary.component.scss',
  imports: [MatCardModule, MatButtonModule, MatIconModule]
})
export class GlossaryComponent {
  readonly terms = GT7_GLOSSARY;
  open = signal(false);
  expandedKey = signal<string | null>(null);

  toggle(): void {
    this.open.update(v => !v);
  }

  toggleTerm(key: string): void {
    this.expandedKey.update(current => current === key ? null : key);
  }
}
