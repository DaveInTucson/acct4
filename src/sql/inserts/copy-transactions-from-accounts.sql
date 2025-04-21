/* This will copy existing transactions from the old accounts.transactions2 table into the new acct4.transactions table.
 * USE WITH CAUTION as this will erase any existing data n the acct4.transactions table.
 */
use acct4;
truncate transactions;
insert into transactions (date_posted, from_id, to_id, amount, status, note) select date_posted, from_id, to_id,
amount, status, note from accounts.transactions2 order by date_posted, id;