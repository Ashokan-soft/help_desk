import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketFormComponent } from './components/ticket-form/ticket-form.component';
import { AdminDivisionComponent } from './components/admin-division/admin-division.component';
import { AdminIssuePartComponent } from './components/admin-issue-part/admin-issue-part.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

const routes: Routes = [
  // The user-facing page
  { path: '', component: TicketFormComponent }, 
  
  // The Admin Pages
  { path: 'admin/divisions', component: AdminDivisionComponent },
  { path: 'admin/issue-parts', component: AdminIssuePartComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }