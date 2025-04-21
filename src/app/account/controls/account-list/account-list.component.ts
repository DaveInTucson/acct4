import { Component, Input } from '@angular/core';
import { Account } from 'src/app/model/account';

@Component({
  standalone: false,
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css']
})
export class AccountListComponent {

  @Input() accounts: Account[] = [];
}
