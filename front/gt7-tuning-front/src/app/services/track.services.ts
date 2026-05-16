import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { Track } from '../models/track';
import { environment } from '../../environments/environment';

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
  private apiUrl = `${environment.apiUrl}/tracks`;
  private allTracks$: Observable<TracksResponse> | null = null;

  constructor(private http: HttpClient) {}

  getAllTracks(): Observable<TracksResponse> {
    if (!this.allTracks$) {
      this.allTracks$ = this.http
        .get<TracksResponse>(this.apiUrl, {
          params: new HttpParams().set('page', 1).set('limit', 500)
        })
        .pipe(shareReplay(1));
    }
    return this.allTracks$;
  }

  getTracks(
    page = 1,
    limit = 25,
    filters?: {
      search?: string;
      category?: string;
      trackType?: string;
      rain?: string;
      reversible?: string;
    }
  ): Observable<TracksResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.trackType) params = params.set('trackType', filters.trackType);
    if (filters?.rain) params = params.set('rain', filters.rain);
    if (filters?.reversible) params = params.set('reversible', filters.reversible);

    return this.http.get<TracksResponse>(this.apiUrl, { params });
  }

  getTrackById(id: string): Observable<Track> {
    return this.http.get<Track>(`${this.apiUrl}/${id}`);
  }
}