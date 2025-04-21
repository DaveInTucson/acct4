import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSelector2Component } from './account-selector.component';

describe('AccountSelector2Component', () => {
  let component: AccountSelector2Component;
  let fixture: ComponentFixture<AccountSelector2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountSelector2Component]
    });
    fixture = TestBed.createComponent(AccountSelector2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
