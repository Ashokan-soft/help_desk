import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // ADD THIS
import { FormsModule, ReactiveFormsModule } from '@angular/forms';     // ADD THIS

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TicketFormComponent } from './components/ticket-form/ticket-form.component';
import { AdminDivisionComponent } from './components/admin-division/admin-division.component';
import { AdminIssuePartComponent } from './components/admin-issue-part/admin-issue-part.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    TicketFormComponent,
    AdminDivisionComponent,
    AdminIssuePartComponent,
    NavbarComponent,
    AdminDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,     // ADD THIS
    ReactiveFormsModule,   // ADD THIS
    FormsModule // <-- ADD IT TO THE IMPORTS ARRAY HERE
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }