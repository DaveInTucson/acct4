import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupSummaryComponent } from './group-summary.component';

describe('GroupSummaryComponent', () => {
  let component: GroupSummaryComponent;
  let fixture: ComponentFixture<GroupSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupSummaryComponent]
    });
    fixture = TestBed.createComponent(GroupSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
