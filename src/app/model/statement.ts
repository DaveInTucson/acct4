import { Account } from "./account";

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
