import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTransactionsLinkComponent } from './account-statement-link.component';

describe('AccountTransactionsLinkComponent', () => {
  let component: AccountTransactionsLinkComponent;
  let fixture: ComponentFixture<AccountTransactionsLinkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountTransactionsLinkComponent]
    });
    fixture = TestBed.createComponent(AccountTransactionsLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
