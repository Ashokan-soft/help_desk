import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDivisionComponent } from './admin-division.component';

describe('AdminDivisionComponent', () => {
  let component: AdminDivisionComponent;
  let fixture: ComponentFixture<AdminDivisionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminDivisionComponent]
    });
    fixture = TestBed.createComponent(AdminDivisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
