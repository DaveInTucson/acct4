package Acct4RestLib::Groups;

use strict;
use warnings;

use SimpleDB;

use Exporter;
our @ISA = qw/Exporter/;

our @EXPORT = (
    'group_get_all',
    'group_create',
    'group_update',
    'group_add_member',
    'group_remove_member',
    'group_get_in_and_out',
    'group_get_summary',
);

use Acct4RestLib::CalDate;

1;

#--------------------------------------------------------------------------------
#
sub group_get_all
{
    my $groups = sdb_query_to_array('select * from account_groups order by name');
    foreach my $group (@$groups) {
        $group->{members} = [];
    }

    my $members = sdb_query_to_array('select * from account_group_rollup');
    for my $member (@$members)
    {
        my $group = get_group_by_id($groups, $member->{account_group_id});
        die "no group for id $member->{account_group_id}" unless defined $group;

        push @{$group->{members}}, $member->{account_id};
    }

    return $groups;
}

#--------------------------------------------------------------------------------
#
sub group_get
{
    my $group_id = shift;

    die "group_id is null or 0" unless defined $group_id and $group_id != 0;

    my $group = sdb_query_unique("select * from account_groups where id=?", [$group_id]);
    my $memberRef = sdb_query_to_array("select account_id from account_group_rollup where account_group_id=?", [$group_id]);
    my @members = map { $_->{account_id} } @$memberRef;
    $group->{members} = \@members;

    return $group;
}

#--------------------------------------------------------------------------------
#
sub get_group_by_id
{
    my ($groups, $group_id) = @_;

    foreach my $group (@$groups) {
        return $group if $group->{id} == $group_id;
    }

    return undef;
}

#--------------------------------------------------------------------------------
#
sub group_create
{
    my $group = shift;
    die "group is null" unless defined $group;
    die "group doesn't have a name" unless defined $group->{name};
    die "group already has an id" if defined $group->{id} && $group->{id} != 0;

    my $query = "insert into account_groups set name=?";

    sdb_execute($query, [$group->{name}]);

    my $result = sdb_query_unique('select last_insert_id() id');
    my $id = $result->{id};
    $group->{id} = $id;
    $group->{members} = [];
    return $group;
}

#--------------------------------------------------------------------------------
#
sub group_update
{
    my $group = shift;
    die "group is null" unless defined $group;
    die "group doesn't have a name" unless defined $group->{name};
    die "group doesn't has an id" unless defined $group->{id} && $group->{id} != 0;

    my $query = "update account_groups set name=? where id=?";

    sdb_execute($query, [$group->{name}, $group->{id}]);

    return $group;
}

#--------------------------------------------------------------------------------
#
sub group_add_member
{
    my ($group_id, $account_id) = @_;

    die "group_id is null or 0" unless defined $group_id && $group_id != 0;
    die "account_id is not defined" unless defined $account_id;
    die "account_id is 0" unless $account_id != 0;

    my $query = "insert into account_group_rollup " .
        "set account_group_id=?, account_id=?";

    sdb_execute($query, [$group_id, $account_id]);
    return 1;
}

#--------------------------------------------------------------------------------
#
sub group_remove_member
{
    my ($group_id, $account_id) = @_;

    die "group_id is null or 0" unless defined $group_id && $group_id != 0;
    die "account_id is not defined" unless defined $account_id;
    die "account_id is 0" unless $account_id != 0;

    my $query = "delete from account_group_rollup " .
        "where account_group_id=? and account_id=?";

    sdb_execute($query, [$group_id, $account_id]);
    return 1;
}

#--------------------------------------------------------------------------------
#
sub group_get_in_and_out
{
    my ($group_id, $from_date, $to_date) = @_;
    die "group_id is undefined or 0" unless defined $group_id && $group_id != 0;
    my ($n_from_date, $n_to_date) = normalize_date_range($from_date, $to_date);

    return {
        group     => group_get($group_id),
        from_date => $from_date,
        to_date   => $to_date,
        deposits  => get_group_deposits($group_id, $n_from_date, $n_to_date),
        transfers => get_group_transfers($group_id, $n_from_date, $n_to_date),
        withdrawals => get_group_withdrawals($group_id, $n_from_date, $n_to_date)
    };
}

#--------------------------------------------------------------------------------
#
sub get_group_deposits
{
    my ($group_id, $from_date, $to_date) = @_;

    my $query = "select * from view_group_deposits where group_id=? and date_posted between ? and ? " .
        "order by date_posted, sort_order, id";

    return sdb_query_to_array($query, [$group_id, $from_date, $to_date]);
}

#--------------------------------------------------------------------------------
#
sub get_group_transfers
{
    my ($group_id, $from_date, $to_date) = @_;

    my $query = "select * from view_group_transfers where group_id=? and date_posted between ? and ? " .
        "order by date_posted, sort_order, id";

    return sdb_query_to_array($query, [$group_id, $from_date, $to_date]);
}

#--------------------------------------------------------------------------------
#
sub get_group_withdrawals
{
    my ($group_id, $from_date, $to_date) = @_;

    my $query = "select * from view_group_withdrawals where group_id=? and date_posted between ? and ? " .
        "order by date_posted, sort_order, id";
        
    return sdb_query_to_array($query, [$group_id, $from_date, $to_date]);
}


#--------------------------------------------------------------------------------
#
sub group_get_summary
{
    my ($group_id, $from_date, $to_date) = @_;

    my ($n_from_date, $n_to_date) = normalize_date_range($from_date, $to_date);

    my $account_balances = sdb_query_to_array("call select_group_summary_balances(?, ?, ?)", 
        [$group_id, $n_from_date, $n_to_date]);
    
    my $query = "select * from view_group_summary " .
        "where group_id=? and date_posted between ? and ? order by date_posted";
    
    my $deltas = sdb_query_to_array($query, [$group_id, $n_from_date, $n_to_date]);

    return {
        group_id         => $group_id,
        from_date        => $from_date,
        to_date          => $to_date,
        account_balances => $account_balances,
        deltas           => $deltas,
        n_from_date      => $n_from_date,
        n_to_date        => $n_to_date,
    }
}
