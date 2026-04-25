import { Component, OnInit, signal } from '@angular/core';
import { CarService } from '../../services/car.services';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Car } from '../../models/car';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrl: './car-list.component.scss',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ]
})
export class CarListComponent implements OnInit {
  cars = signal<Car[]>([]);

  displayedColumns = [
    'image',
    'name',
    'manufacturer',
    'category',
    'engineType',
    'drivetrain',
    'pp',
    'details'
  ];

  constructor(private carService: CarService) {}

  ngOnInit(): void {
    this.carService.getCars().subscribe((data) => {
      this.cars.set(data.cars);
    });
  }
}