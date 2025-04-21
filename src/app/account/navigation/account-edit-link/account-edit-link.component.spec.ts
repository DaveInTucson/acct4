import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountEditLinkComponent } from './account-edit-link.component';

describe('AccountEditLinkComponent', () => {
  let component: AccountEditLinkComponent;
  let fixture: ComponentFixture<AccountEditLinkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountEditLinkComponent]
    });
    fixture = TestBed.createComponent(AccountEditLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
