import { Account, getAccountByID } from "./account";

export interface DateRange {
    fromDate: string | null,
    toDate: string | null
};

export interface Transaction {
    date_posted: string
    from_id: number,
    to_id: number,
    id: number,
    amount: number,
    status: 'pending' | 'cleared' | 'void',
    sort_order: number,
    note: string | null
};

export interface Statement {
    account_id: number,
    from_date: string | null,
    to_date: string | null,
    accounts: Account[],
    pending_opening_balance: number,
    cleared_opening_balance: number,
    transactions: Transaction[]
};

export function transactionCompareByDate(a: Transaction, b: Transaction): number {
    if (a.date_posted !== b.date_posted) {
        return a.date_posted.localeCompare(b.date_posted);
    }
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.id - b.id; // Secondary sort by ID to maintain order
}

export function transactionCompareByFrom(a: Transaction, b: Transaction, accounts: Account[]): number {
    const fromA = getAccountByID(accounts, a.from_id);
    const fromB = getAccountByID(accounts, b.from_id);
    if (fromA.name !== fromB.name) {
        return fromA.name.localeCompare(fromB.name);
    }
    return transactionCompareByDate(a, b); // Secondary sort by date to maintain order
}

export function transactionCompareByTo(a: Transaction, b: Transaction, accounts: Account[]): number {
    const toA = getAccountByID(accounts, a.to_id);
    const toB = getAccountByID(accounts, b.to_id);
    if (toA.name !== toB.name) {
        return toA.name.localeCompare(toB.name);
    }
    return transactionCompareByDate(a, b); // Secondary sort by date to maintain order
}   

export function transactionCompareByAmount(a: Transaction, b: Transaction): number {
    if (a.amount !== b.amount) {
        return a.amount - b.amount;
    }
    return transactionCompareByDate(a, b); // Secondary sort by date to maintain order
}

export function transactionCompareByStatus(a: Transaction, b: Transaction): number {
    if (a.status !== b.status) {
        const statusOrder = { 'pending': 0, 'cleared': 1, 'void': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
    }
    return transactionCompareByDate(a, b); // Secondary sort by date to maintain order
}

export function transactionCompareByNote(a: Transaction, b: Transaction): number {
    if (a.note && b.note) return a.note.localeCompare(b.note);
    if (a.note && !b.note) return -1; // a has note, b does not
    if (!a.note && b.note) return 1; // b has note, a does not
    return transactionCompareByDate(a, b); // Secondary sort by date to maintain order
}