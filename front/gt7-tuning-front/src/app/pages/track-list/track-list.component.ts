import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Track } from '../../models/track';
import { TrackService } from '../../services/track.service';

@Component({
  selector: 'app-track-list',
  templateUrl: './track-list.component.html',
  styleUrl: './track-list.component.scss',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatCardModule,
    RouterLink,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ]
})
export class TrackListComponent implements OnInit {
  search = signal('');
    category = signal('');
    trackType = signal('');
    rain = signal('');
    reversible = signal('');

    categories = ['technical', 'high_speed', 'balanced', 'rally'];
    trackTypes = ['Real', 'Original', 'Dirt'];

  tracks = signal<Track[]>([]);
  total = signal(0);

  pageIndex = signal(0);
  pageSize = signal(25);

  displayedColumns = [
    'name',
    'country',
    'trackType',
    'category',
    'length',
    'rain',
    'reversible',
    'details'
  ];

  constructor(private trackService: TrackService) {}

  ngOnInit(): void {
    this.loadTracks();
  }

  loadTracks(): void {
    const page = this.pageIndex() + 1;
    const limit = this.pageSize();

    this.trackService.getTracks(page, limit, {
      search: this.search(),
      category: this.category(),
      trackType: this.trackType(),
      rain: this.rain(),
      reversible: this.reversible()
    }).subscribe((response) => {
      this.tracks.set(response.tracks);
      this.total.set(response.total);
    });
  }

  applyFilters(): void {
  this.pageIndex.set(0);
  this.loadTracks();
}

resetFilters(): void {
  this.search.set('');
  this.category.set('');
  this.trackType.set('');
  this.rain.set('');
  this.reversible.set('');
  this.pageIndex.set(0);
  this.loadTracks();
}

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadTracks();
  }
}