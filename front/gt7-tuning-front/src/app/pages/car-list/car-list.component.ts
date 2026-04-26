import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { Car } from '../../models/car';
import { CarService } from '../../services/car.services';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrl: './car-list.component.scss',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    RouterLink,
    MatCardModule
  ]
})
export class CarListComponent implements OnInit {
  cars = signal<Car[]>([]);
  total = signal(0);

  pageIndex = signal(0);
  pageSize = signal(25);

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
    this.loadCars();
  }

  loadCars(): void {
    const page = this.pageIndex() + 1;
    const limit = this.pageSize();

    this.carService.getCars(page, limit).subscribe((response) => {
      this.cars.set(response.cars);
      this.total.set(response.total);
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadCars();
  }
}