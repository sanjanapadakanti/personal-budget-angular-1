import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private url = 'http://localhost:3000/budget';
  private data: any[] = [];

  constructor(private http: HttpClient) { }

  fetchData(): Observable<any> {
    return this.http.get(this.url);
  }

  setData(data: any[]): void {
    this.data = data;
  }

  getData(): any[] {
    return this.data;
  }
}
