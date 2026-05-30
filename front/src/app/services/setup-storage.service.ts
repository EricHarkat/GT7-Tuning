import { Injectable } from '@angular/core';
import { SavedSetup } from '../models/saved-setup';

const STORAGE_KEY = 'gt7_saved_setups';

@Injectable({ providedIn: 'root' })
export class SetupStorageService {

  getAll(): SavedSetup[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  getForCar(carId: string): SavedSetup[] {
    return this.getAll().filter(s => s.carId === carId);
  }

  save(setup: SavedSetup): void {
    const all = this.getAll().filter(s => s.id !== setup.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([setup, ...all]));
  }

  delete(id: string): void {
    const all = this.getAll().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
}
