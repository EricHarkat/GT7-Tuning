import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CarListComponent } from './pages/car-list/car-list.component';
import { CarDetailComponent } from './pages/car-detail/car-detail.component';
import { TrackListComponent } from './pages/track-list/track-list.component';
import { TrackDetailComponent } from './pages/track-detail/track-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'cars', component: CarListComponent },
  { path: 'cars/:id', component: CarDetailComponent },
  { path: 'tracks', component: TrackListComponent },
  { path: 'tracks/:id', component: TrackDetailComponent },
];