package Acct4RestLib::Main;

use strict;
use warnings;

use Exporter;
our @ISA = qw/Exporter/;

our @EXPORT = qw/acct4_rest_main/;

use SimpleDB;
use RestApp;

use Acct4RestLib::Accounts;
use Acct4RestLib::Statement;
use Acct4RestLib::Groups;
use Acct4RestLib::Search;

1;

#------------------------------------------------------------------------------
#
sub acct4_rest_main
{
    sdb_config(@_);

    my $app = new RestApp();

    if (!$app->client_is_local())
    {
        $app->rest_handler_error(403, 'Forbidden', 'localhost access only');
        exit(0);
    }

    $app->set_flags(
        -charset => 'utf-8',
        -access_control_allow_origin => '*'
        );

    enable_cors($app);
    add_accounts($app);
    add_statement($app);
    add_group($app);
    add_search($app);

    $app->listen();
}

#------------------------------------------------------------------------------
#
sub enable_cors 
{
    my $app = shift;

    $app->options(
        qr/.*/,
        sub {
            $app->send_headers(
                -status => '204 No Content',
                -access_control_allow_methods => 'OPTIONS, GET, POST, PUT, DELETE',
                -access_control_allow_headers => 'X-PINGOTHER, Content-Type',
                );
            print "\n";
        });
}

#------------------------------------------------------------------------------
#
sub add_accounts
{
    my $app = shift;

    $app->get(
        '/accounts',
        sub  {
            my $ctx = shift;
            $app->return_as_json(accounts_get_all());
        });

    $app->get(
        qr|/accounts/(\d+)|,
        sub {
            my $ctx = shift;
            my $account_id = $ctx->{args}->[0];
            $app->return_as_json(accounts_get_account($account_id));
        });

    $app->post(
        qr|/accounts|,
        sub {
            my $ctx = shift;
            my $account = $ctx->{data};
            $app->return_as_json(accounts_create($account));    
        });

    $app->put(
        '/accounts',
        sub {
            my $ctx = shift;
            my $account = $ctx->{data};
            $app->return_as_json(accounts_update($account));
        });

    $app->get(
        qr|/accounts/(\d+)/groups|,
        sub {
            my $ctx = shift;
            my $account_id = $ctx->{args}->[0];
            $app->return_as_json(accounts_get_groups($account_id));
        });
}

sub add_statement {
    my $app = shift;

    $app->get(
        qr|/statement/(\d+)|,
        sub {
            my $ctx = shift;
            my $account_id = $ctx->{args}->[0];
            my $from_date = $ctx->{cgi}->param('from');
            my $to_date = $ctx->{cgi}->param('to');
            $app->return_as_json(statement_get($account_id, $from_date, $to_date));
        }
    );

    $app->post(
        qr|/transaction|,
        sub {
            my $ctx = shift;
            my $transaction = $ctx->{data};
            $app->return_as_json(transaction_create($transaction));
        }
    );

        $app->put(
        qr|/transaction|,
        sub {
            my $ctx = shift;
            my $transaction = $ctx->{data};
            $app->return_as_json(transaction_update($transaction));
        }
    );
}

sub add_group {
    my $app = shift;

    $app->get(
        qr|/group|,
        sub {
            $app->return_as_json(group_get_all());
        });
   
    $app->post(
        qr|/group|,
        sub {
            my $ctx = shift;
            my $group = $ctx->{data};
            $app->return_as_json(group_create($group));
        });

    $app->put(
        qr|/group|,
        sub {
            my $ctx = shift;
            my $group = $ctx->{data};
            $app->return_as_json(group_update($group));
        });

    $app->post(
        qr|/group/(\d+)/member|,
        sub {
            my $ctx = shift;
            my $group_id = $ctx->{args}->[0];
            my $account_id = $ctx->{data};
            $app->return_as_json(group_add_member($group_id, $account_id));
        });

    $app->delete(
        qr|/group/(\d+)/member/(\d+)|,
        sub {
            my $ctx = shift;
            my ($group_id, $account_id) = ($ctx->{args}->[0], $ctx->{args}->[1]);
            $app->return_as_json(group_remove_member($group_id, $account_id));
        });

    $app->get(
        qr|/group/(\d+)/in-and-out|,
        sub {
            my $ctx = shift;
            my $group_id = $ctx->{args}->[0];
            my $from_date = $ctx->{cgi}->param('from');
            my $to_date = $ctx->{cgi}->param('to');
            $app->return_as_json(group_get_in_and_out($group_id, $from_date, $to_date));
        });

    $app->get(
        qr|/group/(\d+)/summary|,
        sub {
            my $ctx = shift;
            my $group_id = $ctx->{args}->[0];
            my $from_date = $ctx->{cgi}->param('from');
            my $to_date = $ctx->{cgi}->param('to');
            $app->return_as_json(group_get_summary($group_id, $from_date, $to_date));
        }
    )
}

sub add_search {
    my $app = shift;

    $app->get(
        qr|/search|,
        sub {
            my $ctx = shift;
            my $search_parms = get_search_params($ctx->{cgi});
            $app->return_as_json(search_transactions($search_parms));
        });
}