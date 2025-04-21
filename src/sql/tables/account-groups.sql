drop table if exists account_groups;

create table account_groups (
    id int not null auto_increment,
    name varchar(255) not null,
    parent_id int,
    unique key(name),
    primary key(id),
    key(parent_id)
);