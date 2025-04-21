import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupInAndOutLinkComponent } from './group-in-and-out-link.component';

describe('GroupInAndOutLinkComponent', () => {
  let component: GroupInAndOutLinkComponent;
  let fixture: ComponentFixture<GroupInAndOutLinkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupInAndOutLinkComponent]
    });
    fixture = TestBed.createComponent(GroupInAndOutLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
