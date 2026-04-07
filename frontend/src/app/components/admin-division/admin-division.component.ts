import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelpdeskService } from '../../services/helpdesk.service';
import { Division } from '../../models/helpdesk.models';

@Component({
  selector: 'app-admin-division',
  templateUrl: './admin-division.component.html',
  styleUrls: ['./admin-division.component.scss']
})
export class AdminDivisionComponent implements OnInit {
  divisionForm!: FormGroup;
  divisions: Division[] = [];

  constructor(private fb: FormBuilder, private helpdeskService: HelpdeskService) {}

  ngOnInit(): void {
    this.divisionForm = this.fb.group({
      name: ['', Validators.required]
    });
    this.loadDivisions();
  }

  loadDivisions() {
    this.helpdeskService.getDivisions().subscribe(data => this.divisions = data);
  }

  onSubmit() {
    if (this.divisionForm.valid) {
      this.helpdeskService.createDivision(this.divisionForm.value).subscribe({
        next: (res) => {
          alert('Division created successfully!');
          this.divisionForm.reset();
          this.loadDivisions(); // Refresh list
        },
        error: (err) => alert('Error creating division')
      });
    }
  }
}