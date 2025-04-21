import { Component, Input } from '@angular/core';
import { Account } from 'src/app/model/account';
import { JustDate } from 'src/app/util/JustDate';

@Component({
  selector: 'app-account-statement-link',
  templateUrl: './account-statement-link.component.html',
  styleUrls: ['./account-statement-link.component.css']
})
export class AccountTransactionsLinkComponent {

  @Input() account: Account | null = null;
  @Input() accountID: number = 0;
  @Input() caption: string | null = null;
  @Input() fromDate: string | null = null;
  @Input() toDate: string | null = null;

  getAccountID(): number {
    if (this.account !== null) return this.account.id;
    return this.accountID;
  }

  getCaption(): string {
    if (this.caption !== null) return this.caption;
    if (this.account !== null) return this.account.name;
    return `account ${this.accountID}`;
  }

  getQueryParms(): Object | null {
    if (this.fromDate !== null || this.toDate !== null)
      return { from: this.fromDate, to: this.toDate };

    return null;
  }
}
