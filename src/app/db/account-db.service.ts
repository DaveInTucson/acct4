import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Account, Group, GroupSummary  } from '../model/account';
import { Config } from '../util/config';
import { Statement, Transaction } from '../model/statement';
import { makeHttpSearchParams, SearchParms } from '../model/search';

const accountsBaseURL = `${Config.baseServerURL}/accounts`;
const statementBaseURL = `${Config.baseServerURL}/statement`;
const transactionBaseURL = `${Config.baseServerURL}/transaction`;
const groupBaseURL = `${Config.baseServerURL}/group`;
const searchBaseURL = `${Config.baseServerURL}/search`;

function makeDateQuery(fromDate: string | null, toDate: string | null): string {
  let queries = []
  if (fromDate !== null) queries.push(`from=${fromDate}`);
  if (toDate   !== null) queries.push(`to=${toDate}`);
  if (queries.length > 0) 
    return '?' + queries.join('&');

  return '';
}

@Injectable({
  providedIn: 'root'
})
export class AccountDBService {

  constructor(private http: HttpClient) { }

  getAccountAll(): Observable<Account[]> {
    return this.http.get<Account[]>(accountsBaseURL);
  }

  getAccount(id: number): Observable<Account> {
    return this.http.get<Account>(`${accountsBaseURL}/${id}`)
  }

  createAccount(newAccount: Account): Observable<Account> {
    return this.http.post<Account>(accountsBaseURL, newAccount)
  }

  updateAccount(account: Account): Observable<Account> {
    return this.http.put<Account>(accountsBaseURL, account);
  }

  deleteAccount(accountID: number): Observable<void> {
    return this.http.delete<void>(`${accountsBaseURL}/${accountID}`);
  }

  getAccountGroups(accountID: number): Observable<Group[]> {
    return this.http.get<Group[]>(`${accountsBaseURL}/${accountID}/groups`);
  }
  
  getStatement(accountID: number, fromDate: string | null, toDate: string | null): Observable<Statement> {
    let url = `${statementBaseURL}/${accountID}`;
    let queries = []
    if (fromDate !== null) queries.push(`from=${fromDate}`);
    if (toDate   !== null) queries.push(`to=${toDate}`);
    if (queries.length > 0) 
      url += '?' + queries.join('&');
    return this.http.get<Statement>(url);
  }

  createTransaction(newTransaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(transactionBaseURL, newTransaction);
  }

  updateTransaction(updatedTransaction: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(transactionBaseURL, updatedTransaction);
  }

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(groupBaseURL);
  }

  createGroup(newGroup: Group): Observable<Group> {
    return this.http.post<Group>(groupBaseURL, newGroup);
  }

  updateGroup(updatedGroup: Group): Observable<Group> {
    return this.http.put<Group>(groupBaseURL, updatedGroup);
  }

  addGroupMember(groupID: number, accountID: number): Observable<Number> {
    return this.http.post<number>(`${groupBaseURL}/${groupID}/member`, accountID);
  }

  removeGroupMember(groupID: number, accountID: number): Observable<Number> {
    return this.http.delete<number>(`${groupBaseURL}/${groupID}/member/${accountID}`);
  }

  getGroupInAndOut(groupID: number, from: string | null, to: string | null): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${groupBaseURL}/${groupID}/in-and-out${makeDateQuery(from, to)}`);
  }

  getGroupSummary(groupID: number, from: string | null, to: string | null): Observable<GroupSummary> {
    return this.http.get<GroupSummary>(`${groupBaseURL}/${groupID}/summary${makeDateQuery(from, to)}`);
  }

  searchTransactions(searchParms: SearchParms) : Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${searchBaseURL}`, { params: makeHttpSearchParams(searchParms) });
  }
}
