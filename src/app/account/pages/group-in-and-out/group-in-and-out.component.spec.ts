import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupInAndOutComponent } from './group-in-and-out.component';

describe('GroupInAndOutComponent', () => {
  let component: GroupInAndOutComponent;
  let fixture: ComponentFixture<GroupInAndOutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupInAndOutComponent]
    });
    fixture = TestBed.createComponent(GroupInAndOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
