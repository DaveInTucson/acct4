enum TransactionStatus { pending, cleared, void };

interface Transaction {
    id: number;
    date_posted: string;
    from_id: number;
    to_id: number;
    amount: number;
    sort_order: number;
    status: TransactionStatus;
    note: string | null;
}