import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Track } from '../models/track';

interface TracksResponse {
  page: number;
  limit: number;
  total: number;
  tracks: Track[];
}

@Injectable({
  providedIn: 'root'
})
export class TrackService {
  private apiUrl = 'http://localhost:3000/tracks';

  constructor(private http: HttpClient) {}

  getTracks(page = 1, limit = 25): Observable<TracksResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.http.get<TracksResponse>(this.apiUrl, { params });
  }

  getTrackById(id: string): Observable<Track> {
    return this.http.get<Track>(`${this.apiUrl}/${id}`);
  }
}