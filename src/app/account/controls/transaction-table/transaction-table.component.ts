import { Component, Input } from '@angular/core';
import { Account, getAccountByID } from 'src/app/model/account';
import { Transaction, transactionCompareByAmount, transactionCompareByDate, transactionCompareByFrom, transactionCompareByNote, transactionCompareByTo } from 'src/app/model/statement';

@Component({
  selector: 'app-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.css'],
  standalone: false
})
export class TransactionTableComponent {

  @Input() accounts: Account[] = [];
  @Input() transactions: Transaction[] = [];
  @Input() showFrom : boolean = true;
  @Input() showTo : boolean = true;
  @Input() showStatus: boolean = false;
  @Input() fromDate: string | null = null;
  @Input() toDate: string | null = null;

  private sortColumn: "date" | "from"| "to" | "amount" | "status" | "note" = "date";
  private sortDirection: "asc" | "desc" | "default" = "asc";

  getAccountByID(accountID: number): Account {
    return getAccountByID(this.accounts, accountID);
  }

  getAmountTotal() {
    let total = 0;
    this.transactions.forEach(transaction => {
      if (transaction.status !== 'void') {
        total += transaction.amount;
      }
    });
    return total;
  }

  private nextSortDirection(currentDirection: "asc" | "desc" | "default"): "asc" | "desc" | "default" {
    switch (currentDirection) {
      case "asc": return "desc";
      case "desc": return "default";
      case "default": return "asc";
    }
  }

  private getSortDirection(column: "date" | "from" | "to" | "amount" | "status" | "note"): "asc" | "desc" | "default" {
    if (this.sortColumn === column) {
      return this.nextSortDirection(this.sortDirection);
    }
    return "asc"; // Default direction for new sort
  }

  sortByDefault() {
    this.transactions.sort((a, b) => { 
      if (a.date_posted !== b.date_posted) {
        return a.date_posted.localeCompare(b.date_posted);
      }
      return a.id - b.id; // Secondary sort by ID to maintain order
    });

  }

  sortByDate() {
    let direction = this.getSortDirection("date");
    this.sortColumn = "date";
    if (direction === "default") direction = "asc"; // default is the same as date ascending

    this.sortDirection = direction;
    switch (direction) {
      case "asc": this.transactions.sort((a, b) => transactionCompareByDate(a, b)); break;
      case "desc": this.transactions.sort((a, b) => transactionCompareByDate(b, a)); break;
    }
  }

  sortByFrom() {
    let direction = this.getSortDirection("from");
    this.sortColumn = "from";
    this.sortDirection = direction;
    switch (direction) {
      case "asc": this.transactions.sort((a, b) => transactionCompareByFrom(a, b, this.accounts)); break;
      case "desc": this.transactions.sort((a, b) => transactionCompareByFrom(b, a, this.accounts)); break;
      case "default": this.sortByDefault(); break;
    }
  }

  sortByTo() {
    let direction = this.getSortDirection("to");
    this.sortColumn = "to";
    this.sortDirection = direction;
    switch (direction) {
      case "asc": this.transactions.sort((a, b) => transactionCompareByTo(a, b, this.accounts)); break;
      case "desc": this.transactions.sort((a, b) => transactionCompareByTo(b, a, this.accounts)); break;
      case "default": this.sortByDefault(); break;
    }
  }

  sortByAmount() {
    let direction = this.getSortDirection("amount");
    this.sortColumn = "amount";
    this.sortDirection = direction;

    switch (direction) {  
      case "asc": this.transactions.sort((a, b) => transactionCompareByAmount(a, b)); break;
      case "desc": this.transactions.sort((a, b) => transactionCompareByAmount(b, a)); break;
      case "default": this.sortByDefault(); break;
    }
  }

  sortByStatus() {
    let direction = this.getSortDirection("status");
    this.sortColumn = "status";
    this.sortDirection = direction;

    switch (direction) {
      case "asc": 
        this.transactions.sort((a, b) => {
          if (a.status !== b.status) {
            return a.status.localeCompare(b.status);
          }
          return transactionCompareByDate(a, b); // Secondary sort by date to maintain order
        });
        break;
      case "desc": 
        this.transactions.sort((a, b) => {
          if (a.status !== b.status) {
            return b.status.localeCompare(a.status);
          }
          return transactionCompareByDate(b, a); // Secondary sort by date to maintain order
        });
        break;
      case "default": this.sortByDefault(); break;
    }
  }

  sortByNote() {
    let direction = this.getSortDirection("note");
    this.sortColumn = "note";
    this.sortDirection = direction;

    switch (direction) {
      case "asc": this.transactions.sort((a, b) =>transactionCompareByNote(a, b)); break;
      case "desc": this.transactions.sort((a, b) => transactionCompareByNote(b, a)); break;
      case "default": this.sortByDefault(); break;
    }
  }
}