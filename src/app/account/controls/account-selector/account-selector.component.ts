import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Account } from 'src/app/model/account';

@Component({
  selector: 'app-account-selector',
  templateUrl: './account-selector.component.html',
  styleUrls: ['./account-selector.component.css']
})
export class AccountSelector2Component implements OnChanges {

  @Input() accounts: Account[] = [];
  @Input() accountID: number = 0;
  @Input() showClosed: boolean = true;
  @Input() caption: string = "Select an account";
  @Input() resetTrigger: any; // Used to trigger a reset
  @Output() selected = new EventEmitter<number>();
  @ViewChild('accountSelector') accountSelector! : ElementRef<HTMLSelectElement>;

  ngAfterViewInit(): void {
      this.setSelectedValue(this.accountID);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetTrigger']) {
      console.log("reset trigger detected");
      this.setSelectedValue(0)
    }
    else if (changes['accountID']) {
      this.setSelectedValue(changes['accountID'].currentValue);
    }
  }

  onAccountChange(event: Event) {
    this.accountID = Number((event.target as HTMLSelectElement).value);
    this.selected.emit(this.accountID);
  }

  get sortedAccounts(): Account[] {
    return this.accounts
      .filter(acc => this.showClosed || acc.status !== 'closed');
      
  }

  isNewStatusGroup(index: number): boolean {
    if (index === 0) return false;
    return this.sortedAccounts[index].status !== this.sortedAccounts[index - 1].status;
  }

  setSelectedValue(value: number) : void {
    if (this.accountSelector) {
      this.accountSelector.nativeElement.value = value.toString();
    }
  }
}
