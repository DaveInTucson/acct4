create or replace view view_group_transfers as
    select ag.id group_id, t.* 
    from account_groups ag 
    join transactions t 
    on to_id    in (select account_id from account_group_rollup where account_group_id=ag.id) 
    and from_id in (select account_id from account_group_rollup where account_group_id=ag.id)
    where status!='void';