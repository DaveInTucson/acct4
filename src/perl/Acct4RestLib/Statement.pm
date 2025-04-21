package Acct4RestLib::Statement;

use strict;
use warnings;

use SimpleDB;

use Exporter;
our @ISA = qw/Exporter/;

our @EXPORT = (
    'statement_get',
    'transaction_create',
    'transaction_update',
);

use Acct4RestLib::Accounts;
use Acct4RestLib::CalDate;

1;

sub statement_get {
    my ($account_id, $from_date, $to_date) = @_;

    my $accounts = accounts_get_all();

    my ($n_from_date, $n_to_date) = normalize_date_range($from_date, $to_date);
    my $transactions = get_transactions($account_id, $n_from_date, $n_to_date);

    my ($pending_opening_balance, $cleared_opening_balance) = get_balances($account_id, $n_from_date);

    my $groups = get_groups_for_account($account_id);

    return {
        account_id => $account_id,
        from_date => $from_date,
        to_date => $to_date,
        accounts => $accounts,
        pending_opening_balance => $pending_opening_balance,
        cleared_opening_balance => $cleared_opening_balance,
        transactions => $transactions,
        groups => $groups,
    };
}

sub get_transactions
{
    my ($account_id, $from_date, $to_date) = @_;

    my $query = 'select * from transactions ' .
        'where ? in (from_id, to_id) and date_posted between ? and ? ' .
        'order by date_posted, sort_order, id';
    my $transactions = sdb_query_to_array($query, [$account_id, $from_date, $to_date]);

    return $transactions;
}

sub get_balances
{
    my ($account_id, $from_date) = @_;

    my $query = "select " . 
        "sum(if(to_id=? and status='pending', amount, 0)) pending_deposits, " .
        "sum(if(from_id=? and status='pending', amount, 0)) pending_withdrawals, " .
        "sum(if(to_id=? and status='cleared', amount, 0)) cleared_deposits, " .
        "sum(if(from_id=? and status='cleared', amount, 0)) cleared_withdrawals " .
        "from transactions where ? in (from_id, to_id) and date_posted < ? ";

    my $result = sdb_query_unique($query, 
        [$account_id, $account_id, $account_id, $account_id, $account_id, $from_date]);
    my $pending_deposits = $result->{pending_deposits} || 0;
    my $pending_withdrawals = $result->{pending_withdrawals} || 0;
    my $cleared_deposits = $result->{cleared_deposits} || 0;
    my $cleared_withdrawals = $result->{cleared_withdrawals} || 0;

    my $cleared_opening_balance = $cleared_deposits - $cleared_withdrawals;
    my $pending_opening_balance = $cleared_opening_balance + $pending_deposits - $pending_withdrawals;

    return (money_round($pending_opening_balance), money_round($cleared_opening_balance));
}

# sub normalize_dates
# {
#     my ($from, $to) = @_;

#     if (!defined $from && !defined $to)
#     {
#         # to = today, from = a month ago
#     }
#     if (!defined $from)
#     {
#         $from = new Acct4RestLib::CalDate($to)->month_before()->to_string();
#     }
#     if (!defined $to)
#     {
#         $to = new Acct4RestLib::CalDate($from)->month_after()->to_string();
#     }
#     if ($from gt $to)
#     {
#         ($to, $from) = ($from, $to);
#     }

#     return ($from, $to);
# }

sub get_groups_for_account {
    my $account_id = shift;

    my $query = 'select ag.* from account_groups ag ' .
        'join account_group_rollup agr on ag.id=agr.account_group_id ' .
        'where agr.account_id=?';

    return sdb_query_to_array($query, [$account_id]);
}

sub transaction_create {
    my $transaction = shift;

    die "transaction must have a date_posted" unless defined $transaction->{date_posted};
    die "transaction must have a from_id" unless defined $transaction->{from_id};
    die "transaction must have a to_id" unless defined $transaction->{to_id};
    die "transaction already has an id" if defined $transaction->{id} && $transaction->{id} != 0;

    my $query = "insert into transactions set " .
        "date_posted=?, from_id=?, to_id=?, amount=?, status=?, note=?, sort_order=?";

    sdb_execute($query,
        [$transaction->{date_posted},
        $transaction->{from_id}, $transaction->{to_id}, $transaction->{amount},
        $transaction->{status}, $transaction->{note}, $transaction->{sort_order}]);

    my $result = sdb_query_unique('select last_insert_id() id');
    my $id = $result->{id};
    $transaction->{id} = $id;
    return $transaction;
}

sub transaction_update {
    my $transaction = shift;
    die "transaction must have a date_posted" unless defined $transaction->{date_posted};
    die "transaction must have a from_id" unless defined $transaction->{from_id};
    die "transaction must have a to_id" unless defined $transaction->{to_id};
    die "transaction must have an id" unless defined $transaction->{id} && $transaction->{id} != 0;

    my $query = "update transactions set " .
        "date_posted=?, from_id=?, to_id=?, amount=?, status=?, note=?, sort_order=? " .
        "where id=?";

    sdb_execute($query,
        [$transaction->{date_posted},
        $transaction->{from_id}, $transaction->{to_id}, $transaction->{amount},
        $transaction->{status}, $transaction->{note}, $transaction->{sort_order}, $transaction->{id}]);

    return $transaction;
}

sub money_round
{
    my $value = shift;
    return int($value * 100 + 0.5)/100;
}