import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupSelectorComponent } from './group-selector.component';

describe('GroupSelectorComponent', () => {
  let component: GroupSelectorComponent;
  let fixture: ComponentFixture<GroupSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupSelectorComponent]
    });
    fixture = TestBed.createComponent(GroupSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
