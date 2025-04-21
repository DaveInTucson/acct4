import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { AccountDBService } from 'src/app/db/account-db.service';
import { HttpErrorService } from 'src/app/services/http-error.service';
import { Account, getAccountByID, getGroupByID, Group } from 'src/app/model/account';
import { paramMap2SearchParams, SearchParms } from 'src/app/model/search';
import { unstringify } from 'src/app/util/convert';
import { DBStatus } from 'src/app/util/db-status';
import { Transaction } from 'src/app/model/statement';
import { Title } from '@angular/platform-browser';

//--------------------------------------------------------------------------------
//
function getCmpDescription(cmp: string) : string {
  if (cmp === 'EQ') return 'is';
  if (cmp === 'NE') return 'is not';
  if (cmp === 'regexp') return 'matches';
  if (cmp === 'not-regexp') return "doesn't match";
  return cmp;
}

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit, AfterViewInit, OnDestroy {
  private dbStatus: DBStatus = DBStatus.DB_WAITING;
  private releaseSubscriptions$: Subject<void> = new Subject();
  
  private searchParams: SearchParms | null = null;
  fromDate : string | null = null;
  toDate: string | null = null;

  accounts: Account[] = [];
  groups: Group[] = [];
  transactions: Transaction[] = [];

  //--------------------------------------------------------------------------------
  //
  dbWaiting() : boolean { return this.dbStatus == DBStatus.DB_WAITING; }
  dbSuccess() : boolean { return this.dbStatus == DBStatus.DB_SUCCESS; }
  dbFailure() : boolean { return this.dbStatus == DBStatus.DB_FAILED; }

  //--------------------------------------------------------------------------------
  //
  constructor(
    private activatedRoute: ActivatedRoute,
    private title: Title,
    private dbService: AccountDBService,
    private errorService: HttpErrorService
  ) {}

  //--------------------------------------------------------------------------------
  //
  ngOnInit(): void {
    combineLatest([
      this.activatedRoute.queryParamMap,
      this.dbService.getAccountAll(),
      this.dbService.getGroups()])
      .pipe(takeUntil(this.releaseSubscriptions$))
      .subscribe({
        next: ([paramMap, accounts, groups]) => this.setParamsAndAccounts(paramMap, unstringify(accounts), unstringify(groups)),
        error: err => this.setDBError("loading accounts", err)});
  }

  //--------------------------------------------------------------------------------
  //
  ngAfterViewInit(): void {
      this.title.setTitle('Search Results');
  }

  //--------------------------------------------------------------------------------
  //
  private setParamsAndAccounts(paramMap: ParamMap, accounts: Account[], groups: Group[]) {
    this.accounts = accounts;
    this.groups = groups;
    this.searchParams = paramMap2SearchParams(paramMap);
    this.fromDate = this.searchParams.fromDate
    this.toDate = this.searchParams.toDate;

    this.dbService.searchTransactions(this.searchParams)
      .pipe(takeUntil(this.releaseSubscriptions$))
      .subscribe({
        next: transactions => this.setMatchingTransactions(unstringify(transactions)),
        error: err => this.setDBError('searching', err)
      })
  }

  //--------------------------------------------------------------------------------
  //
  ngOnDestroy(): void {
    this.releaseSubscriptions$.next();
    this.releaseSubscriptions$.complete();
  }

  //--------------------------------------------------------------------------------
  //
  private setMatchingTransactions(transactions: Transaction[]) : void {
    this.transactions = transactions;
    this.dbStatus = DBStatus.DB_SUCCESS;
  }

  //--------------------------------------------------------------------------------
  //
  getAccount(accountID: number) : Account {
    let account = getAccountByID(this.accounts, accountID);
    if (account) return account;
    return {
      id: accountID,
      name: `account ${accountID}`,
      status: 'closed',
      sort_order: 0,
      groups: [],
    };
  }

  //--------------------------------------------------------------------------------
  //
  private setDBError(context: string, error: any): void {
    this.errorService.showError(context, error);
  }

  //--------------------------------------------------------------------------------
  //
  private getName(type: string, value: number) : string {
    if (type === 'account') {
      let account = getAccountByID(this.accounts, value);
      if (null !== account) return account.name;
      return `unknown account ${value}`;
    }
    if (type === 'group') {
      let group = getGroupByID(this.groups, value);
      if (null !== group) return group.name;
      return `unknown group ${value}`;
    }
    return `unknown type ${type}`;
  }

  //--------------------------------------------------------------------------------
  //
  getAmountTotal(): number {
    let total = 0;
    this.transactions.forEach(transaction => {
      total += transaction.amount;
    })

    return total;
  }
  //--------------------------------------------------------------------------------
  //
  hasFromFilter() : boolean 
  { return this.searchParams !== null && this.searchParams.fromType !== null && this.searchParams.fromType !== ''; }

  //--------------------------------------------------------------------------------
  //
  fromFilterDescription() : string {
    if (this.searchParams && this.searchParams.fromType) {
      let name = this.getName(this.searchParams.fromType, this.searchParams.fromValue)
      return `From ${this.searchParams.fromType} ${getCmpDescription(this.searchParams.fromCmp)} ${name}`;
    }
    return "missing params or fromType";
  }

  //--------------------------------------------------------------------------------
  //
  hasToFilter() : boolean
  { return this.searchParams !== null && this.searchParams.toType !== null && this.searchParams.toType !== ''; }

  //--------------------------------------------------------------------------------
  //
  toFilterDescription() : string {
    if (this.searchParams && this.searchParams.toType) {
      let name = this.getName(this.searchParams.toType, this.searchParams.toValue)
      return `To ${this.searchParams.toType} ${getCmpDescription(this.searchParams.toCmp)} ${name}`;
    }
    return "missing params or toType";
  }

  //--------------------------------------------------------------------------------
  //
  hasStatusFilter() : boolean
  { return this.searchParams !== null && this.searchParams.statusCmp !== ''; }

  //--------------------------------------------------------------------------------
  //
  statusFilterDescription() : string {
    if (this.searchParams && this.searchParams.statusCmp !== '') {
      return `Status ${getCmpDescription(this.searchParams.statusCmp)} ${this.searchParams.statusValue}`;
    }

    return 'missing search params or statusCmp'
  }

  //--------------------------------------------------------------------------------
  //
  hasDateFilter() : boolean 
  { return this.searchParams !== null && (this.searchParams.fromDate !== null || this.searchParams.toDate !== null); }

  //--------------------------------------------------------------------------------
  //
  dateFilterDescription() : string {
    if (this.searchParams) {
      if (this.searchParams.fromDate !== '' && this.searchParams.toDate !== null)
        return `posted date is between ${this.searchParams.fromDate} and ${this.searchParams.toDate}`;
      if (this.searchParams.fromDate !== null)
        return `posted date is on or after ${this.searchParams.fromDate}`;
      if (this.searchParams.toDate !== null)
        return `posted date is on or before ${this.searchParams.toDate}`;
      return "missing from and to date?!";
    }
    return 'missing search params';
  }

  //--------------------------------------------------------------------------------
  //
  hasNoteFiler() : boolean
  { return this.searchParams !== null && this.searchParams.noteCmp !== ''; }

  //--------------------------------------------------------------------------------
  //
  noteFilterDescription() : string {
    if (this.searchParams)
      return `note ${getCmpDescription(this.searchParams.noteCmp)} expression ${this.searchParams.noteRE}`;

    return 'missing search params';
  }
}
