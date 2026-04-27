import { Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CarService } from '../../services/car.services';
import { TrackService } from '../../services/track.services';
import { Car } from '../../models/car';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { TuningAnalysisService } from '../../services/tuning-analysis.service';
import { Track } from '../../models/track';

import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrl: './car-detail.component.scss',
  imports: [MatCardModule, MatButtonModule, RouterLink, FormsModule, MatFormFieldModule, MatSelectModule]
})
export class CarDetailComponent implements OnInit {
  car = signal<Car | null>(null);
  selectedTrackId = signal('');
  tracks = signal<Track[]>([]);

  constructor(
    private route: ActivatedRoute,
    private carService: CarService,
    private trackService: TrackService,
    private tuningAnalysisService: TuningAnalysisService
  ) {}

  ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');

  if (id) {
    this.carService.getCarById(id).subscribe(car => {
      this.car.set(car);
    });
  }

  this.trackService.getTracks(1, 200).subscribe(res => {
    this.tracks.set(res.tracks);
  });
  }

  selectedTrack = computed(() => {
  return this.tracks().find(track => track._id === this.selectedTrackId()) || null;
  });

  analysis = computed(() => {
    const currentCar = this.car();

    if (!currentCar) {
      return null;
    }

    return this.tuningAnalysisService.analyze(currentCar, this.selectedTrack());
  });

}