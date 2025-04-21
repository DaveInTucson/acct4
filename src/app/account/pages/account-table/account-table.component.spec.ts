import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTableComponent } from './account-table.component';

describe('AccountListComponent', () => {
  let component: AccountTableComponent;
  let fixture: ComponentFixture<AccountTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountTableComponent]
    });
    fixture = TestBed.createComponent(AccountTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
