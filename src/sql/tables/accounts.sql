drop table if exists accounts;

create table accounts (
  id int not null auto_increment,
  name varchar(255) NOT NULL,
  status enum('pinned','active', 'secondary', 'closed') default 'active',
  sort_order int not null default 1,
  unique key name (name),
  primary key  (id)
);
