import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Car } from '../models/car';

interface CarsResponse {
  page: number;
  limit: number;
  total: number;
  cars: Car[];
}

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private apiUrl = 'http://localhost:3000/cars';

  constructor(private http: HttpClient) {}

  getCars(page = 1, limit = 50): Observable<CarsResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.http.get<CarsResponse>(this.apiUrl, { params });
  }

  searchCars(query: string): Observable<Car[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Car[]>(`${this.apiUrl}/search`, { params });
  }

  getCarById(id: string): Observable<Car> {
    return this.http.get<Car>(`${this.apiUrl}/${id}`);
  }
}