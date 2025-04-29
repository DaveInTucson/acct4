import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AccountEditLinkComponent } from './navigation/account-edit-link/account-edit-link.component';
import { AccountTransactionsLinkComponent } from './navigation/account-statement-link/account-statement-link.component';
import { AccountListComponent } from './controls/account-list/account-list.component';
import { StatementTableComponent } from './controls/statement-table/statement-table.component';
import { TransactionDialogComponent } from './dialogs/transaction-dialog/transaction-dialog.component';
import { AccountTableComponent } from './pages/account-table/account-table.component';
import { AccountEditComponent } from './pages/account-edit/account-edit.component';
import { AccountStatementComponent } from './pages/account-statement/account-statement.component';
import { AccountSelector2Component } from './controls/account-selector/account-selector.component';
import { SelectDateDialogComponent } from './dialogs/select-date-dialog/select-date-dialog.component';
import { GroupCreateComponent } from './pages/group-create/group-create.component';
import { GroupEditComponent } from './pages/group-edit/group-edit.component';
import { GroupListComponent } from './controls/group-list/group-list.component';
import { AccountCreateComponent } from './pages/account-create/account-create.component';
import { GroupEditLinkComponent } from './navigation/group-edit-link/group-edit-link.component';
import { GroupSelectorComponent } from './controls/group-selector/group-selector.component';
import { GroupInAndOutComponent } from './pages/group-in-and-out/group-in-and-out.component';
import { GroupInAndOutLinkComponent } from './navigation/group-in-and-out-link/group-in-and-out-link.component';
import { GroupSummaryComponent } from './pages/group-summary/group-summary.component';
import { GroupSummaryLinkComponent } from './navigation/group-summary-link/group-summary-link.component';
import { SummaryGraphComponent } from './controls/summary-graph/summary-graph.component';
import { SearchComponent } from './pages/search/search.component';
import { TopNavComponent } from './controls/top-nav/top-nav.component';
import { SearchResultsComponent } from './pages/search-results/search-results.component';
import { TransactionTableComponent } from './controls/transaction-table/transaction-table.component';


@NgModule({
  declarations: [
    AccountTableComponent,
    AccountListComponent,
    AccountEditComponent,
    AccountCreateComponent,
    AccountEditLinkComponent,
    AccountStatementComponent,
    AccountTransactionsLinkComponent,
    StatementTableComponent,
    TransactionDialogComponent,
    AccountSelector2Component,
    SelectDateDialogComponent,
    GroupCreateComponent,
    GroupEditComponent,
    GroupListComponent,
    GroupEditLinkComponent,
    GroupSelectorComponent,
    GroupInAndOutComponent,
    GroupInAndOutLinkComponent,
    GroupSummaryComponent,
    GroupSummaryLinkComponent,
    SummaryGraphComponent,
    SearchComponent,
    TopNavComponent,
    SearchResultsComponent,
    TransactionTableComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AccountModule { }
