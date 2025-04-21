create or replace view view_group_deposits as
    select ag.id group_id, t.* 
    from account_groups ag 
    join transactions t 
    on to_id        in (select account_id from account_group_rollup where account_group_id=ag.id) 
    and from_id not in (select account_id from account_group_rollup where account_group_id=ag.id)
    where to_id != 0 and from_id != 0 and status!='void';
