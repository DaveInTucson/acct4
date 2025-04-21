import { Transaction } from 'src/app/model/statement';

//----------------------------------------------------------------------
//
export interface Group {
    id: number;
    name: string;
    members: number[] | null;
}

//----------------------------------------------------------------------
//
export interface Account {
    id: number;
    name: string;
    status: string;
    sort_order: number | null;
    groups: Group[];
}

//----------------------------------------------------------------------
//
export interface AccountTable {
    pinned: Account[];
    active: Account[];
    secondary: Account[];
    closed: Account[];
}

//----------------------------------------------------------------------
//
export interface GroupMembersAndNonMembers {
    members: Account[];
    nonmembers: Account[];
}

//----------------------------------------------------------------------
//
export interface GroupContainersAndNonContainers {
    containers: Group[];
    noncontainers: Group[];
}

//----------------------------------------------------------------------
//
export interface GroupInAndOut {
    group: Group;
    from_date: string | null;
    to_date: string | null;
    deposits: Transaction[];
    transfers: Transaction[];
    withdrawals: Transaction[];
}

//----------------------------------------------------------------------
//
export interface GroupDateAndDelta {
    date_posted: string;
    delta: number;
}

//----------------------------------------------------------------------
//
export interface AccountBalance {
    account_id: number;
    from_balance: number;
    to_balance: number;
}

//----------------------------------------------------------------------
//
export interface GroupSummary {
    group_id: number;
    from_date: string | null;
    to_date: string | null;
    account_balances: AccountBalance[];
    deltas: GroupDateAndDelta[];
}

//----------------------------------------------------------------------
//
export function getGroupByID(groups: Group[], id: number) : Group | null {
    return groups.find( group => group.id === id ) ?? null;
}

//----------------------------------------------------------------------
//
export function getGroupByName(groups: Group[], name: string) : Group | null {
    return groups.find( (group) => group.name == name ) ?? null
}

//----------------------------------------------------------------------
//
export function getMembersAndNonMembers(accounts: Account[], memberIDs: number[]): GroupMembersAndNonMembers {
    let members: Account[] = [];
    let nonmembers: Account[] = [];

    accounts.forEach(account => {
        if (memberIDs.includes(account.id)) {
            members.push(account);
        }
        else
            nonmembers.push(account);
    });

    return {members, nonmembers};
}

//----------------------------------------------------------------------
//
export function getGroupContainersAndNonContainers(accountID: number, groups: Group[]) : GroupContainersAndNonContainers {
    let containers: Group[] = [];
    let noncontainers: Group[] = [];

    groups.forEach(group => {
        if (group.members && group.members.includes(accountID)){
            containers.push(group);
        }
        else{
            noncontainers.push(group);
        }
    });

    return {containers, noncontainers};
}

//----------------------------------------------------------------------
//
export function getAccountByID(accounts: Account[], id: number) : Account | null {
    return accounts.find( account => account.id === id ) ?? null;
}

//----------------------------------------------------------------------
//
export function getAccountByName(accounts: Account[], name: string) : Account | null {
    return accounts.find( account => account.name === name ) ?? null;
}

//----------------------------------------------------------------------
//
const statusOrder: { [key: string]: number } = {
    pinned: 1,
    active: 2,
    secondary: 3,
    closed: 4
  };

  
//----------------------------------------------------------------------
//
export function updateAccount(accounts: Account[], updatedAccount: Account) {
    for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].id !== updatedAccount.id) continue;
        accounts[i] = updatedAccount;
        break;
    }

    accounts.sort((a, b) => {
        if (a.status !== b.status) return statusOrder[a.status] - statusOrder[b.status];
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });
}


//----------------------------------------------------------------------
//
export function makeAccountTable(accounts: Account[]) : AccountTable {
    let table : AccountTable = { pinned: [], active: [], secondary: [], closed: [] };

    for (let account of accounts) {
        switch (account.status) {
            case 'pinned': table.pinned.push(account); break;
            case 'active': table.active.push(account); break;
            case 'secondary': table.secondary.push(account); break;
            case 'closed': table.closed.push(account); break;
        }
    }

    return table;
}

//----------------------------------------------------------------------
//
export function getAccountTableLength(accountTable: AccountTable | null) : number {
    if (null === accountTable) return 0;
    return accountTable.pinned.length + accountTable.active.length + accountTable.secondary.length + accountTable.closed.length;
}
