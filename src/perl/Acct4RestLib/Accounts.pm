package Acct4RestLib::Accounts;

use strict;
use warnings;

use SimpleDB;

use Exporter;
our @ISA = qw/Exporter/;

our @EXPORT = (
    'accounts_get_all',
    'accounts_get_table',
    'accounts_get_account',
    'accounts_get_groups',
    'accounts_create',
    'accounts_update',
);

1;

sub accounts_get_all
{
    return sdb_query_to_array('select * from accounts order by account_status_sort_order(status), sort_order, name');
}

sub accounts_get_account
{
    my $account_id = shift;
    return sdb_query_unique("select * from accounts where id=?", [$account_id])
}

sub accounts_get_groups
{
    my $account_id = shift;
    die "null or 0 account ID" unless defined $account_id && $account_id != 0;

    my $query = "select g.* from account_groups g " .
        "join account_group_rollup ag on g.id=account_group_id where account_id=?";

    return sdb_query_to_array($query, [$account_id]);
}

sub accounts_create
{
    my $account = shift;
    die "account is null" unless defined $account;
    die "account already has an id" if $account->{id} && $account->{id} != 0;

    my $query = "insert into accounts set name=?, status=?, sort_order=?";
    sdb_execute($query, [$account->{name}, $account->{status}, $account->{sort_order}]);

    my $result = sdb_query_unique('select last_insert_id() id');
    my $id = $result->{id};
    $account->{id} = $id;
    return $account;
}

sub accounts_update
{
    my $account = shift;
    die "account is null" unless defined $account;
    die "account has no id" unless defined $account->{id} && $account->{id} != 0;

    my $query = "update accounts set name=?, status=?, sort_order=? where id=?";
    sdb_execute($query, [$account->{name}, $account->{status}, $account->{sort_order}, $account->{id}]);
    return $account;
}