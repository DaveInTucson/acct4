drop table if exists transactions;

create table transactions (
  id int not null auto_increment,
  date_posted date NOT NULL,
  from_id int NOT NULL,
  to_id int NOT NULL,
  amount decimal(10,2) NOT NULL,
  status enum('pending','cleared','void') NOT NULL DEFAULT 'pending',
  note varchar(256) DEFAULT NULL,
  sort_order smallint NOT NULL default 0,

  PRIMARY KEY (id),
  key(date_posted),
  index(sort_order),
  index (from_id),
  index (to_id)
);