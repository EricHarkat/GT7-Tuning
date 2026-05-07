import { Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { CarService } from '../../services/car.services';
import { TrackService } from '../../services/track.services';
import {
  InstalledParts,
  TuningAnalysisService
} from '../../services/tuning-analysis.service';

import { Car } from '../../models/car';
import { Track } from '../../models/track';
import { GuidedTuning, TuningStep } from '../../services/guided-tuning';

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrl: './car-detail.component.scss',
  imports: [
    MatCardModule,
    MatButtonModule,
    RouterLink,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule
  ]
})
export class CarDetailComponent implements OnInit {
  car = signal<Car | null>(null);

  tracks = signal<Track[]>([]);
  selectedTrackId = signal('');
  currentStepIndex = signal(0);

  parts = signal<InstalledParts>({
    suspension: 'stock',
    differential: 'stock',
    transmission: 'stock',
    aero: 'stock',
    brakes: 'stock',
    tires: 'sports_soft',
    ballast: false,
    ecu: 'stock',
    powerRestrictor: false
  });

  suspensionOptions = [
    { value: 'stock', label: 'Stock' },
    { value: 'sport', label: 'Sport' },
    { value: 'fully_customizable', label: 'Fully Customizable' }
  ];

  differentialOptions = [
    { value: 'stock', label: 'Stock' },
    { value: 'lsd', label: 'LSD' },
    { value: 'fully_customizable', label: 'Fully Customizable' }
  ];

  transmissionOptions = [
    { value: 'stock', label: 'Stock' },
    { value: 'manual', label: 'Manual' },
    { value: 'fully_customizable', label: 'Fully Customizable' }
  ];

  aeroOptions = [
    { value: 'stock', label: 'Stock' },
    { value: 'custom', label: 'Custom Aero' }
  ];

  brakeOptions = [
    { value: 'stock', label: 'Stock' },
    { value: 'sport', label: 'Sport' },
    { value: 'racing', label: 'Racing' }
  ];

  tireOptions = [
    { value: 'comfort_hard', label: 'Comfort Hard' },
    { value: 'comfort_medium', label: 'Comfort Medium' },
    { value: 'comfort_soft', label: 'Comfort Soft' },
    { value: 'sports_hard', label: 'Sports Hard' },
    { value: 'sports_medium', label: 'Sports Medium' },
    { value: 'sports_soft', label: 'Sports Soft' },
    { value: 'racing_hard', label: 'Racing Hard' },
    { value: 'racing_medium', label: 'Racing Medium' },
    { value: 'racing_soft', label: 'Racing Soft' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'racing_wet', label: 'Racing Wet' },
    { value: 'dirt', label: 'Dirt' }
  ];

  ecuOptions = [
    { value: 'stock', label: 'Stock' },
    { value: 'sports', label: 'Sports' },
    { value: 'fully_customizable', label: 'Fully Customizable' }
  ];

  constructor(
    private route: ActivatedRoute,
    private carService: CarService,
    private trackService: TrackService,
    private tuningAnalysisService: TuningAnalysisService,
    private guidedTuning: GuidedTuning
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.carService.getCarById(id).subscribe((car) => {
        this.car.set(car);
      });
    }

    this.trackService.getTracks(1, 200).subscribe((res) => {
      this.tracks.set(res.tracks);
    });
  }

  selectedTrack = computed(() => {
    return (
      this.tracks().find((track) => track._id === this.selectedTrackId()) ||
      null
    );
  });

  analysis = computed(() => {
    const currentCar = this.car();

    if (!currentCar) {
      return null;
    }

    return this.tuningAnalysisService.analyze(
      currentCar,
      this.selectedTrack(),
      this.parts()
    );
  });

  guidedSteps = computed(() => {
  const car = this.car();
  if (!car) return [];

  return this.guidedTuning.generateSteps(
    car,
    this.selectedTrack(),
    this.parts()
  );
});

currentStep = computed(() => {
  const steps = this.guidedSteps();
  return steps[this.currentStepIndex()] || null;
});

nextStep() {
  if (this.currentStepIndex() < this.guidedSteps().length - 1) {
    this.currentStepIndex.update(v => v + 1);
  }
}

prevStep() {
  if (this.currentStepIndex() > 0) {
    this.currentStepIndex.update(v => v - 1);
  }
}

  updatePart<K extends keyof InstalledParts>(
    key: K,
    value: InstalledParts[K]
  ): void {
    this.parts.set({
      ...this.parts(),
      [key]: value
    });
  }
}