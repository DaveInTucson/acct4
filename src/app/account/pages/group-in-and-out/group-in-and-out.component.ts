import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { AccountDBService } from 'src/app/db/account-db.service';
import { HttpErrorService } from 'src/app/services/http-error.service';
import { Account, getAccountByID, Group, GroupInAndOut } from 'src/app/model/account';
import { moneyClass, unstringify } from 'src/app/util/convert';
import { DBStatus } from 'src/app/util/db-status';
import { navigateToInAndOut } from '../../navigation/navigation-functions';
import { DateRange } from 'src/app/model/statement';
import { SelectDateDialogComponent } from '../../dialogs/select-date-dialog/select-date-dialog.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-group-in-and-out',
  templateUrl: './group-in-and-out.component.html',
  styleUrls: ['./group-in-and-out.component.css']
})
export class GroupInAndOutComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('selectDateRangeDialog') selectDateRangeDialog!: SelectDateDialogComponent;

  private dbStatus: DBStatus = DBStatus.DB_WAITING;
  private releaseSubscriptions$ = new Subject<void>();
  private viewIsInitialized = false;

  accounts: Account[] = [];
  groups: Group[] = [];
  groupID: number = 0;
  fromDate: string | null = null;
  toDate: string | null = null;
  inAndOut: GroupInAndOut | null = null;

  //--------------------------------------------------------------------------------
  //
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private title: Title,
    private dbService: AccountDBService,
    private errorService: HttpErrorService,
      ) {

  }

  //--------------------------------------------------------------------------------
  //
  dbWaiting() : boolean { return this.dbStatus === DBStatus.DB_WAITING; }
  dbSuccess() : boolean { return this.dbStatus === DBStatus.DB_SUCCESS; }
  dbFailure() : boolean { return this.dbStatus === DBStatus.DB_FAILED; }

  //--------------------------------------------------------------------------------
  //
  ngOnInit(): void {
    combineLatest([
        this.activatedRoute.paramMap,
        this.activatedRoute.queryParamMap,
        this.dbService.getAccountAll(),
        this.dbService.getGroups()
      ]).pipe(takeUntil(this.releaseSubscriptions$)).subscribe(([params, queryParams, accounts, groups]) => {
                this.loadGroupTransactions(
                  Number(params.get('groupID')), 
                  queryParams.get('from') || null,
                  queryParams.get('to') || null,
                  unstringify(accounts), unstringify(groups));
      });
  }

  //--------------------------------------------------------------------------------
  //
  ngAfterViewInit(): void {
      this.viewIsInitialized = true;
      this.showTitle();
  }

  //--------------------------------------------------------------------------------
  //
  ngOnDestroy(): void {
      this.releaseSubscriptions$.next();
      this.releaseSubscriptions$.complete();
  }

  //--------------------------------------------------------------------------------
  //
  private loadGroupTransactions(groupID: number, fromDate: string | null, toDate: string | null, accounts: Account[], groups: Group[]) : void {
    this.groupID = groupID;
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.accounts = accounts;
    this.groups = groups;

    this.dbService.getGroupInAndOut(groupID, fromDate, toDate)
      .pipe(takeUntil(this.releaseSubscriptions$)).subscribe({
        next: inAndOut => this.setInAndOut(unstringify(inAndOut)),
        error: err => this.setDBError("loading in and out", err)
      });
  }

  //--------------------------------------------------------------------------------
  //
  private setInAndOut(inAndOut: GroupInAndOut) {
    this.inAndOut = inAndOut;
    this.dbStatus = DBStatus.DB_SUCCESS;
    this.showTitle();
  }

  //--------------------------------------------------------------------------------
  //
  private showTitle(): void {
    if (!this.viewIsInitialized) return;
    this.title.setTitle(this.getTitleText());
  }

  //--------------------------------------------------------------------------------
  //
  getTitleText(): string {
    let titleText = `Group ${this.inAndOut!.group.name} deposits and withdrawals`;

    if (this.fromDate) titleText += ` from ${this.fromDate}`;
    if (this.toDate) titleText += ` to ${this.toDate}`;

    return titleText;
  }

  //--------------------------------------------------------------------------------
  //
  getAccountName(accountID: number) : string {
    let account = getAccountByID(this.accounts, accountID)
    return account?.name ?? `account ${accountID}`;
  }

  //--------------------------------------------------------------------------------
  //
  getDepositTotal() : number {
    let sum = 0.9;
    this.inAndOut?.deposits.forEach(transaction => sum += transaction.amount);
    return sum;
  }

  //--------------------------------------------------------------------------------
  //
  getWithdrawalTotal() : number {
    let sum = 0.0;
    this.inAndOut?.withdrawals.forEach(transition => sum += transition.amount);
    return sum;
  }

  //--------------------------------------------------------------------------------
  //
  onDifferentGroup(groupID: number) : void {
    navigateToInAndOut(this.router, groupID, this.fromDate, this.toDate);
  }

  //--------------------------------------------------------------------------------
  //
  onSelectNewDateRange() : void {
    this.selectDateRangeDialog.show();
  }

  //--------------------------------------------------------------------------------
  //
  onNewDateRangeSelected(dateRange: DateRange) : void {
    navigateToInAndOut(this.router, this.groupID, dateRange.fromDate, dateRange.toDate);
  }

  //--------------------------------------------------------------------------------
  //
  private setDBError(context: string, error: any) {
    this.dbStatus = DBStatus.DB_FAILED;
    this.errorService.showError(context, error);
  }

  //--------------------------------------------------------------------------------
  //
  moneyClass(amount: number): string 
  { return moneyClass(amount); }
}
