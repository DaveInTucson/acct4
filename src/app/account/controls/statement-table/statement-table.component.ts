import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Account } from 'src/app/model/account';
import { Statement, Transaction } from 'src/app/model/statement';
import { moneyClass } from 'src/app/util/convert';

function moneyRound(value: number) : number {
  let rounded = Math.floor(value * 100 + 0.5)/100;
  //console.log("before =", value, "after =", rounded);
  return rounded;
}

class Balances {
  pendingBalance: number;
  clearedBalance: number;

  constructor(
    pendingBalance: number,
    clearedBalance: number
  ) {
    this.pendingBalance = pendingBalance;
    this.clearedBalance = clearedBalance;
  }
}

@Component({
  selector: 'app-statement-table',
  templateUrl: './statement-table.component.html',
  styleUrls: ['./statement-table.component.css']
})
export class StatementTableComponent implements OnInit, OnChanges {

  @Input() statement! : Statement
  @Output() editTransactionRequest = new EventEmitter<Transaction>();

  balances: Balances[] = [];
  totalDeposits: number = 0;
  totalWithdrawals: number = 0;

  ngOnInit() {
    this.computeBalances();
  }

  ngOnChanges(changes: SimpleChanges): void {
    //console.log("changes =", changes);
    if (changes['statement'])
      this.computeBalances();
  }

  private computeBalances() {
    let pendingBalance = this.statement.pending_opening_balance;
    let clearedBalance = this.statement.cleared_opening_balance;

    this.balances = [];
    this.totalDeposits = 0;
    this.totalWithdrawals = 0;

    this.statement.transactions.forEach(
      (transaction, index) => {
        if (transaction.status !== 'void') { 
          let amount = this.getTransactionAmount(index);
          if (amount > 0) this.totalDeposits += amount; else this.totalWithdrawals += amount;
          pendingBalance += amount;
        }
        if (transaction.status === 'cleared')
          clearedBalance += this.getTransactionAmount(index);
        this.balances.push(new Balances(moneyRound(pendingBalance), moneyRound(clearedBalance)));
      });

    this.totalDeposits = moneyRound(this.totalDeposits);
    this.totalWithdrawals = moneyRound(this.totalWithdrawals);
  }

  isWithdrawalTransaction(i: number) : boolean {
    return this.statement.transactions[i].from_id === this.statement.account_id;
  }

  getTransactionAmountClass(i: number) : string {
    if (this.isWithdrawalTransaction(i))
      return 'money withdrawal';
    return 'money';
  }

  getTransactionAmount(i: number) : number {
    let amount = this.statement.transactions[i].amount;
    if (this.isWithdrawalTransaction(i))
      amount *= -1;

    return amount;
  }

  getPendingBalance(i: number) : number {
    if (i < this.balances.length)
      return this.balances[i].pendingBalance;
    return 0;
  }

  getPendingBalanceClass(i: number) : string {
    if (this.getPendingBalance(i) < 0)
      return "money withdrawal";
    return "money";
  }

  getClearedBalance(i: number) : number {
    if (i < this.balances.length)
      return this.balances[i].clearedBalance;

    return 0;
  }

  getClearedBalanceClass(i: number) : string {
    if (this.getClearedBalance(i) < 0)
      return "money withdrawal";
    return "money";
  }

  getTargetAccount(i: number) : Account {
    let targetID = this.statement.transactions[i].from_id;
    if (targetID == this.statement.account_id)
      targetID = this.statement.transactions[i].to_id;

    let target = this.statement.accounts.find(account => account.id === targetID);
    
    if (target !== undefined) return target;
    
    return  { 
      id: targetID,
      name: `unknown account ${targetID}`,
      status: 'closed',
      sort_order: 0,
      groups: []
    };
  }

  buttonEditTransaction(transaction: Transaction) {
    this.editTransactionRequest.emit(transaction);
  }

  getMoneyClass(amount: number) : string {
    return moneyClass(amount);
  }
}
