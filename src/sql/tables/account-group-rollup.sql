drop table if exists account_group_rollup;

create table account_group_rollup (
    account_id int not null,
    account_group_id int not null,
    primary key(account_id, account_group_id),
    key (account_group_id)
);