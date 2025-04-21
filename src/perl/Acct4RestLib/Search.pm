package Acct4RestLib::Search;

use strict;
use warnings;
use Carp;

use SimpleDB;
use URI::Escape;

use Exporter;
our @ISA = qw/Exporter/;

our @EXPORT = (
    'get_search_params',
    'search_transactions',
);

1;

#--------------------------------------------------------------------------------
#
my @search_keys = (
    'fromType', 'fromCmp', 'fromValue',
    'toType', 'toCmp', 'toValue',
    'statusCmp', 'statusValue',
    'from_date', 'to_date',
    'noteCmp', 'noteRE'
);

#--------------------------------------------------------------------------------
#
sub get_search_params {
    my $cgi = shift;
    my $params = {};

    foreach my $key (@search_keys) {
        my $value = uri_unescape($cgi->param($key));
        $params->{$key} = $value;
    }

    return $params;
}

#--------------------------------------------------------------------------------
#
sub get_cmp_op {
    my $cmp = shift;

    confess "missing cmp value" unless defined $cmp;
    return '=' if $cmp eq 'EQ';
    return '!=' if $cmp eq 'NE';
    confess "unknown cmp value $cmp";
}

#--------------------------------------------------------------------------------
#
sub get_in_op {
    my $cmp = shift;

    confess "missing in value" unless defined $cmp;
    return "in" if $cmp eq 'EQ';
    return "not in" if $cmp eq 'NE';
    confess "unknown in value $cmp";
}

#--------------------------------------------------------------------------------
#
sub get_re_op {
    my $name = shift;

    confess "missing RE operator" unless defined $name;
    return 'regexp' if $name eq 'regexp';
    return 'not regexp' if $name eq 'not-regexp';
    confess "unknown RE operator $name";
}

#--------------------------------------------------------------------------------
#
sub check_not_null {
    my $value = shift;
    confess "missing value" unless defined $value;
    return $value;
}

#--------------------------------------------------------------------------------
#
sub search_transactions {
    my $params = shift;

    my $group_query = '(select account_id from account_group_rollup where account_group_id=?)';
    my @where_clause = ();
    my @where_values = ();
    if ($params->{fromType}) {
        if ($params->{fromType} eq 'account') {
            push @where_clause, 'from_id' . get_cmp_op($params->{fromCmp}) . '?';
            push @where_values, check_not_null($params->{fromValue});
        } elsif ($params->{fromType} eq 'group') {
            push @where_clause, 'from_id ' . get_in_op($params->{fromCmp}) . ' ' . $group_query;
            push @where_values, check_not_null($params->{fromValue});
        } else {
            die "unknown fromType $params->{fromType}";
        }
    }

    if ($params->{toType}) {
        if ($params->{toType} eq 'account') {
            push @where_clause, 'to_id' . get_cmp_op($params->{toCmp}) . '?';
            push @where_values, check_not_null($params->{toValue});
        } elsif ($params->{toType} eq 'group') {
            push @where_clause, 'to_id ' . get_in_op($params->{toCmp}) . ' ' . $group_query;
            push @where_values, check_not_null($params->{toValue});
        } else {
            die "unknown toType $params->{toType}";
        }
    }

    if ($params->{statusCmp}) {
        push @where_clause, 'status' . get_cmp_op($params->{statusCmp}) . '?';
        push @where_values, check_not_null($params->{statusValue});
    }

    if ($params->{from_date}) {
        push @where_clause, 'date_posted>=?';
        push @where_values, $params->{from_date};
    }

    if ($params->{to_date}) {
        push @where_clause, 'date_posted<=?';
        push @where_values, $params->{to_date};
    }

    if ($params->{noteCmp}) {
        push @where_clause, "ifnull(note,'') " . get_re_op($params->{noteCmp}) . ' ?';
        push @where_values, check_not_null($params->{noteRE});
    }

    my $query = 'select * from transactions where ' . join(' and ', @where_clause);
    $query .= ' order by date_posted, sort_order, id';
    return sdb_query_to_array($query, \@where_values);
}