import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AccountDBService } from 'src/app/db/account-db.service';
import { Account, Group } from 'src/app/model/account';
import { unstringify } from 'src/app/util/convert';
import { DBStatus } from 'src/app/util/db-status';
import { navigateToAccountEdit } from '../../navigation/navigation-functions';
import { HttpErrorService } from 'src/app/services/http-error.service';

@Component({
  selector: 'app-account-create',
  templateUrl: './account-create.component.html',
  styleUrls: ['./account-create.component.css'],
  standalone: false
})
export class AccountCreateComponent implements OnInit, AfterViewInit, OnDestroy {

  private releaseSubscriptions$ = new Subject<void>();
  private dbStatus: DBStatus = DBStatus.DB_WAITING;

  createAccountForm: FormGroup;
  accounts: Account[] = [];

  constructor(
    private dbService: AccountDBService,
    private formBuilder: FormBuilder,
    private router: Router,
    private title: Title,
    private errorService: HttpErrorService

  ) {
    this.createAccountForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(1)], this.uniqueNameValidator.bind(this)],
      status: ['', [Validators.required, this.notEqualTo('choose')]],
    });    
  }
  
  uniqueNameValidator(control: any) {
    return new Promise(resolve => {
      const nameExists = this.accounts!.some(acc => acc.name === control.value);
      resolve(nameExists ? { nameTaken: true } : null);
    });
  }

  ngOnInit(): void {
      this.dbService.getAccountAll()
        .pipe(takeUntil(this.releaseSubscriptions$)).subscribe({
                next: result => this.setLoadedAccounts(unstringify(result)),
                error: err => this.setDBError("loading accounts", err)
              });
  }

  ngAfterViewInit(): void {
    this.title.setTitle("Create New Account");
  }

  ngOnDestroy(): void {
    this.releaseSubscriptions$.next();
    this.releaseSubscriptions$.complete();
  }

  private setLoadedAccounts(accounts: Account[]) {
    this.accounts = accounts;
    this.dbStatus = DBStatus.DB_SUCCESS;
    let account = { name: '', status: 'choose' };
    this.createAccountForm.patchValue(account);
  }
  
  private setDBError(context: string, error: any) {
    this.dbStatus = DBStatus.DB_FAILED;
  }

  showNameError(): boolean { return this.nameErrorText() != ''; }

  nameErrorText(): string { 
    let form = this.createAccountForm.get('name');
    if (form === null || !(form.touched)) return "";

    if (form.errors?.['required']) return "Name is required.";
    if (form.errors?.['nameTaken']) return "This name is already in use.";

    return "";
}

  dbWaiting(): boolean { return this.dbStatus === DBStatus.DB_WAITING; }
  dbSuccess(): boolean { return this.dbStatus === DBStatus.DB_SUCCESS; }
  dbFailure(): boolean { return this.dbStatus === DBStatus.DB_FAILED; }

  readyToSubmit(): boolean { 
    if (!this.createAccountForm.dirty) return false;
    if (!this.createAccountForm.valid) return false;
    return true;
 }

  onSubmit(): void {
    let newAccount: Account = {
      sort_order: 1,
      ...this.createAccountForm.value
    };

    this.dbService.createAccount(newAccount)
      .pipe(takeUntil(this.releaseSubscriptions$)).subscribe({
        next: group => navigateToAccountEdit(this.router, group.id),
        error: err => this.errorService.showError("creating new group", err)
    });
  }

  notEqualTo(forbiddenValue: any): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value === forbiddenValue) {
        return { notEqualTo: { value: control.value } };
      }
      return null;
    };
  }
}
