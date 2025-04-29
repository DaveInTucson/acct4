import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { AccountDBService } from 'src/app/db/account-db.service';
import { HttpErrorService } from 'src/app/services/http-error.service';
import { Account, Group } from 'src/app/model/account';
import { DateRange } from 'src/app/model/statement';
import { unstringify } from 'src/app/util/convert';
import { DBStatus } from 'src/app/util/db-status';
import { SelectDateDialogComponent } from '../../dialogs/select-date-dialog/select-date-dialog.component';
import { constrainRECmp, makeDefaultSearchParms, makeEmptySearchParms, SearchFlags, SearchParms } from 'src/app/model/search';
import { Title } from '@angular/platform-browser';
import { navigateToSearchResults } from '../../navigation/navigation-functions';
import { Router } from '@angular/router';
import { CacheService } from '../../services/cache.service';



@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('selectDateRangeDialog') selectDateRangeDialog!: SelectDateDialogComponent;
  
  private dbStatus: DBStatus = DBStatus.DB_WAITING;
  private releaseSubscriptions$: Subject<void> = new Subject();

  searchParms : SearchParms = makeDefaultSearchParms();
  searchFlags : SearchFlags = new SearchFlags();

  groups: Group[] = [];
  accounts: Account[] = [];

  //--------------------------------------------------------------------------------
  //
  constructor(
    private router: Router,
    private title: Title,
    private dbService: AccountDBService,
    private cacheService: CacheService,
    private errorService: HttpErrorService
  ) {}

  //--------------------------------------------------------------------------------
  //
  dbWaiting(): boolean { return this.dbStatus === DBStatus.DB_WAITING; }
  dbSuccess(): boolean { return this.dbStatus === DBStatus.DB_SUCCESS; }
  dbFailure(): boolean { return this.dbStatus === DBStatus.DB_FAILED; }

  //--------------------------------------------------------------------------------
  //
  ngOnInit(): void {
    this.dbStatus = DBStatus.DB_WAITING
    combineLatest([
      this.dbService.getAccountAll(),
      this.dbService.getGroups()])
      .pipe(takeUntil(this.releaseSubscriptions$)).subscribe({
        next: ([accounts, groups]) => this.setAccountsAndGroups(unstringify(accounts), unstringify(groups)),
        error: (err) => this.setDBError("load accounts and groups", err)
      });
  }

  //--------------------------------------------------------------------------------
  //
  private setAccountsAndGroups(accounts: Account[], groups: Group[]) {
    this.accounts = accounts;
    this.groups = groups;

    let savedSearchFlags = this.cacheService.getSearchFlags();
    let savedSearchParms = this.cacheService.getSearchParms();

    if (null != savedSearchFlags)
      this.searchFlags = savedSearchFlags;

    if (null !== savedSearchParms)
      this.searchParms = savedSearchParms;

    this.dbStatus = DBStatus.DB_SUCCESS
  }

  //--------------------------------------------------------------------------------
  //
  private setDBError(context: string, error: any) : void {
    this.dbStatus = DBStatus.DB_FAILED;
    this.errorService.showError(context, error);
  }

  //--------------------------------------------------------------------------------
  //
  ngAfterViewInit(): void {
      this.title.setTitle("Select search parameters");
  }

  //--------------------------------------------------------------------------------
  //
  ngOnDestroy(): void {
      this.releaseSubscriptions$.next();
      this.releaseSubscriptions$.complete();
  }

  //--------------------------------------------------------------------------------
  //
  onSelectFromValue(value: number) : void { 
    this.searchFlags.filterFrom = true;
    this.searchParms.fromValue = value; 
  }

  //--------------------------------------------------------------------------------
  //
  onSelectToValue(value: number) : void { 
    this.searchFlags.filterTo = true;
    this.searchParms.toValue = value; 
  }

  //--------------------------------------------------------------------------------
  //
  onSelectDateRange(): void {
    this.selectDateRangeDialog.show();
  }

  //--------------------------------------------------------------------------------
  //
  setFilterFrom(value: boolean) : void { this.searchFlags.filterFrom = value; }
  setFilterTo(value: boolean) : void { this.searchFlags.filterTo = value; }
  setFilterStatus(value: boolean) : void { this.searchFlags.filterStatus = value; }
  setFilterNote(value: boolean) : void { this.searchFlags.filterNote = value; }
  
  //--------------------------------------------------------------------------------
  //
  getDateRangeDescription(): string {
    if (null === this.searchParms.fromDate && null == this.searchParms.toDate) return "any date";
    if (null === this.searchParms.fromDate) return `on or before ${this.searchParms.toDate}`;
    if (null === this.searchParms.toDate) return `on or after ${this.searchParms.fromDate}`
    return `between  ${this.searchParms.fromDate} and ${this.searchParms.toDate}`;
  }

  //--------------------------------------------------------------------------------
  //
  onDateRangeSelected(dateRange: DateRange): void {
    this.searchFlags.filterDate = true;
    this.searchParms.fromDate = dateRange.fromDate;
    this.searchParms.toDate = dateRange.toDate;
  }

  //--------------------------------------------------------------------------------
  //
  private validateSelections(): boolean {
    if (this.searchFlags.filterCount() === 0) {
      alert("You must specify at least one filter to search");
      return false;
    }

    if (this.searchFlags.filterFrom && this.searchParms.fromValue === 0) {
      alert(`You must specify a from ${this.searchParms.fromType}`);
      return false;
    }

    if (this.searchFlags.filterTo && this.searchParms.toValue === 0) {
      alert(`You must specify a to ${this.searchParms.toType}`);
      return false;
    }

    if (this.searchFlags.filterNote && this.searchParms.noteRE === '') {
      alert("you must specify a regular expression to filter by note");
      return false;
    }

    return true;
  }

  //--------------------------------------------------------------------------------
  //
  onClearEntries(): void {
    this.searchFlags.clear();
    this.searchParms = makeDefaultSearchParms();
  }

  //--------------------------------------------------------------------------------
  //
  onSearch(): void {
    if (!this.validateSelections()) return;

    let searchParms = makeEmptySearchParms();
    if (this.searchFlags.filterFrom) {
      searchParms.fromType = this.searchParms.fromType;
      searchParms.fromCmp = this.searchParms.fromCmp;
      searchParms.fromValue = this.searchParms.fromValue;
    }

    if (this.searchFlags.filterTo) {
      searchParms.toType = this.searchParms.toType
      searchParms.toCmp = this.searchParms.toCmp;
      searchParms.toValue = this.searchParms.toValue;
    }

    if (this.searchFlags.filterStatus) {
      searchParms.statusCmp = this.searchParms.statusCmp;
      searchParms.statusValue = this.searchParms.statusValue;
    }

    if (this.searchFlags.filterDate) {
      searchParms.fromDate = this.searchParms.fromDate;
      searchParms.toDate = this.searchParms.toDate;
    }

    if (this.searchFlags.filterNote) {
      searchParms.noteCmp = constrainRECmp(this.searchParms.noteCmp);
      searchParms.noteRE = this.searchParms.noteRE;
    }

    this.cacheService.setSearchParms(this.searchFlags, this.searchParms);
    navigateToSearchResults(this.router, searchParms);
  }
}
