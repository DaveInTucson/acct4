drop procedure if exists select_group_account_balances;

delimiter $$

create procedure select_group_account_balances(
    p_group_id int,
    p_max_date date
)
begin
    select agr.account_group_id group_id, agr.account_id, ifnull(sum(if(agr.account_id=to_id,amount,-amount)), 0) balance 
    from account_group_rollup agr 
    left join (select * from transactions where status!='void' date_posted < p_max_date) t on agr.account_id in (to_id, from_id) 
    where account_group_id=p_group_id
    group by agr.account_group_id, agr.account_id;
end $$

delimiter ;