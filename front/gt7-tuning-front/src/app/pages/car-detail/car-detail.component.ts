import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CarService } from '../../services/car.services';
import { Car } from '../../models/car';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrl: './car-detail.component.scss',
  imports: [MatCardModule, MatButtonModule, RouterLink]
})
export class CarDetailComponent implements OnInit {
  car = signal<Car | null>(null);

  constructor(
    private route: ActivatedRoute,
    private carService: CarService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    console.log('ID route:', id);

    if (!id) return;

    this.carService.getCarById(id).subscribe((car) => {
      console.log('Car detail:', car);
      this.car.set(car);
    });
  }
}