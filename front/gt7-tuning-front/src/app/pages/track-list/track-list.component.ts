import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';

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
    RouterLink
  ]
})
export class TrackListComponent implements OnInit {
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

    this.trackService.getTracks(page, limit).subscribe((response) => {
      this.tracks.set(response.tracks);
      this.total.set(response.total);
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadTracks();
  }
}