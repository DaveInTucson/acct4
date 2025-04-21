import { Component, Input } from '@angular/core';
import { Account } from 'src/app/model/account';

@Component({
  standalone: false,
  selector: 'app-account-edit-link',
  templateUrl: './account-edit-link.component.html',
  styleUrls: ['./account-edit-link.component.css']
})
export class AccountEditLinkComponent {

  @Input() account: Account | null = null
  @Input() accountID: number = 0;
  @Input() caption: string | null = null;

  getAccountID() : number {
    if (this.account) return this.account.id;
    return this.accountID;
  }

  getCaption() {
    if (null !== this.caption) return this.caption;
    if (null != this.account) return this.account.name;
    return `account ${this.getAccountID()}`;
  }

}
