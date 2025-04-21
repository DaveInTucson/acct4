import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryGraphComponent } from './summary-graph.component';

describe('SummaryGraphComponent', () => {
  let component: SummaryGraphComponent;
  let fixture: ComponentFixture<SummaryGraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SummaryGraphComponent]
    });
    fixture = TestBed.createComponent(SummaryGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
