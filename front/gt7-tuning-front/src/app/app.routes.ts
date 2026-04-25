import { Routes } from '@angular/router';
import { CarListComponent } from './pages/car-list/car-list.component';
import { CarDetailComponent } from './pages/car-detail/car-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'cars', pathMatch: 'full' },
  { path: 'cars', component: CarListComponent },
  { path: 'cars/:id', component: CarDetailComponent },
];