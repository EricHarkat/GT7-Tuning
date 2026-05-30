import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { Track } from '../../models/track';
import { TrackService } from '../../services/track.services';

@Component({
  selector: 'app-track-detail',
  templateUrl: './track-detail.component.html',
  styleUrl: './track-detail.component.scss',
  imports: [
    MatCardModule,
    MatButtonModule,
    RouterLink
  ]
})
export class TrackDetailComponent implements OnInit {
  track = signal<Track | null>(null);

  constructor(
    private route: ActivatedRoute,
    private trackService: TrackService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) return;

    this.trackService.getTrackById(id).subscribe((track) => {
      this.track.set(track);
    });
  }
}