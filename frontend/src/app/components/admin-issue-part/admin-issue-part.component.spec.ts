import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminIssuePartComponent } from './admin-issue-part.component';

describe('AdminIssuePartComponent', () => {
  let component: AdminIssuePartComponent;
  let fixture: ComponentFixture<AdminIssuePartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminIssuePartComponent]
    });
    fixture = TestBed.createComponent(AdminIssuePartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
