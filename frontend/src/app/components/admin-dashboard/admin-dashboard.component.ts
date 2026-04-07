import { Component, OnInit } from '@angular/core';
import { HelpdeskService } from '../../services/helpdesk.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  tickets: any[] = [];
  statusFilter: string = 'All';
  searchQuery: string = '';
  objectKeys = Object.keys;

  // Custom UI Variables
  toast: { message: string, type: 'success' | 'error' } | null = null;
  rejectingTicketId: number | null = null;
  rejectReason: string = '';

  constructor(private helpdeskService: HelpdeskService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets() {
    this.helpdeskService.getTickets().subscribe({
      next: (data) => this.tickets = data,
      error: () => this.showToast('Error fetching tickets from server.', 'error')
    });
  }

  get pendingCount() { return this.tickets.filter(t => t.status === 'Pending').length; }
  get solvedCount() { return this.tickets.filter(t => t.status === 'Solved').length; }
  get rejectedCount() { return this.tickets.filter(t => t.status === 'Not an Issue').length; }

  get filteredTickets() {
    return this.tickets.filter(t => {
      const matchStatus = this.statusFilter === 'All' || t.status === this.statusFilter;
      const searchStr = `${t.id} ${t.division_name} ${t.issue_part_name} ${JSON.stringify(t.dynamic_data)}`.toLowerCase();
      const matchSearch = searchStr.includes(this.searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }

  // --- Custom UI Toast ---
  showToast(message: string, type: 'success' | 'error') {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 4000);
  }

  // --- Custom Rejection Modal Logic ---
  openRejectModal(ticketId: number) {
    this.rejectingTicketId = ticketId;
    this.rejectReason = '';
  }

  cancelReject() {
    this.rejectingTicketId = null;
    this.rejectReason = '';
  }

  confirmReject() {
    if (!this.rejectReason.trim()) return;
    this.executeStatusChange(this.rejectingTicketId!, 'Not an Issue', this.rejectReason);
    this.cancelReject();
  }

  // --- Core Update Logic ---
  changeStatus(ticketId: number, newStatus: string) {
    if (newStatus === 'Not an Issue') {
      this.openRejectModal(ticketId); // Open our beautiful custom modal instead of prompt()
    } else {
      this.executeStatusChange(ticketId, newStatus, '');
    }
  }

  executeStatusChange(ticketId: number, status: string, admin_notes: string) {
    const payload = { status, admin_notes };
    
    this.helpdeskService.updateTicketStatus(ticketId, payload).subscribe({
      next: () => {
        this.showToast(`Ticket #${ticketId} updated successfully!`, 'success');
        this.loadTickets();
      },
      error: () => this.showToast('Failed to update ticket status.', 'error')
    });
  }
}