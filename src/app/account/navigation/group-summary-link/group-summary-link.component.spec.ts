import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupSummaryLinkComponent } from './group-summary-link.component';

describe('GroupSummaryLinkComponent', () => {
  let component: GroupSummaryLinkComponent;
  let fixture: ComponentFixture<GroupSummaryLinkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupSummaryLinkComponent]
    });
    fixture = TestBed.createComponent(GroupSummaryLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
