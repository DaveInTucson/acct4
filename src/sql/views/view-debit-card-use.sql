create or replace view view_debit_card_use as
    select t.date_posted, a.name, amount, note
    from transactions t join accounts a on to_id=a.id
    where from_id=4 and t.status!='void' and ifnull(note,'') not regexp 'check #'
    and to_id not in (select account_id from account_group_rollup agr join account_groups ag on agr.account_group_id=ag.id and ag.name='Schaumann Deposit Accounts')
    ;
