drop function if exists account_status_sort_order;

delimiter $$

create function account_status_sort_order(
    status enum('pinned','active','secondary','closed')
    ) returns int
begin
    return case
        when status = 'pinned' then 1
        when status = 'active' then 2
        when status = 'secondary' then 3
        when status = 'closed' then 4
        else 5
    end;
end $$

delimiter ;
