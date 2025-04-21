drop function if exists first_of_month;

delimiter $$

create function first_of_month(
    p_date date
    ) returns date deterministic
begin
    return subdate(p_date, interval day(p_date)-1 day);
end $$

delimiter ;
