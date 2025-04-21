package Acct4RestLib::CalDate;

use strict;
use warnings;
use Carp;

use Exporter;
our @ISA = qw/Exporter/;

our @EXPORT = (
    'normalize_date_range',
    );

use Object::Attributes qw/year month day/;

1;

#------------------------------------------------------------------------------
#
sub new
{
    my $caller = shift;
    my $class  = ref($caller) || $caller;

    my $self = bless {}, $class;
    $self->setDate(@_);
    return $self;
}

#------------------------------------------------------------------------------
#
sub setDate
{
    my $self = shift;
    my $yyyymmdd = $_[0];

    if (defined $yyyymmdd && $yyyymmdd =~ /^(\d\d\d\d)-(\d\d)-(\d\d)/)
    {
        $self->year($1);
        $self->month($2);
        $self->day($3);
    }
    elsif (3 == @_)
    {
        $self->year($_[0]);
        $self->month($_[1]);
        $self->day($_[2]);
    }
    elsif (@_ == 0 || !defined $_[0])
    {
        my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = localtime();
        $self->year($year + 1900);
        $self->month($mon + 1);
        $self->day($mday);
    }
    else
    {
        carp "don't know how to make a date from (", join(',', @_, ")");
    }
}

#------------------------------------------------------------------------------
#
sub ymd
{
    my $self = shift;
    return ($self->year, $self->month, $self->day);
}

#------------------------------------------------------------------------------
#
sub month_before
{
    my $self = shift;
    my ($year, $month, $date) = $self->ymd;
    $month--;
    if ($month < 1) {
        $year--;
        $month += 12;
    }

    return new Acct4RestLib::CalDate($year, $month, $date)
}

#------------------------------------------------------------------------------
#
sub month_after
{
    my $self = shift;
    my ($year, $month, $date) = $self->ymd;
    $month++;
    if ($month > 12) {
        $year++;
        $month -= 12;
    }

    return new Acct4RestLib::CalDate($year, $month, $date)
}

sub to_string
{
    my $self = shift;
    my ($y, $m, $d) = $self->ymd;
    return sprintf("%d-%02d-%02d", $y, $m, $d);
}

sub normalize_date_range
{
    my ($from, $to) = @_;

    # if neither dates are defined, set $from to a month prior to current date
    if (!defined $from && !defined $to)
    {
        $from = new Acct4RestLib::CalDate()->month_before()->to_string();
    }

    # only one specified date corresponds to an open-ended range
    $from = '0001-01-01' unless defined $from;
    $to   = '9999-12-31' unless defined $to;

    # make sure they're in ascending order
    if (defined $to && $from gt $to)
    {
        ($to, $from) = ($from, $to);
    }

    return ($from, $to);
}
