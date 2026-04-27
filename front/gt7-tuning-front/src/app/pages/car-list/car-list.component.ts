import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

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
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ]
})
export class CarListComponent implements OnInit {
  search = signal('');
  category = signal('');
  drivetrain = signal('');
  engineType = signal('');

  categories = ['road', 'race', 'concept'];
  drivetrains = ['FWD', 'RWD', 'AWD'];
  engineTypes = ['NA', 'Turbo', 'Supercharged', 'Electric', 'Hybrid'];

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

  this.carService.getCars(page, limit, {
    search: this.search(),
    category: this.category(),
    drivetrain: this.drivetrain(),
    engineType: this.engineType()
  }).subscribe((response) => {
    this.cars.set(response.cars);
    this.total.set(response.total);
  });
  }

  applyFilters(): void {
  this.pageIndex.set(0);
  this.loadCars();
}

resetFilters(): void {
  this.search.set('');
  this.category.set('');
  this.drivetrain.set('');
  this.engineType.set('');
  this.pageIndex.set(0);
  this.loadCars();
}

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadCars();
  }
}