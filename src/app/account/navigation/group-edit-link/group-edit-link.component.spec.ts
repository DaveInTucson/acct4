import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupEditLinkComponent } from './group-edit-link.component';

describe('GroupEditLinkComponent', () => {
  let component: GroupEditLinkComponent;
  let fixture: ComponentFixture<GroupEditLinkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupEditLinkComponent]
    });
    fixture = TestBed.createComponent(GroupEditLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
