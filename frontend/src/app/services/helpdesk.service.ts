import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Division, IssuePart } from '../models/helpdesk.models';

@Injectable({
  providedIn: 'root'
})
export class HelpdeskService {
  private apiUrl = 'http://127.0.0.1:8000/api'; 

  constructor(private http: HttpClient) { }

  getDivisions(): Observable<Division[]> {
    return this.http.get<Division[]>(`${this.apiUrl}/divisions/`);
  }

  createDivision(divisionData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/divisions/`, divisionData);
  }

  // FIXED: Now safely fetches ALL if no divisionId is passed
  getIssueParts(divisionId?: number | null | string): Observable<IssuePart[]> {
    let url = `${this.apiUrl}/issue-parts/`;
    if (divisionId && divisionId !== 'all') {
      url += `?division=${divisionId}`;
    }
    return this.http.get<IssuePart[]>(url);
  }

  createIssuePart(issuePartData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/issue-parts/`, issuePartData);
  }

  updateIssuePart(id: number, issuePartData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/issue-parts/${id}/`, issuePartData);
  }

  submitTicket(ticketData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/tickets/`, ticketData);
  }

  getTickets(status?: string): Observable<any[]> {
    let url = `${this.apiUrl}/tickets/`;
    if (status && status !== 'All') {
      url += `?status=${status}`;
    }
    return this.http.get<any[]>(url);
  }

  // FIXED: Accepts an object ('data') instead of just a string, allowing us to pass the Reason
  updateTicketStatus(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/tickets/${id}/`, data);
  }
}