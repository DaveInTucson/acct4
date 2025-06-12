import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, from, Subject, takeUntil } from 'rxjs';
import { AccountDBService } from 'src/app/db/account-db.service';
import { HttpErrorService } from 'src/app/services/http-error.service';
import { Account, getAccountByID, getGroupByID, Group, GroupSummary  } from 'src/app/model/account';
import { DateRange } from 'src/app/model/statement';
import { unstringify } from 'src/app/util/convert';
import { DBStatus } from 'src/app/util/db-status';
import { navigateToGroupSummary } from '../../navigation/navigation-functions';
import { SelectDateDialogComponent } from '../../dialogs/select-date-dialog/select-date-dialog.component';
import { Title } from '@angular/platform-browser';
import { moneyClass } from 'src/app/util/convert';

@Component({
  selector: 'app-group-summary',
  templateUrl: './group-summary.component.html',
  styleUrls: ['./group-summary.component.css'],
  standalone: false
})
export class GroupSummaryComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('selectDateRangeDialog') selectDateRangeDialog!: SelectDateDialogComponent;
  
  private dbStatus: DBStatus = DBStatus.DB_WAITING;
  private releaseSubscriptions$ = new Subject<void>();
  private viewIsInitialized = false;

  accounts: Account[] = [];
  groups: Group[] = [];
  groupID: number = 0;
  group: Group | null = null;
  fromDate: string | null = null;
  toDate: string | null = null;
  summary: GroupSummary | null = null;

  //--------------------------------------------------------------------------------
  //
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private title: Title,
    private dbService: AccountDBService,
    private errorService: HttpErrorService
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
    this.dbStatus = DBStatus.DB_WAITING;
    combineLatest([
        this.activatedRoute.paramMap,
        this.activatedRoute.queryParamMap,
        this.dbService.getAccountAll(),
        this.dbService.getGroups()

      ]).pipe(takeUntil(this.releaseSubscriptions$)).subscribe({
        next: ([params, queryParams, accounts, groups]) => 
                this.loadGroupSummary(
                  Number(params.get('groupID')), 
                  queryParams.get('from') || null,
                  queryParams.get('to') || null,
                  unstringify(accounts), unstringify(groups)),
        error: err => this.setDBError("loading accounts and groups", err)
      });
  }
  
  //--------------------------------------------------------------------------------
  //
  ngAfterViewInit(): void {
      this.viewIsInitialized = true;
      this.setTitle();
  }

  //--------------------------------------------------------------------------------
  //
  ngOnDestroy(): void {
    this.releaseSubscriptions$.next();
    this.releaseSubscriptions$.complete();    
  }

  //--------------------------------------------------------------------------------
  //
  private loadGroupSummary(groupID: number, fromDate: string | null, toDate: string | null, accounts: Account[], groups: Group[]) {
    this.errorService.clearError();
    this.groupID = groupID;
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.accounts = accounts;
    this.groups = groups;
    this.group = getGroupByID(this.groups, this.groupID);
    if (null === this.group) {
       this.dbStatus = DBStatus.DB_SUCCESS; 
       this.setTitle();
       return; 
      }

    this.dbService.getGroupSummary(groupID, fromDate, toDate)
      .pipe(takeUntil(this.releaseSubscriptions$))
      .subscribe({
        next: summary => this.setSummary(unstringify(summary)),
        error: err => this.setDBError("loading summary", err)
      });
  }

  //--------------------------------------------------------------------------------
  //
  private setSummary(summary: GroupSummary) {
    this.summary = summary;
    this.dbStatus = DBStatus.DB_SUCCESS;
    this.setTitle();
  }

  private setTitle() : void { 
    if (!this.viewIsInitialized) return;
    this.title.setTitle(this.getTitleCaption());
  }
  //--------------------------------------------------------------------------------
  //
  getTitleCaption(): string {
    let name = `unknown group ${this.groupID}`
    if (this.group) name = this.group.name;
    let caption = `Summary of group ${name}`;
    if (this.fromDate)
      caption += ` from ${this.fromDate}`;
    if (this.toDate)
      caption += ` to ${this.toDate}`;
    return caption;
  }

  //--------------------------------------------------------------------------------
  //
  onSelectNewDateRange() {
    this.selectDateRangeDialog.show();
  }

  //--------------------------------------------------------------------------------
  //
  onNewDateRangeSelected(dateRange: DateRange) {
    navigateToGroupSummary(this.router, this.groupID, dateRange.fromDate, dateRange.toDate);
  }

  //--------------------------------------------------------------------------------
  //
  onNewGroupSelected(groupID: number): void {
    navigateToGroupSummary(this.router, groupID, this.fromDate, this.toDate);
  }

  //--------------------------------------------------------------------------------
  //
  getAccountName(accountID: number) : string {
    let account = getAccountByID(this.accounts, accountID);
    if (account) return account.name;
    return `unknown account ${accountID}`;
  }

  //--------------------------------------------------------------------------------
  //
  getFromTotals() : number {
    let sum = 0;
    this.summary?.account_balances.forEach(balance => sum += balance.from_balance);
    return sum;
  }

  //--------------------------------------------------------------------------------
  //
  getToTotals() : number {
    let sum = 0;
    this.summary?.account_balances.forEach(balance => sum += balance.to_balance);
    return sum;
  }

  //--------------------------------------------------------------------------------
  //
  getDifferenceTotals(): number{
    let sum = 0;
    this.summary?.account_balances.forEach(balance => sum += balance.to_balance - balance.from_balance);
    return sum;
  }

  //--------------------------------------------------------------------------------
  //
  moneyClass(amount: number) : string {
    return moneyClass(amount);
  }
  
  //--------------------------------------------------------------------------------
  //
  private setDBError(context: string, error: any) {
    this.dbStatus = DBStatus.DB_FAILED;
    this.errorService.showError(context, error);
  }
}
