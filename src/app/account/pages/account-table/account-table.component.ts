import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { AccountDBService } from 'src/app/db/account-db.service';
import { HttpErrorService } from 'src/app/services/http-error.service';
import { Account, AccountTable, getAccountTableLength, Group, makeAccountTable } from 'src/app/model/account';
import { unstringify } from 'src/app/util/convert';
import { DBStatus } from 'src/app/util/db-status';

@Component({
  standalone: false,
  selector: 'app-account-table',
  templateUrl: './account-table.component.html',
  styleUrls: ['./account-table.component.css'],

})
export class AccountTableComponent implements OnInit, AfterViewInit, OnDestroy {
  private releaseSubscriptions$ = new Subject<void>();
  dbStatus: DBStatus = DBStatus.DB_WAITING
  accountTable: AccountTable | null = null
  groups: Group[] = [];
  
  constructor(
    private accountDB: AccountDBService,
    private titleService: Title,
    private errorService: HttpErrorService
  ) { }

  ngOnInit(): void {
    this.dbStatus = DBStatus.DB_WAITING
    combineLatest([
      this.accountDB.getAccountAll(),
      this.accountDB.getGroups()])
      .pipe(takeUntil(this.releaseSubscriptions$)).subscribe({
        next: ([accounts, groups]) => this.setAccountsAndGroups(unstringify(accounts), unstringify(groups)),
        error: (err) => this.setDBError("loading accounts", err)
    });
  }

  ngAfterViewInit(): void {
    // head is not available in ngOnInit
    this.titleService.setTitle("Account Table");
  }

  ngOnDestroy(): void {
    this.releaseSubscriptions$.next();
    this.releaseSubscriptions$.complete()
  }

  private setAccountsAndGroups(accounts: Account[], groups: Group[]) {
    this.accountTable = makeAccountTable(accounts);
    this.groups = groups;
    this.dbStatus = DBStatus.DB_SUCCESS;
  }

  private setDBError(context: string, error: any) {
    this.dbStatus = DBStatus.DB_FAILED;
    this.errorService.showError(context, error);
  }

  dbWaiting() { return this.dbStatus === DBStatus.DB_WAITING; }
  dbSuccess() { return this.dbStatus === DBStatus.DB_SUCCESS; }
  dbFailure() { return this.dbStatus === DBStatus.DB_FAILED; }

  havePinned(): boolean { 
    return  null !== this.accountTable && null !== this.accountTable.pinned && this.accountTable.pinned.length > 0;
  }

  haveActive(): boolean { 
    return  null !== this.accountTable && null !== this.accountTable.active && this.accountTable.active.length > 0;
  }

  haveSecondary(): boolean { 
    return  null !== this.accountTable && null !== this.accountTable.secondary && this.accountTable.secondary.length > 0;
  }

  haveClosed(): boolean { 
    return  null !== this.accountTable && null !== this.accountTable.closed && this.accountTable.closed.length > 0;
  }

  haveAccounts(): boolean {
    return this.havePinned() || this.haveAccounts() || this.haveSecondary() || this.haveClosed();
  }

  accountTableSize(): number {
    return getAccountTableLength(this.accountTable);
  }
}
