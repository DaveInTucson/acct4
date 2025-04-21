create or replace view view_group_combined as
    select group_id, date_posted, amount, 'd' type from view_group_deposits 
union 
    select group_id, date_posted, amount, 'w' type from view_group_withdrawals;
