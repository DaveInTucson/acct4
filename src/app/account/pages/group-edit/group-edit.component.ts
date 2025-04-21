import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { AccountDBService } from 'src/app/db/account-db.service';
import { HttpErrorService } from 'src/app/services/http-error.service';
import { Account, getAccountByID, getGroupByID, getGroupByName, getMembersAndNonMembers, Group } from 'src/app/model/account';
import { unstringify } from 'src/app/util/convert';
import { DBStatus } from 'src/app/util/db-status';
import { navigateToAccountEdit, navigateToGroupEdit } from '../../navigation/navigation-functions';

@Component({
  selector: 'app-group-edit',
  templateUrl: './group-edit.component.html',
  styleUrls: ['./group-edit.component.css']
})
export class GroupEditComponent implements OnInit, AfterViewInit, OnDestroy {

  groupForm: FormGroup;
  groups: Group[] = [];
  accounts: Account[] = [];
  groupID: number = 0;
  group: Group | null = null;
  memberAccounts: Account[] = [];
  nonmemberAccounts: Account[] = [];
  
  groupSelectResetTrigger: number = 0;

  private dbStatus: DBStatus = DBStatus.DB_WAITING;
  private releaseSubscriptions$ = new Subject<void>();
  private viewIsInitialized = false;

  //--------------------------------------------------------------------------------
  //
  constructor(
    private dbService: AccountDBService,
    private errorService: HttpErrorService,
    private formBuilder: FormBuilder,
    private router: Router,
    private title: Title,
    private activatedRoute: ActivatedRoute,      
  ) {
    this.groupForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(1)], this.uniqueNameValidator.bind(this)],      
    });
  }
  
  //--------------------------------------------------------------------------------
  //
  private uniqueNameValidator(control: any) {
      return new Promise(resolve => {
        const lookup = getGroupByName(this.groups, control.value);
        const nameExists = lookup !== null && lookup.id != this.group?.id;
        resolve(nameExists ? { nameTaken: true } : null);
      });
  }

  //--------------------------------------------------------------------------------
  //
  dbWaiting(): boolean { return this.dbStatus === DBStatus.DB_WAITING; }
  dbSuccess(): boolean { return this.dbStatus === DBStatus.DB_SUCCESS; }
  dbFailure(): boolean { return this.dbStatus === DBStatus.DB_FAILED; }

  ngOnInit(): void {
      combineLatest([
        this.activatedRoute.paramMap,
        this.dbService.getAccountAll(),
        this.dbService.getGroups()])
        .pipe(takeUntil(this.releaseSubscriptions$)).subscribe({
          next: ([params, accounts, groups]) => this.setAccountsAndGroups(Number(params.get("groupID")), unstringify(accounts), unstringify(groups)),
          error: (err) => this.setDBError("load accounts and groups", err)
        });
  }

  ngAfterViewInit(): void {
      this.viewIsInitialized = true;
      this.setTitle();
  }

  ngOnDestroy(): void {
      this.releaseSubscriptions$.next();
      this.releaseSubscriptions$.complete();
  }

  setAccountsAndGroups(groupID: number, accounts: Account[], groups: Group[]) {
    this.groupID = groupID;
    this.accounts = accounts;
    this.groups = groups;
    this.group = getGroupByID(this.groups, groupID);

    if (this.group) {
      this.groupForm.patchValue(this.group);
    }

    if (this.group && this.group.members) {
      let membersAndNonmembers = getMembersAndNonMembers(this.accounts, this.group.members)
      this.memberAccounts = membersAndNonmembers.members;
      this.nonmemberAccounts = membersAndNonmembers.nonmembers;
    }
    else {
      this.memberAccounts = [];
      this.nonmemberAccounts = [];
    }

    this.setTitle();
    this.groupSelectResetTrigger++;
    this.dbStatus = DBStatus.DB_SUCCESS;
  }

  setTitle(): void {
    if (!this.viewIsInitialized) return;
    this.title.setTitle(`Edit ${this.getGroupName()}`);
  }

  showNameError() : boolean {
    return this.nameErrorText() !== '';
  }

  nameErrorText() : string {
    let form = this.groupForm.get('name');
    if (form === null || !(form.touched)) return "";

    if (form.errors?.['required']) return "Name is required.";
    if (form.errors?.['nameTaken']) return "This name is already in use.";

    return "";
  }

  okayToSave() : boolean {
    return this.groupForm.dirty && this.groupForm.valid
  }

  private setDBError(context: string, err: any) {
    this.dbStatus = DBStatus.DB_FAILED;
    this.errorService.showError(context, err);
  }

  onClearChanges() : void {
    this.groupForm.reset(this.group);
  }

  getGroupName() : string {
    if (this.group) return this.group.name;
    return `unknown group ${this.groupID}`;
  }

  onUpdateGroup() {
    let updatedGroup: Group = { id: this.groupID, ...this.groupForm.value };
    this.dbService.updateGroup(updatedGroup)
      .pipe(takeUntil(this.releaseSubscriptions$)).subscribe({
        next: result => this.setUpdatedGroup(unstringify(result)),
        error: err => this.setDBError("updating group", err)
      });
  }

  private setUpdatedGroup(updatedGroup: Group) {
    let index = this.groups.findIndex((group, index) => group.id === updatedGroup.id);
    this.groups[index] = updatedGroup;
    this.group = updatedGroup;
    this.groupForm.reset(updatedGroup);
  }

  onAddMember(account: Account) : void {
    this.dbService.addGroupMember(this.groupID, account.id)
      .pipe(takeUntil(this.releaseSubscriptions$)).subscribe({
        next: () => this.addMember(account.id),
        error: (err) => this.setDBError("add member", err)
      });
  }

  private addMember(accountID: number) {
    let account : Account = getAccountByID(this.nonmemberAccounts, accountID)!;
    this.nonmemberAccounts = this.nonmemberAccounts.filter(account => account.id !== accountID);
    this.memberAccounts.push(account);
  }

  onRemoveMember(account: Account): void {
    this.dbService.removeGroupMember(this.groupID, account.id)
      .pipe(takeUntil(this.releaseSubscriptions$)).subscribe({
        next: () => this.removeMember(account.id),
        error: (err) => this.setDBError("add member", err)
      });
  }

  private removeMember(accountID: number) {
    let account: Account = getAccountByID(this.memberAccounts, accountID)!;
    this.nonmemberAccounts.push(account);
    this.memberAccounts = this.memberAccounts.filter(account => account.id !== accountID);
  }

  onAnotherGroupSelected(anotherGroupID: number) : void {
    navigateToGroupEdit(this.router, anotherGroupID);
  }

  onEditAccount(accountID: number) : void {
    navigateToAccountEdit(this.router, accountID);
  }

}
