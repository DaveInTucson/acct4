import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccountTableComponent } from './account/pages/account-table/account-table.component';
import { AccountEditComponent } from './account/pages/account-edit/account-edit.component';
import { AccountStatementComponent } from './account/pages/account-statement/account-statement.component';
import { GroupCreateComponent } from './account/pages/group-create/group-create.component';
import { GroupEditComponent } from './account/pages/group-edit/group-edit.component';
import { AccountCreateComponent } from './account/pages/account-create/account-create.component';
import { GroupInAndOutComponent } from './account/pages/group-in-and-out/group-in-and-out.component';
import { GroupSummaryComponent } from './account/pages/group-summary/group-summary.component';
import { SearchComponent } from './account/pages/search/search.component';
import { SearchResultsComponent } from './account/pages/search-results/search-results.component';

const routes: Routes = [
  { path:'', component: AccountTableComponent },
  { path: 'account/new', component: AccountCreateComponent },
  { path: 'account/edit/:accountID', component: AccountEditComponent },
  { path: 'account/statement/:accountID', component: AccountStatementComponent },
  { path: 'group/new', component: GroupCreateComponent },
  { path: 'group/edit/:groupID', component: GroupEditComponent },
  { path: 'group/in-and-out/:groupID', component: GroupInAndOutComponent },
  { path: 'group/summary/:groupID', component: GroupSummaryComponent },
  { path: 'search', component: SearchComponent },
  { path: 'search-results', component: SearchResultsComponent },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
