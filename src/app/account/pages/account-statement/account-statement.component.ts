import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { AccountDBService } from 'src/app/db/account-db.service';
import { HttpErrorService } from 'src/app/services/http-error.service';
import { DateRange, Statement, Transaction } from 'src/app/model/statement';
import { unstringify } from 'src/app/util/convert';
import { DBStatus } from 'src/app/util/db-status';
import { TransactionDialogComponent } from '../../dialogs/transaction-dialog/transaction-dialog.component';
import { SelectDateDialogComponent } from '../../dialogs/select-date-dialog/select-date-dialog.component';
import { Account, Group } from 'src/app/model/account';
import { navigateToAccountStatement } from '../../navigation/navigation-functions';

@Component({
  selector: 'app-account-statement',
  templateUrl: './account-statement.component.html',
  styleUrls: ['./account-statement.component.css']
})
export class AccountStatementComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('transactionDialog') transactionDialog!: TransactionDialogComponent;
  @ViewChild('selectDateRangeDialog') selectDateRangeDialog!: SelectDateDialogComponent;
  
  private releaseSubscriptions$ = new Subject<void>();
  private dbStatus: DBStatus = DBStatus.DB_WAITING;
  private viewInitialized = false;
  groupSelectResetTrigger: number = 0;
  statement: Statement | null = null;
  groups: Group[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private accountService: AccountDBService,
    private errorService: HttpErrorService,
    private router: Router,    
    private titleService: Title
  ) {}

  ngOnInit() {
    combineLatest([
      this.activatedRoute.paramMap,
      this.activatedRoute.queryParamMap])
        .pipe(takeUntil(this.releaseSubscriptions$)).subscribe(([params, queryParams]) => {
          this.loadStatementFromDB(
            Number(params.get('accountID')), 
            queryParams.get('from') || null,
            queryParams.get('to') || null);
    });
  }

  ngAfterViewInit(): void {
      this.viewInitialized = true;
      this.setTitle();
  }

  ngOnDestroy(): void {
    this.releaseSubscriptions$.next();
    this.releaseSubscriptions$.complete();
  }

  dbWaiting() : Boolean { return this.dbStatus === DBStatus.DB_WAITING; }
  dbSuccess() : Boolean { return this.statement !== null; }
  dbFailure() : Boolean { return this.dbStatus === DBStatus.DB_FAILED; }

  private loadStatementFromDB(accountID: number, fromDate: string | null, toDate: string | null) {
    this.dbStatus = DBStatus.DB_WAITING;
    combineLatest([
      this.accountService.getStatement(accountID, fromDate, toDate),
      this.accountService.getAccountGroups(accountID)])
      .pipe(takeUntil(this.releaseSubscriptions$)).subscribe({
        next: ([statement, groups]) => this.setStatementAndGroups(unstringify(statement), unstringify(groups)),
        error: err => this.setDBError("loading statement", err)
      });
  }

  private setStatementAndGroups(statement: Statement, groups: Group[]) {
    this.dbStatus = DBStatus.DB_SUCCESS;
    this.statement = statement;
    this.groups = groups;
    this.groupSelectResetTrigger++;
    this.setTitle();
  }

  private setTitle() {
    if (!this.viewInitialized) return;
    switch (this.dbStatus) {
      case DBStatus.DB_WAITING: this.titleService.setTitle("Statement waiting for database"); break;
      case DBStatus.DB_SUCCESS: this.titleService.setTitle(this.getStatementTitle()); break;
      case DBStatus.DB_FAILED: this.titleService.setTitle("Statement database failed"); break;
    }
  }

  getStatementTitle() : string {
    let statementTitle = `Statement for ${this.getAccountName()}`;
    if (this.statement?.from_date)
      statementTitle += ` from ${this.statement.from_date}`;
    if (this.statement?.to_date)
      statementTitle += ` to ${this.statement.to_date}`;

    return statementTitle;
  }

  private setDBError(context: string, error: any) {
    this.errorService.showError(context, error);
    this.setTitle();
  }

  private clearDBError() { this.errorService.clearError(); }

  getAccount() : Account | null {
    if (this.statement !== null) {
      return this.statement.accounts.find(account => this.statement?.account_id == account.id) ?? null;
    }

    return null;
  }

  getAccountName() : string {
    let account = this.getAccount();
    if (account !== null) return account.name;

    if (this.statement !== null)
      return `account ${this.statement.account_id}`;

    return "null statement, no account";
  }

  getEditAccountCaption(): string {
    let account = this.getAccount();
    if (account) return `Edit account ${account.name}`
    if (this.statement)
      return `Edit account ${this.statement.account_id}`

    return "null statement?!";
  }

  onNewTransactionRequest() {
    this.transactionDialog.createTransaction(this.statement!.accounts);
  }

  buttonSelectDateRange() {
    this.selectDateRangeDialog.show()
  }

  onDateRangeSelected(dateRange: DateRange) {
    this.router.navigate([`/account/statement/${this.statement!.account_id}`], 
      { queryParams: { from: dateRange.fromDate, to: dateRange.toDate}}
    );
  }

  onEditTransactionRequest(transaction: Transaction) {
    this.transactionDialog.editTransaction(this.statement!.accounts, transaction);
  }

  onNewTransactionReady(transaction: Transaction) {
    //console.log("transactionDialogCreateTransaction, event =", transaction);
    this.clearDBError();
    this.accountService.createTransaction(transaction)
      .pipe(takeUntil(this.releaseSubscriptions$)).subscribe({
        next: (transaction) => this.loadStatementFromDB(this.statement!.account_id, this.statement!.from_date, this.statement!.to_date),
        error: err => this.setDBError("creating transaction", err)
    });
  }

  onUpdatedTransactionReady(transaction: Transaction) {
    //console.log("onUpdatedTransactionReady, event =", transaction);
    this.clearDBError()
    this.accountService.updateTransaction(transaction)
    .pipe(takeUntil(this.releaseSubscriptions$)).subscribe({
      next: (transaction) => this.loadStatementFromDB(this.statement!.account_id, this.statement!.from_date, this.statement!.to_date),
      error: err => this.setDBError("updating transaction", err)
    });
  }

  onDifferentAccountSelected(accountID: number) {
    navigateToAccountStatement(this.router, accountID, this.statement?.from_date ?? null, this.statement?.to_date ?? null);
  }
}
