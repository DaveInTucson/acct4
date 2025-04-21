import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDateDialogComponent } from './select-date-dialog.component';

describe('SelectDateDialogComponent', () => {
  let component: SelectDateDialogComponent;
  let fixture: ComponentFixture<SelectDateDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectDateDialogComponent]
    });
    fixture = TestBed.createComponent(SelectDateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
