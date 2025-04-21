import { AfterViewInit, Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountDBService } from 'src/app/db/account-db.service';
import { HttpErrorService } from 'src/app/services/http-error.service';
import { Account, getAccountByID, getGroupContainersAndNonContainers, Group, updateAccount } from 'src/app/model/account';
import { unstringify } from 'src/app/util/convert';
import { DBStatus } from 'src/app/util/db-status';
import { combineLatest, Subject, take, takeUntil } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { navigateToAccountEdit, navigateToGroupEdit } from '../../navigation/navigation-functions';

@Component({
  standalone: false,
  selector: 'app-account-edit',
  templateUrl: './account-edit.component.html',
  styleUrls: ['./account-edit.component.css']
})
export class AccountEditComponent implements OnInit, AfterViewInit, OnDestroy {
  private releaseSubscriptions$ = new Subject<void>();
  private dbStatus: DBStatus = DBStatus.DB_WAITING;
  private viewIsReady: boolean = false;

  editAccountForm: FormGroup;
  accountID = 0;
  account: Account | null = null;
  accounts: Account[] = [];
  groups: Group[] = [];
  containingGroups: Group[] = [];
  nonContainingGroups: Group[] = [];
  resetTrigger = 0;

  //--------------------------------------------------------------------------
  //
  constructor(
    private activatedRoute: ActivatedRoute,
    private accountDB: AccountDBService,
    private errorService: HttpErrorService,
    private formBuilder: FormBuilder,
    private router: Router,
    private title: Title,
  ) {
    this.editAccountForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(1)], this.uniqueNameValidator.bind(this)],
      status: ['', Validators.required],
    });    
  }

  //--------------------------------------------------------------------------
  //
  uniqueNameValidator(control: any) {
    return new Promise(resolve => {
      //const nameExists = this.accounts!.some(acc => acc.name === control.value && acc.id !== this.paramID);
      const nameExists = this.accounts!.some(acc => this.checkAccount(acc, control));
      resolve(nameExists ? { nameTaken: true } : null);
    });
  }

  //--------------------------------------------------------------------------
  //
  private checkAccount(account: Account, control: any) : Boolean {
    if (account.name != control.value) return false;
    //console.log("account.id=", account.id, " paramID=", this.paramID);
    return account.id !== this.accountID;
  }

  //--------------------------------------------------------------------------
  //
  dbWaiting() : Boolean { return this.dbStatus === DBStatus.DB_WAITING; }
  dbSuccess() : Boolean { return this.dbStatus === DBStatus.DB_SUCCESS; }
  dbFailure() : Boolean { return this.dbStatus === DBStatus.DB_FAILED; }

  //--------------------------------------------------------------------------
  //
  ngOnInit(): void {
    this.dbStatus = DBStatus.DB_WAITING;
      combineLatest([
        this.activatedRoute.paramMap,
        this.accountDB.getAccountAll(),
        this.accountDB.getGroups()])
        .pipe(takeUntil(this.releaseSubscriptions$)).subscribe({
          next: ([params, accounts, groups]) => this.setAccountIDAndAccounts(
                Number(params.get("accountID")), unstringify(accounts), unstringify(groups)),
          error: err => this.setDBError("loading accounts", err)
  
        });
  }

  //--------------------------------------------------------------------------
  //
  ngAfterViewInit(): void {
      this.viewIsReady;
      this.setTitle();
  }

  //--------------------------------------------------------------------------
  //
  ngOnDestroy(): void {
      this.releaseSubscriptions$.next();
      this.releaseSubscriptions$.complete();
  }

  //--------------------------------------------------------------------------
  //
  private setAccountIDAndAccounts(accountID: number, accounts: Account[], groups: Group[]) {
    this.resetTrigger++;
    this.accountID = accountID;
    this.accounts = accounts;
    this.groups = groups;
    
    let split = getGroupContainersAndNonContainers(accountID, groups);
    this.containingGroups = split.containers;
    this.nonContainingGroups = split.noncontainers;
    this.displayAccount();
    this.dbStatus = DBStatus.DB_SUCCESS
  }

  //--------------------------------------------------------------------------
  //
  private displayAccount() {
    this.account = getAccountByID(this.accounts, this.accountID);
    if (this.account != null) {
      this.editAccountForm.patchValue(this.account);
    }
    this.setTitle();
  }

  //--------------------------------------------------------------------------
  //
  private setTitle() {
    if (!this.viewIsReady) return;
    let account_name = `unknown account ${this.accountDB}`;
    if (this.account !== null) account_name = this.account.name;
    this.title.setTitle(`Edit Account ${account_name}`);
  }

  //--------------------------------------------------------------------------
  //
  private setDBError(context: string, error: any) {
    this.dbStatus = DBStatus.DB_FAILED;
    this.errorService.showError(context, error);
  }

  //--------------------------------------------------------------------------
  //
  showNameError(): Boolean {
    return this.nameErrorText() !== "";
  }

  //--------------------------------------------------------------------------
  //
  nameErrorText(): string {
    let form = this.editAccountForm.get('name');
    if (form === null || !(form.touched)) return "";

    if (form.errors?.['required']) return "Name is required.";
    if (form.errors?.['nameTaken']) return "This name is already in use.";

    return "";
  }

  //--------------------------------------------------------------------------
  //
  readyToSubmit() : Boolean {
    if (!this.editAccountForm.dirty) return false;
    if (!this.editAccountForm.valid) return false;
    return true;
  }

  //--------------------------------------------------------------------------
  //
  onSubmit() {
    let updatedAccount: Account = { id: this.accountID, ...this.editAccountForm.value };
    updatedAccount.sort_order = this.account!.sort_order;
    this.accountDB.updateAccount(updatedAccount)
      .pipe(takeUntil(this.releaseSubscriptions$)).subscribe({
        next: result => this.setUpdatedResult(unstringify(result)),
        error: err => this.setDBError("updating account", err)
      });
  }

  //--------------------------------------------------------------------------
  //
  onClearChanges() {
    this.editAccountForm.reset(this.account);
  }

  //--------------------------------------------------------------------------
  //
  onAccountSelected(accountID: number) {
    navigateToAccountEdit(this.router, accountID);
  }

  //--------------------------------------------------------------------------
  //
  onGroupSelected(groupID: number): void {
    navigateToGroupEdit(this.router, groupID);
  }

  //--------------------------------------------------------------------------
  //
  onAddToGroup(group: Group): void {
    this.accountDB.addGroupMember(group.id, this.accountID)
      .pipe(takeUntil(this.releaseSubscriptions$))
      .subscribe({
        next: () => this.onAddedToGroup(group),
        error: error => this.setDBError("addToGroup", error)
      });
  }

  onAddedToGroup(group: Group) {
    group.members?.push(this.account!.id);
    this.nonContainingGroups = this.nonContainingGroups.filter( ncGroup => ncGroup.id != group.id);
    this.containingGroups.push(group);
    this.containingGroups.sort((a, b) => a.name.localeCompare(b.name));
  }

  onRemoveFromGroup(group: Group): void {
    this.containingGroups = this.containingGroups.filter( ncGroup => ncGroup.id != group.id);
    this.nonContainingGroups.push(group);
    this.nonContainingGroups.sort((a, b) => a.name.localeCompare(b.name));

  }

  //--------------------------------------------------------------------------
  //
  private setUpdatedResult(account: Account) {
    this.dbStatus = DBStatus.DB_SUCCESS;
    // console.log("updated account=", account);
    updateAccount(this.accounts!, account);
    this.account = account;
    this.editAccountForm.reset(account);
  }

  //--------------------------------------------------------------------------
  //
  getTransactionLinkCaption() : string {
    return `View ${this.account?.name ?? '???'} transactions`
  }
}
